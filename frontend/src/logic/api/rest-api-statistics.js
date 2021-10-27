import moment from 'moment'
import { fetchRecords } from './rest-api-esb'
import { timeSpent, keysAndRowToObject } from '../utils'
import Log from '../../log'
import crossfilter from 'crossfilter2'
import { STATISTIC } from '../mock/statistic'
import { getConfigurationValue } from '../configuration'
import { getEsbUrl } from './api-dashboard'
import { sendInfo } from '../../App'

const log = Log('rest-api-statistics')

export const TIMING_BREAKPOINTS = [0, 10, 50, 100, 250, 500, 1000, 10000, 60000]
export const TIMING_BUS_BREAKPOINTS = [0, 5, 10, 20, 50, 100, 250, 1000]

const partition = breakpoints => v => {
  for (let i = 0; i < breakpoints.length; i++) {
    if (v > breakpoints[i]) continue
    return i
  }
  return breakpoints.length
}

const getDomain = text => {
  switch(text){
    case 'wrk':
    case 'workflow':
    case 'postkorb':
      return 'Workflow'
    case 'vtr':
    case 'vertrag':
    case 'leben':
    case 'komposit':
      return 'Vertrag'
    case 'veb':
    case 'vertrieb':
      return 'Vertrieb'
    case 'par':
    case 'partner':
    case 'Partner':
      return 'Partner'
    case 'knd':
    case 'kunde':
      return 'Kunde'
    case 'sle':
    case 'schaden':
      return 'Schaden/Leistung'
    case 'ei':
      return 'Enterprise Integration'
    case 'erp':
      return 'Enterprise Planning'
    case 'prd':
      return 'Produkt'
    case 'brt':
    case 'beratung':
      return 'Beratung'
    case 'external':
      return 'Extern'
    case 'rw':
      return 'Rechnungswesen'
    case 'ver':
    case 'ang':
    case 'doc':
      return 'Alt-Service'
    default:
      return 'unspezifiziert'
  }
}

const nullObject = o => ({
  ...o,
  DURCHSCHNITT_GESAMT_ZEIT: null,
  DURCHSCHNITT_PROVIDER_ZEIT: null,
  ANZAHLGESAMT: null,
  ANZAHLFAULT: null
})

