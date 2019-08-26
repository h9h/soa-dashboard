import { getDefaultUmgebungen, getDefaultUmgebungKey, getDoMock } from '../customisation/configuration.config'
import store from 'store'
import defaults from 'store/plugins/defaults'
import { path } from 'ramda'
import { Validator } from 'jsonschema'
import { CONFIGURATION_SCHEMA, DEFINITIONS } from './configurationDefinition'

const CONFIG_STORE_KEY = 'esb-dashboard'

store.addPlugin(defaults)

const defaultConfiguration = {
  version: 4,
  umgebungen: getDefaultUmgebungen,
  time: {
    duration: {
      anzahl: "10",
      unit: 'minutes'
    },
  },
  filter: {
    umgebung: getDefaultUmgebungKey,
    widenFilter: {
      anzahlVor: "1",
      anzahlZurueck: "15",
      unit: 'minutes'
    },
  },
  logtable: {
    pageSizes: ["6", "10", "12", "50", "100"],
    defaultSize: "10"
  },
  messagetable: {
    pageSizes: ["6", "10", "12", "50", "100"],
    defaultSize: "10"
  },
  queuetable: {
    pageSizes: ["6", "10", "12", "50", "100"],
    defaultSize: "10"
  },
  queuetabletable: {
    pageSizes: ["6", "10", "12", "50", "100"],
    defaultSize: "10"
  },
  presentation: {
    timeline: {
      alignFlag: "left"
    },
    logpoints: {
      verticalSeparation: "true",
    },
    distribution: {
      heightInPx: "120",
    }
  },
  mock: {
    doMock: getDoMock,
    anzahl: "10000"
  },
  advanced: {
    millisPreExecutionOnNotification: "50",
    millisAutoCloseNotification: "4000",
    notificationPositionVertical: "bottom",
    notificationPositionHorizontal: "center",
  },
  debug: {
    namespaces: "ESBD:*",
    level: "1"
  },
  statistics: {
    colorSchemes: {}
  }
}

export const getStoredConfiguration = () => {
  store.defaults({ [CONFIG_STORE_KEY]: defaultConfiguration })
  return store.get(CONFIG_STORE_KEY)
}

export const storeConfiguration = values => {
  store.set(CONFIG_STORE_KEY, values)
}

export const getConfigurationValue = key => {
  return path(key.split('.'), getStoredConfiguration())
}

export const validateConfiguration = values => {
  const v = new Validator()
  Object.keys(DEFINITIONS).forEach(k => {
    v.addSchema(DEFINITIONS[k], DEFINITIONS[k].id)
  })

  return v.validate(values, CONFIGURATION_SCHEMA)
}
