import { API, del, get, getData, postDataXml } from './rest-api-esb'
import { TIME_FORMAT } from '../time'
import { LOG_SEARCH_TYPES } from '../store'
import moment from 'moment'
import { getConfigurationValue } from '../configuration'
import { notification } from '../notification'
import { MESSAGE_TYPES_NAMES } from '../tableConfMessages'
import { sendInfo } from '../../App'
import Log from '../../log'

const log = Log('api-dashboards')

export const getUmgebungen = umgebungen => {
  return Object.keys(umgebungen)
}

export const getEsbUrl = umgebung => {
  const umgebungen = getConfigurationValue('umgebungen')
  const umgebungURL = umgebungen[umgebung]
  if (!umgebungURL) {
    notification({
      nachricht: `Umgebung zum Schlüssel '${umgebung}' nicht konfiguriert, verwende localhost`,
    })
    return 'http://localhost/esb'
  }
  return umgebungURL
}

const getSearchTypeUrl = searchType => {
  switch(searchType) {
    case LOG_SEARCH_TYPES.MESSAGEID:
      return 'messageId'
    case LOG_SEARCH_TYPES.REFERENCE:
      return 'reference'
    case LOG_SEARCH_TYPES.SENDERFQN:
      return 'senderFQN'
    case LOG_SEARCH_TYPES.SERVICE:
      return 'serviceNamespace'
    case LOG_SEARCH_TYPES.OPERATION:
      return 'operation'
    case LOG_SEARCH_TYPES.PROCESS_INSTANCE_ID:
      return 'processInstanceId'
    case LOG_SEARCH_TYPES.PARENT_PROCESS_INSTANCE_ID:
      return 'parentProcessInstanceId'
    default:
      alert('Programmierfehler: URL für' + searchType + ' fehlt')
      return '___URL___'
  }
}

export const getLogpoints = (filter, cb) => {
  const sec = TIME_FORMAT === 'HH:mm' ? ':00' : ''
  const {umgebung, datum, von, bis, searchType, searchValue, onlyFaults} = filter

  let url
  let info
  if (searchValue && searchValue.length > 0) {
    const searchTypeUrl = getSearchTypeUrl(searchType)
    if (bis === '00:00:00') {
      url = `${getEsbUrl(umgebung)}/dashboard/LogPoints/${datum}?${searchTypeUrl}=${encodeURIComponent(searchValue)}`
      info = `${searchValue} am ${datum}`
    } else {
      // TODO: Temporär bis neue API verteilt (dann weg, und bis === xx weg)
      // wenn wir nach spezifischen Referenzen für einzelne Calls suchen, können wir den Suchzeitraum ausdehnen
      const { anzahlMitSuchparameter, unit} = getConfigurationValue("filter.widenFilter")
      let adjustedVon
      adjustedVon = moment(bis, TIME_FORMAT).subtract(anzahlMitSuchparameter, unit)
      if (adjustedVon.isAfter(moment(von, TIME_FORMAT))) {
        // ... aber verkürzen ihn nicht, falls er eh schon groß war
        adjustedVon = von
      } else {
        adjustedVon = adjustedVon.format(TIME_FORMAT)
      }

      url = `${getEsbUrl(umgebung)}/dashboard/LogPoints/${datum}?from=${adjustedVon}${sec}&to=${bis}${sec}&${searchTypeUrl}=${encodeURIComponent(searchValue)}`
      info = `${searchValue} im Zeitraum von ${von} bis ${bis}`
    }
  } else {
    url = `${getEsbUrl(umgebung)}/dashboard/LogPoints/${datum}?from=${von}${sec}&to=${bis}${sec}`
    info = `Zeitraum von ${von} bis ${bis}`
  }
  if (onlyFaults) url = `${url}&faultLogpoint=`

  log.trace('ESB0 Api url', url)
  getData(API.LOGPOINT, url, cb, filter, info)
}

export const getService = (filter, cb) => {
  const {umgebung, id} = filter
  const url = `${getEsbUrl(umgebung)}/dashboard/Messages/${id}`
  getData(API.MESSAGE, url, cb, filter, '')
}

export const getDatabases = (filter, cb) => {
  const url = `${getEsbUrl(filter.umgebung)}/me/Databases`
  getData(API.DATABASE, url, cb, filter, '')
}

export const getQueues = (filter, cb) => {
  const {umgebung, database} = filter
  const url = `${getEsbUrl(umgebung)}/me/Databases/${database}/Queues`
  getData(API.QUEUES, url, cb, filter, '')
}

const getQueuedMessagesUrl = filter => {
  const {umgebung, queuetable, queue} = filter
  const url = `${getEsbUrl(umgebung)}/me/Databases/ME/Queuetables/${queuetable}`
  const query = queue ? `?queue=${queue}` : ''
  return url + query
}

export const getQueuedMessages = (filter, cb) => {
  const url = getQueuedMessagesUrl(filter)
  getData(API.QUEUED_MESSAGES, url, cb, filter, '')
}