export const getStatisticsData = async (umgebung, datumVon, datumBis, statisticFlags) => {
  const trace = timeSpent(log.trace)
  const MOCK = getConfigurationValue('mock.doMock') === 'true'

  const flagDaytime = statisticFlags === 'daylight' || statisticFlags.indexOf('daylight') > -1
  const flagNighttime = statisticFlags === 'night' || statisticFlags.indexOf('night') > -1
  trace('Statistic Flags', { statisticFlags, flagDaytime, flagNighttime })

  let dataArray

  if (MOCK) {
    dataArray = [{ records: STATISTIC }]
  } else {
    trace('Get Statistics')
    const beginn = moment(datumVon, 'YYYY-MM-DD').startOf('day')
    const ende = moment(datumBis, 'YYYY-MM-DD').add(1, 'days').startOf('day')

    const urls = []

    trace('Get Configuration', { sliceFetchStatisticsHours: getConfigurationValue('advanced.sliceFetchStatisticsHours') })
    const sliceFetchStatisticsHours = parseInt(getConfigurationValue('advanced.sliceFetchStatisticsHours'), 10)

    while(ende.valueOf() > beginn.valueOf()) {
      const endeWert = moment(ende).subtract(1, 'seconds').format('YYYY-MM-DDTHH:mm:ss')
      ende.subtract(sliceFetchStatisticsHours, 'hours')
      const beginnWert = moment.max(ende, beginn).format('YYYY-MM-DDTHH:mm:ss')
      const url = `${getEsbUrl(umgebung)}/dashboard/Statistic?from=${beginnWert}&to=${endeWert}`
      sendInfo(`API Statistik: ${url}`)
      urls.push(url)
    }
    trace(urls.length + ' calls', { urls })

    const iter = async () => Promise.all(urls.map(async url => { // TODO simplify
      return await fetchRecords(url)
    }))

    dataArray = await iter()
    trace('Finished rest calls', { header: dataArray[0].records ? dataArray[0].records.header: [], anzahlDataArrays: dataArray.length, noOfRecords: dataArray.map(a => a.records ? a.records.rows.length : 0) })
  }

  const data = dataArray.reduce((acc, d) => {
    if (d.records) acc.rows.push(...d.records.rows)
    return acc
  }, { header: dataArray[0].records ? dataArray[0].records.header.map(h => Object.keys(h)[0]) : [], rows: [] })
  trace('Collected arrays', { data, anzahlRows: data.rows.length })

  const statistics = data.rows.map(row => {
    let object = keysAndRowToObject(data.header, row)
    const mom = moment(object.STARTTIMESTAMP, 'YYYY-MM-DDTHH:mm:SSZ')
    object.Zeit = mom.valueOf()
    object.Date = mom.toDate()
    object.Hour = object.Date.getHours()

    if (flagNighttime && (object.Hour > 5 && object.Hour < 21)) object = nullObject(object)
    if (flagDaytime && (object.Hour < 6 || object.Hour > 20)) object = nullObject(object)

    return object
  })

  const anzahlPerHour = statistics.reduce((acc, row) => {
    if (!acc[row.Hour]) acc[row.Hour] = 0
    acc[row.Hour] += row.ANZAHLGESAMT
    return acc
  }, {})

  trace('Created object', { beispiel: statistics[0], anzahlRows: statistics.length, anzahlPerHour })

  const part = partition(TIMING_BREAKPOINTS)
  const partBus = partition(TIMING_BUS_BREAKPOINTS)

  const warnThreshold = getConfigurationValue('statistics.providerTimeWarning')
  const errorThreshold = getConfigurationValue('statistics.providerTimeError')

  statistics.forEach(row => {
    if (!row.SERVICE) {
      row.ShortName = 'n.a.'
      row.ServiceOperation = 'n.a.'
      row.Domain = 'n.a.'
      row.ServiceTree = ['n.a.', 'n.a.']
    } else {
      if (row.SERVICE.endsWith('/')) row.SERVICE = row.SERVICE.substring(0, row.SERVICE.length - 1)
      // schneide "http://.../service/" weg. Hinterer Teil ist für Altservices - TODO: entfernen, wenn Alt-Services umgestellt auf RL-konform
      const regexService = RegExp('^http://.*/service/.+')
      const shortService = regexService.test(row.SERVICE) ? row.SERVICE.replace(/http:\/\/.*\/service\//, '') : row.SERVICE.substring(32)
      row.ShortName = row.SERVICE.substring(row.SERVICE.lastIndexOf('/') + 1)
      row.ServiceOperation = shortService + ': ' + row.OPERATION
      row.Domain = getDomain(shortService.split('/')[0])
      row.ServiceTree = (shortService + '/' + row.OPERATION).split('/')
    }
    // bei negativen Werten müsste es sich um asynchrone Calls handeln, dann ist Gesamtzeit ein geeigneter Anhaltspunkt
    row.DURCHSCHNITT_BUS_ZEIT = (row.DURCHSCHNITT_GESAMT_ZEIT - row.DURCHSCHNITT_PROVIDER_ZEIT) < 0 ? row.DURCHSCHNITT_GESAMT_ZEIT : (row.DURCHSCHNITT_GESAMT_ZEIT - row.DURCHSCHNITT_PROVIDER_ZEIT)
    row.ContributionGesamtZeit = row.DURCHSCHNITT_GESAMT_ZEIT * row.ANZAHLGESAMT / anzahlPerHour[row.Hour]
    row.PartitionGesamtZeit = part(row.DURCHSCHNITT_GESAMT_ZEIT)
    row.PartitionBusZeit = partBus(row.DURCHSCHNITT_BUS_ZEIT)
    row.PartitionProviderZeit = part(row.DURCHSCHNITT_PROVIDER_ZEIT)
    row.warnThreshold = warnThreshold
    row.errorThreshold = errorThreshold
  })
  trace('Created additional fields', { beispiel: statistics[0], anzahlRows: statistics.length })

  const cf = crossfilter(statistics)
  trace('Created crossfilter', { beispiel: cf.allFiltered()[0], cfSize: cf.size() })
  sendInfo(`Anzahl Statistiksätze: ${cf.size()}`)

  const dims = {
    zeit: cf.dimension(d => d.Date),
    hour: cf.dimension(d => d.Hour),
    bus: cf.dimension(d => d.ORIGINATOR),
    mep: cf.dimension(d => d.MEP),
    domain: cf.dimension(d => d.Domain),
    service: cf.dimension(d => d.SERVICE),
    shortName: cf.dimension(d => d.ShortName),
    operation: cf.dimension(d => d.ServiceOperation),
    serviceTree: cf.dimension(d => d.ServiceTree),
    anzahlGesamt: cf.dimension(d => d.ANZAHLGESAMT),
    anzahlFault: cf.dimension(d => d.ANZAHLFAULT),
    timingGesamt: cf.dimension(d => d.PartitionGesamtZeit),
    timingProvider: cf.dimension(d => d.PartitionProviderZeit),
    timingBus: cf.dimension(d => d.PartitionBusZeit)
  }
  trace('Created dimensions')

  return { cf, dims }
}
