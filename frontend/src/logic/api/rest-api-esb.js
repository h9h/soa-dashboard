import React from 'react'
import { notification } from '../notification'
import { toast } from 'react-toastify'
import axios from 'axios'
import { Small } from '../../components/styles'
import { convertToMoment } from '../time'
import { getMockLogpoints } from '../mock/mockData'
import { DATABASES } from '../mock/databases'
import { QUEUES } from '../mock/queues'
import { UNDELIVERED } from '../mock/undelivered'
import uuid from 'uuid/v1'
import { defaultTo, path } from 'ramda'

import Log from '../../log'
import { logToFile } from './rest-api-local'
import { keysAndRowToObject } from '../utils'
import { getConfigurationValue } from '../configuration'

const log = Log('rest-api-esb')
log.file = logToFile('rest-api-esb')

export const fetchRecords = async (url) => {
  try {
    const response = await axios({
      method: 'get',
      url,
    })

    return {success: true, records: response.data}

  } catch (e) {
    notification({
      nachricht: (
        <div>
          <p style={{fontSize: '150%'}}>Fehler beim Aufruf der API</p>
          <p>{e.message}</p>
          <code>{url}</code>
        </div>
      ),
      type: toast.TYPE.WARNING,
      autoClose: false,
    })
    return {success: false}
  }
}

export const fetchData = async (url, cb, log) => {
  const id = uuid()

  log.file({id, event: 'start get-call', url})
  try {
    const response = await axios({
      method: 'get',
      url,
    })
    log.trace('Status', response.status, response.data)
    log.file({
      id,
      event: 'end get-call',
      status: response.status,
      noOfRecords: defaultTo([], path(['data', 'rows'], response)).length,
    })

    return {records: response.data}

  } catch (e) {
    notification({
      nachricht: (
        <div>
          <p style={{fontSize: '150%'}}>Fehler beim Aufruf der API</p>
          <p>{e.message}</p>
          <code>{url}</code>
        </div>
      ),
      type: toast.TYPE.WARNING,
      autoClose: false,
    })
    log.file({id, event: 'ERROR get-call', error: e})
    log.error('Error', e, url)
    cb({status: 'Keine Daten abgeholt'})

    return {abort: true}
  }
}
export const API = {
  LOGPOINT: 'Logpoints',
  MESSAGE: 'Message',
  DATABASE: 'Database',
  QUEUES: 'Queues',
  QUEUED_MESSAGES: 'Queued Messages',
  MESSAGES: 'Messages',
}

function evolveData (api, dataRow, annotations) {
  dataRow.filter = annotations

  switch (api) {
    case API.LOGPOINT:
      // Leite bestimmte Daten ab:
      // -------------------------
      if ([1, 18].indexOf(dataRow.LOGPOINTNO) > -1) dataRow.ORIGINATOR = 'SC'
      if ([9, 10].indexOf(dataRow.LOGPOINTNO) > -1) dataRow.ORIGINATOR = 'SP'
      break
    case API.MESSAGE:
    case API.MESSAGES:
    case API.DATABASE:
    case API.QUEUES:
      // nix
      break
    case API.QUEUED_MESSAGES:
      dataRow.QUEUE_NAME = annotations.queue
      dataRow.QUEUE_TABLE = annotations.queuetable
      if (!dataRow.MESSAGE) dataRow.MESSAGE = dataRow['USER_DATA.TEXT_LOB'] // TODO: temporär bis API-Änderung verteilt
      break
    default:
      new Error('Evolve für API ' + api + ' fehlt')
  }

  // MEP sync sollte eigentlich requestReply sein
  if (dataRow.MEP && dataRow.MEP === 'sync') dataRow.MEP = 'requestReply'
  // Kürze Sender-FQN um unnötige Teile
  if (dataRow.SENDERFQN) dataRow.Sender = dataRow.SENDERFQN.substring(20)
    .replace(/:[A-z]+Port\d+/i, '')
  // Manche Systeme stellen keine Milli-Sekunden zur Verfügung, daher vereinheitlichen
  if (dataRow.LOGTIMESTAMP) {
    dataRow.Timestamp = convertToMoment(dataRow.LOGTIMESTAMP)
  }
  if (dataRow.OPERATION && dataRow.SERVICE) {
    dataRow.ServiceOperation = [dataRow.SERVICE, dataRow.OPERATION]
  }

  if (dataRow.MESSAGE) {
    dataRow.MessageSize = dataRow.MESSAGE.length
    dataRow.MessageContent = dataRow.MESSAGE
  }
}