export const getMessages = (filter, cb) => {
  const {umgebung, messageType, datumVon, datumBis, searchType, searchValue} = filter
  const url = `${getEsbUrl(umgebung)}/dashboard/${messageType}Messages?from=${datumVon}T00:00:00&to=${datumBis}T23:59:59`

  let search = ''
  if (searchType && searchValue && messageType !== MESSAGE_TYPES_NAMES.REJECTED) {
    const searchTypeUrl = getSearchTypeUrl(searchType)
    search = `&${searchTypeUrl}=${encodeURIComponent(searchValue)}`
  }

  getData(API.MESSAGES, url + search, cb, filter, `Selektion von ${datumVon} bis ${datumBis}`)
}

export const resendMessage = async (umgebung, mep, operation, { queuename, topicname }, message) => {
  if (!message) return { success: false, result: 'Message is null', fehlermeldung: 'Es wurde keine Message übergeben' }

  const url = queuename ?
    `${getEsbUrl(umgebung)}/me/Databases/ME/Queues?MEP=${mep}&operation=${operation}&QueueName=${queuename}` :
    `${getEsbUrl(umgebung)}/me/Databases/ME/Queues?MEP=${mep}&operation=${operation}&TopicName=${topicname}`

  sendInfo(`API resendMessage: ${url}`)

  const { success, result } = await postDataXml(url, message)
  if (!result.JMSMessageID) {
    log.warn("Enqueueing failed", result)
    return { success: false, result, fehlermeldung: 'Keine JMSMessageID erhalten --> Enqueueing fehlgeschlagen'}
  }
  return { success, result }
}

export const deleteMessage = async (umgebung, messageType, id) => {
  const url = `${getEsbUrl(umgebung)}/dashboard/${messageType}Messages/${id}`
  return await del(url)
}

export const getMessage = async (umgebung, messageType, id) => {
  const url = `${getEsbUrl(umgebung)}/dashboard/${messageType}Messages/${id}`
  const data = await get(url)

  sendInfo(`API getMessage: ${url}`)

  if (!data.success) {
    return { success: false, result: 'Kein Satz vorhanden', fehlermeldung: 'Kein Message-Satz vorhanden' }
  }

  if (!data.result.rows || data.result.rows.length < 1) return { success: false, result: 'Kein Satz vorhanden', fehlermeldung: 'Kein Message-Satz vorhanden' }
  if (data.result.rows.length > 1) return { success: false, result: `Mehrere Sätze: ${data.result.rows.length}`, fehlermeldung: 'Kein eindeutiger Message-Satz gefunden' }

  const row = data.result.rows[0]
  const header = data.result.header.map(o => Object.keys(o)[0])

  let i = 0
  const object = header.reduce((acc, v) => {
    acc[v] = row[i]
    i++
    return acc
  }, {})

  return { success: true, result: object }
}

export const doNotFindMessage = async (umgebung, messageType, id) => {
  const result = await getMessage(umgebung, messageType, id)
  const success = result.result === 'Kein Satz vorhanden'
  const fehler = success ? {} : { fehlermeldung: result.fehlermeldung || result }
  return { success, result: result.result, ...fehler }
}

export const getCheckaliveRuns = async (umgebung) => {
  const MOCK = getConfigurationValue('mock.doMock') === 'true'
  if (MOCK) return {
    success: true,
    result: ['2019-08-28T12:11:10.111+02:00', '2019-07-28T12:11:10.111+02:00'].map(m => moment(m, 'YYYY-MM-DDTHH:mm:ss.SSSZ'))
  }

  const url = `${getEsbUrl(umgebung)}/dashboard/CheckAliveRuns`
  sendInfo(`API CheckAliveRuns: ${url}`)
  const data = await get(url)

  if (!data.success) {
    sendInfo('Keine Daten vorhanden')
    return { success: false, result: 'Keine Checkalive Runs vorhanden' }
  }

  if (!data.result.rows || data.result.rows.length < 1) {
    sendInfo('Keine Daten vorhanden')
    return { success: false, result: 'Keine Checkalive Runs vorhanden' }
  }

  sendInfo(`Anzahl CheckAliveRuns: ${data.result.rows.length}`)

  const result = data.result.rows.map(r => moment(r[0], 'YYYY-MM-DDTHH:mm:ss.SSSZ'))
  return { success: true, result }
}

export const getCheckaliveRun = async (umgebung, run) => {
  const MOCK = getConfigurationValue('mock.doMock') === 'true'
  if (MOCK) return {
    success: true,
    result: ['2019-08-28T12:11:10.111+02:00', '2019-07-28T12:11:10.111+02:00'].map(m => moment(m, 'YYYY-MM-DDTHH:mm:ss.SSSZ'))
  }

  const url = `${getEsbUrl(umgebung)}/dashboard/CheckAliveRuns/${run}`
  sendInfo(`API CheckAliveRuns/${run}: ${url}`)
  const data = await get(url)

  if (!data.success) {
    return { success: false, result: 'Keine Daten zum Checkalive Run vorhanden' }
  }

  if (!data.result.rows || data.result.rows.length < 1) return { success: false, result: 'Keine Daten zum Checkalive Run vorhanden' }

  const rows = data.result.rows
  rows.forEach(row => {
    if (row[6] == null) {
      row[6] = '-'
    } else if (row[6] === 0) {
      row[6] = 'dead'
    } else {
      row[6] = 'alive'
    }
  })
  const result = { rows, header: data.result.header }

  return { success: true, result }
}
