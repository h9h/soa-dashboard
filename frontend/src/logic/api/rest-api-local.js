import React from 'react'
import axios from 'axios'
import Log from '../../log'
import { endsWith, omit } from 'ramda'
import { notification, withProgressNotification } from '../notification'
import { toast } from 'react-toastify'
import moment from 'moment'
import { json2string } from '../utils'
import Button from 'react-bootstrap/Button'
import { Icon } from '../../components/icons'
import { parseMessage } from '../actionHandlers/utils'
import { getConfigurationValue } from '../configuration'

const log = Log('rest-api-local')

export const getClientUrl = () => window.location.origin

const getLocalURL = (auth) => {
  const PORT = auth ? process.env.REACT_APP_AUTHENTICATION_PORT : process.env.REACT_APP_FILE_PORT
  if (!auth || process.env.REACT_APP_USE_LOCAL_AUTHENTICATION === 'true') {
    return `http://localhost:${PORT}`
  } else {
    log.trace('window.location.protocol', window.location.protocol)
    if (window.location.protocol === 'https:') {
      return `${window.location.protocol}//${window.location.hostname}:${parseInt(PORT, 10) + 1}`
    } else {
      return `${window.location.protocol}//${window.location.hostname}:${PORT}`
    }
  }
}

const auth = axios.create({
  baseURL: getLocalURL(true)
})

const file = axios.create({
  baseURL: getLocalURL(false)
})

export async function checkAliveServer(rest) {
  try {
    const result = await rest({
      method: 'get',
      url: '/checkalive'
    })
    log.trace('checkAlive Result', result)
    return true
  } catch (err) {
    log.trace('checkAlive Error', err)
    return false
  }
}

/**
 *
 *  File-API (Jobs)
 *
 */

export async function checkAliveFile(user) {
  if (!user || !user.canResend) return false
  return await checkAliveServer(file)
}

export const logToFile = destination => content => {
  const timestamp = moment().valueOf()
  try {
    file({
      method: 'put',
      url: '/log',
      data: {
        destination,
        timestamp,
        ...content
      }
    })
  } catch (_) {
    //console.log(destination, content)
  }
}

async function writeChunk (jobname, chunk) {
  try {
    const size = 65536
    let i = 0
    do {
      const chunkPart = chunk.substr(i * size, size)
      await file({
        method: 'post',
        url: '/job/save',
        data: {
          jobname,
          chunk: chunkPart,
          append: true
        }
      })
      i++
    } while (chunk.length > i * size)
    return true
  } catch (e) {
    return false
  }
}