function getMockData (api, url) {
  log.info('Mock data for API', api)

  switch (api) {
    case API.LOGPOINT:
      return getMockLogpoints(parseInt(getConfigurationValue('mock.anzahl'), 10), url)
    case API.MESSAGE:
      return getMockLogpoints(1) // für modales Fenster eines Nachrichtenaustauschs
    case API.MESSAGES:
      return getMockLogpoints(10)
    case API.DATABASE:
      return DATABASES
    case API.QUEUES:
      return QUEUES
    case API.QUEUED_MESSAGES:
      return UNDELIVERED
    default:
      new Error('Mock für API ' + api + ' fehlt')
  }
}

/**
 * Führt einen REST-Call aus
 *
 * @param api welche Art von Daten (Logpoints, Messag, Queue...)
 * @param url die URL zum REST Service
 * @param cb der Callback über den die Daten bzw. Status zurückgegeben werden
 * @param annotations optionale zusätzliche Daten um die Sätze zu annotieren
 * @returns {Promise<void>}
 */
export async function getData (api, url, cb, annotations) {
  const now = new Date()
  const logLabel = 'fetch: "' + url + '"'
  log.time(logLabel)
  const MOCK = getConfigurationValue('mock.doMock') === 'true'

  let records

  if (MOCK) {
    records = getMockData(api, url)

  } else {
    let data
    if (Array.isArray(url)) {
      const iter = async () => Promise.all(url.map(async u => {
        const d = await fetchData(u, cb, log)
        log.trace('data', d)
        return d
      }))
      const dataArray = await iter()
      log.trace('Data-Array', dataArray.length, dataArray[0])
      data = dataArray.reduce((acc, d) => {
        acc.records.rows.push(...d.records.rows)
        return acc
      }, {records: {header: dataArray[0].records.header, rows: []}})

    } else {
      data = await fetchData(url, cb, log)
    }

    if (data.abort) {
      log.timeEnd(logLabel)
      return
    }

    records = data.records
  }

  if (!records.header) {
    cb({status: 'error', result: 'Keine Header in den Daten', ...records})
    return
  }

  const keys = records.header.map(o => Object.keys(o)[0])

  const result = {keys}
  result.data = records.rows.map(row => {
      // Wandle Array in Object um : [v1,...vn] => { k1: v1, ..., kn: vn }
      const dataRow = keysAndRowToObject(keys, row)
      evolveData(api, dataRow, annotations)

      return dataRow
    },
  )

  result.status = 'ready'

  log.timeEnd(logLabel)
  notification({
    nachricht: (
      <div>
        <div>
          Daten-Call brauchte {(new Date() - now).toLocaleString('de-DE')} ms
        </div>
        <div>
          <Small>
            URL:
            {Array.isArray(url) ? (
              <>
                <span>
                  {url[0]}
                </span>
                <br/>
                und {url.length - 1} weitere URLs
              </>
            ) : (
              url
            )}
          </Small>
        </div>
      </div>),
  })

  cb(result)
}

function axiosErrorHandler (err) {
  if (err.response) {
    return {
      success: false,
      result: err.response,
      response: 'server',
      fehlermeldung: err.response,
    }
  } else if (err.request) {
    return {
      success: false,
      result: err.request,
      response: 'client',
      fehlermeldung: err.response,
    }
  }
  return {success: false, result: err.message, fehlermeldung: err.response}
}

export const postDataXml = async (url, data) => {
  try {
    const response = await axios({
      method: 'post',
      url,
      data,
    })
    return {success: true, result: response.data}
  } catch (err) {
    console.log(err)
    return axiosErrorHandler(err)
  }
}

export const del = async (url) => {
  try {
    const response = await axios({
      method: 'delete',
      url,
    })
    return {success: true, result: response.data}
  } catch (err) {
    return axiosErrorHandler(err)
  }
}

export const get = async (url) => {
  try {
    const response = await axios({
      method: 'get',
      url,
    })
    log.trace('get', url, response)
    return {success: true, result: response.data}
  } catch (err) {
    return axiosErrorHandler(err)
  }
}
