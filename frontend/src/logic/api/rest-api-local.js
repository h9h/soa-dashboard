import React from 'react'
import axios from 'axios'
import Log from '../../log'
import { endsWith } from 'ramda'
import { notification } from '../notification'
import { toast } from 'react-toastify'
import moment from 'moment'

const log = Log('rest-api-local')

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

export const saveJob = async (jobname, job, cb) => {
  try {
    let data = JSON.stringify(job)
    const size = 65536
    let i = 0
    do {
      const chunk = data.substr(i * size, size)
      await file({
        method: 'post',
        url: '/job/save',
        data: {
          jobname,
          chunk,
          append: i !== 0
        }
      })
      i++
    } while (data.length > i * size)
    cb({result: 'ok'})
  } catch (e) {
    cb({result: e.message})
  }
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