export const saveJob = async (jobname, job, cb) => {
  const { filteredMessages, ...rest } = job
  const anzahl = filteredMessages.length

  const nachricht = () => {
    const starttime = moment().valueOf()

    return index => {
      const spent = moment().valueOf() - starttime
      const eta = moment().add( Math.floor((spent/index) * (anzahl - index)), 'ms')
      return (
        <div>
          <p>Speichern von {jobname}:</p>
          <p>Fortschritt {Math.floor(index/anzahl*100)}%, erwartete Ankunft um {eta.format('HH:mm')}</p>
        </div>
      )
    }
  }

  const Stopbutton = ({closeToast}) => (
    <Button
      onClick={() => {
        closeToast()
      }}
      variant="outline-primary"
    >
      <Icon glyph="cancel"/> Speichern abbrechen
    </Button>
  )

  const myUpdateNachricht = nachricht()
  let index = 0
  let doContinue = true

  const updateProgress = withProgressNotification({
    nachricht: myUpdateNachricht(index),
    closeButton: <Stopbutton />,
    onClose: () => doContinue = false
  })

  log.trace('saveJob', jobname, anzahl)

  const parameters = json2string(rest)

  try {
    // Write parameters:
    await file({
      method: 'post',
      url: '/job/save',
      data: {
        jobname,
        chunk: parameters.substr(0, parameters.length - 1) + ', "filteredMessages" :[',
        append: false
      }
    })

    // Bei vielen Calls müüsen wir wegen Größe der Daten auf den Messageinhalt verzichten.
    // Wir brauchen dann allerdings daraus den senderFQN.
    const omitFields = filteredMessages.length > parseInt(getConfigurationValue('advanced.maxQueuedMessagesWithMessagecontent'), 10) ? ['MESSAGE', 'Sender', 'Timestamp', 'ServiceOperation'] : ['Sender', 'Timestamp', 'ServiceOperation', 'MessageSize']
    do {
      const message = filteredMessages[index]
      const stripped = omit(omitFields, message)
      if (omitFields.indexOf('MESSAGE') > -1) {
        stripped.MESSAGE = parseMessage(message.MESSAGE, ['senderFQN'])
      }

      const chunk = json2string(stripped)
      log.trace('chunk', index, chunk.length)
      try {
        const success = await writeChunk(jobname, chunk + ',')
        if (!success) {
          cb({ result: `Fehler bei writeChunk des Jobs ${jobname} (Chunk): ` + chunk.length})
        }
        log.trace('saved chunk', index, success)
        if (index % 10 === 1) updateProgress(myUpdateNachricht(index))
        index++
      } catch (e) {
        log.error('caught error', e)
        cb({ result: `Fehler beim Speichern des Jobs ${jobname} (Chunk): ` + json2string(e)})
        return
      }
    } while (doContinue && index < anzahl)
    if (doContinue) {
      await file({
        method: 'post',
        url: '/job/save',
        data: {
          jobname,
          chunk: `{ "anzahl": "${anzahl}"}]}`,
          append: true
        }
      })
      cb({result: 'ok'})
    } else {
      cb({result: 'Abbruch durch Nutzer'})
    }
  } catch (e) {
    log.error('caught outer error', e)
    cb({result: `Fehler beim Speichen des Jobs ${jobname}: ` + json2string(e)})
  }

  updateProgress(null)
}

const fetchData = async (url, cb, log) => {
  try {
    const response = await file({
      method: 'get',
      url
    })
    log.trace('Status', response.status)

    return { records: response.data }

  } catch (e) {
    notification({
      nachricht: (
        <div>
          <p style={{ fontSize: "150%" }}>Fehler beim Aufruf der API</p>
          <p>{e.message}</p>
          <code>{url}</code>
        </div>
      ),
      type: toast.TYPE.WARNING,
      autoClose: false,
    })
    log.error('Error', e, url)
    cb({status: 'Keine Daten abgeholt'})

    return { abort: true }
  }
}

export const getJobs = async (cb) => {
  const data = await fetchData('/jobs', cb, log)
  if (data.abort) return

  cb({status: 'ready', data: data.records})
}

export const getJob = async (jobname, cb) => {
  const ext = endsWith('.job.json', jobname) ? '' : '.job.json'
  const data = await fetchData(`/job/${jobname}${ext}`, cb, log)
  if (data.abort) return

  cb({status: 'ready', data: data.records})
}

export const getModel = async (modelname, cb) => {
  const { abort, records } = await fetchData(`/model/${modelname}`, cb, log)
  if (abort) return null
  return records.model
}

export const getConfig = async (name, cb) => {
  const { abort, records } = await fetchData(`/config/${name}`, cb, log)
  if (abort) return null
  return records.config
}

/**
 *
 *
 * Authentifizierung API
 *
 */

export async function checkAlive() {
  return await checkAliveServer(auth)
}

export async function loginUser (userId, password) {
  try {
    const result = await auth({
      method: 'put',
      url: '/authenticate',
      data: {
        user: userId,
        password
      }
    })
    log.trace('loginUser Result', result)
    if (!result) return null
    return result.data.result
  } catch (e) {
    log.trace('loginUser Error', e)
    return null
  }
}

export async function getVersion() {
  try {
    const result = await auth({
      method: 'get',
      url: '/version',
    })
    log.trace('Aktuelle Version', result.data)
    if (!result || !result.data) return null
    return result.data.version
  } catch (e) {
    log.trace('getVersion Error', e)
    return null
  }
}
