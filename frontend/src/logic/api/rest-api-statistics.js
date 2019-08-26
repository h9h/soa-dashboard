import moment from 'moment'
import { fetchRecords } from './rest-api-esb'
import { timeSpent, keysAndRowToObject } from '../utils'
import Log from '../../log'
import crossfilter from 'crossfilter2'
import { STATISTIC } from '../mock/statistic'
import { getConfigurationValue } from '../configuration'
import { getEsbUrl } from './api-dashboard'

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
    default:
      return 'unspezifiziert'
  }
}

export const getStatisticsData = async (umgebung, datumVon, datumBis) => {
  const trace = timeSpent(log.trace)
  const MOCK = getConfigurationValue('mock.doMock') === 'true'

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
      urls.push(`${getEsbUrl(umgebung)}/dashboard/Statistic?from=${beginnWert}&to=${endeWert}`)
    }
    trace(urls.length + ' calls', { urls })

    const iter = async () => Promise.all(urls.map(async url => { // TODO simplify
      return await fetchRecords(url)
    }))

    dataArray = await iter()
    trace('Finished rest calls', { header: dataArray[0].records.header, anzahlDataArrays: dataArray.length, noOfRecords: dataArray.map(a => a.records.rows.length) })
  }

  const data = dataArray.reduce((acc, d) => {
    acc.rows.push(...d.records.rows)
    return acc
  }, { header: dataArray[0].records.header.map(h => Object.keys(h)[0]), rows: [] })
  trace('Collected arrays', { data, anzahlRows: data.rows.length })

  const statistics = data.rows.map(row => {
    const object = keysAndRowToObject(data.header, row)
    const mom = moment(object.STARTTIMESTAMP, 'YYYY-MM-DDTHH:mm:SSZ')
    object.Zeit = mom.valueOf()
    object.Date = mom.toDate()
    return object
  })
  trace('Created object', { beispiel: statistics[0], anzahlRows: statistics.length })

  const part = partition(TIMING_BREAKPOINTS)
  const partBus = partition(TIMING_BUS_BREAKPOINTS)

  statistics.forEach(row => {
    if (row.SERVICE.endsWith('/')) row.SERVICE = row.SERVICE.substring(0, row.SERVICE.length - 1)
    const shortService = row.SERVICE.substring(22) // schneide "http://svi.de/service/" weg
    row.ShortName = row.SERVICE.substring(row.SERVICE.lastIndexOf('/') + 1)
    row.ServiceOperation = shortService + ': ' + row.OPERATION
    row.Domain = getDomain(shortService.split('/')[0])
    row.ServiceTree = (shortService + '/' + row.OPERATION).split('/')
    // bei negativen Werten müsste es sich um asynchrone Calls handeln, dann ist Gesamtzeit ein geeigneter Anhaltspunkt
    row.DURCHSCHNITT_BUS_ZEIT = (row.DURCHSCHNITT_GESAMT_ZEIT - row.DURCHSCHNITT_PROVIDER_ZEIT) < 0 ? row.DURCHSCHNITT_GESAMT_ZEIT : (row.DURCHSCHNITT_GESAMT_ZEIT - row.DURCHSCHNITT_PROVIDER_ZEIT)
    row.PartitionGesamtZeit = part(row.DURCHSCHNITT_GESAMT_ZEIT)
    row.PartitionBusZeit = partBus(row.DURCHSCHNITT_BUS_ZEIT)
    row.PartitionProviderZeit = part(row.DURCHSCHNITT_PROVIDER_ZEIT)
  })
  trace('Created additional fields', { anzahlRows: statistics.length })

  const cf = crossfilter(statistics)
  trace('Created crossfilter', { cfSize: cf.size() })

  const dims = {
    zeit: cf.dimension(d => d.Date),
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
