import { useState } from 'react'
import { equals } from 'ramda'
import Configuration from './Configuration'
import { validateConfiguration } from './validate'
import { defaultConfiguration } from './constants'
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
