import { useState } from 'react'
import { equals } from 'ramda'
import Configuration from './Configuration'
import { validateConfiguration } from './validate'
import { defaultConfiguration } from './constants'
import { toast } from 'react-toastify'
import { notification } from '../logic/notification'

let CONFIGURATION
let configuration



export const initialize = () => {
  CONFIGURATION = new Configuration()
  configuration = CONFIGURATION.get()
}

export const getConfiguration = () => {
    return configuration
}

export const useConfiguration = () => {
  const [stateConfiguration, setTempConfiguration] = useState(configuration)
  if (!equals(stateConfiguration, configuration)) {
    setTempConfiguration(configuration)
  }

  const setConfiguration = (conf) => {
    const newConf = conf || defaultConfiguration
    if (equals(newConf, configuration)) return
    const result = validateConfiguration(newConf)
    if (!result.valid) {
      notification({ nachricht: 'Fehler beim Ändern der Konfiguration\n' + JSON.stringify(result.errors), autoClose: false })
      return
    }
    CONFIGURATION.set(newConf)
    setTempConfiguration(newConf)
    configuration = newConf
  }

  return [stateConfiguration, setConfiguration]
}

export const setConfiguration = conf => {
  const newConf = conf || defaultConfiguration
  if (equals(newConf, configuration)) return
  const result = validateConfiguration(newConf)
  if (!result.valid) {
    notification({ nachricht: 'Fehler beim Ändern der Konfiguration\n' + JSON.stringify(result.errors), autoClose: false })
    return
  }
  CONFIGURATION.set(newConf)
  configuration = newConf
}

const getMillisNotificationAutoClose = () => {
  return parseInt(configuration.advanced.millisAutoCloseNotification, 10)
}

const getNotificationPosition = () => {
  const vert = configuration.advanced.notificationPositionVertical
  const horz = configuration.advanced.notificationPositionHorizontal
  if (vert === 'top') {
    if (horz === 'left') {
      return toast.POSITION.TOP_LEFT
    } else if(horz === 'center') {
      return toast.POSITION.TOP_CENTER
    } else {
      return toast.POSITION.TOP_RIGHT
    }
  } else {
    if (horz === 'left') {
      return toast.POSITION.BOTTOM_LEFT
    } else if(horz === 'center') {
      return toast.POSITION.BOTTOM_CENTER
    } else {
      return toast.POSITION.BOTTOM_RIGHT
    }
  }
}

export const toastConfiguration = () => {
  return {
    position: getNotificationPosition(),
    autoClose: getMillisNotificationAutoClose(),
    pauseOnFocusLoss: true,
  }
}

export const getMillisPreExecutionOnNotification = () => {
  return parseInt(configuration.advanced.millisPreExecutionOnNotification, 10)
}
