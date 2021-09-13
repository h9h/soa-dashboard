import moment from 'moment'
import { mergeDeepRight } from 'ramda'
import { getDuration, TIME_FORMAT, widenTime } from './time'
import Persistence from './Persistence'
import { USER_KEY } from './store'

import Log from '../log'
import {
  getConfigurationValue,
  getStoredConfiguration,
  resetConfiguration,
  storeConfiguration,
} from './configuration'

const log = Log('reducer')

const updateStoredUmgebung = umgebung => {
  const newConf = mergeDeepRight(getStoredConfiguration(), {filter: {umgebung}})
  storeConfiguration(newConf)
}

function reducer (state = {}, action) {
  log.trace('reduce', {state, action})

  switch (action.type) {
    case 'loggedIn': {
      log.trace('Persisting user', action.user)
      const p = new Persistence(USER_KEY)
      p.set(action.user)
      log.trace('Stored: ', p.get())

      return {
        ...state,
        user: action.user
      }
    }

    case 'logout': {
      new Persistence(USER_KEY).set(null)
      const {user, ...rest} = state
      return {
        ...rest
      }
    }

    case 'actualise': {
      const datum = moment().format('YYYY-MM-DD')
      const {von, bis} = getDuration(getConfigurationValue('time.duration'))(moment())
      return {
        ...state,
        logSearchValue: '',
        datum,
        von,
        bis
      }

    }

    case 'setFilter': {
      updateStoredUmgebung(action.umgebung)
      const {duration, von, bis} = getDuration(action.duration)(moment(action.bis, TIME_FORMAT))
      return {
        ...state,
        umgebung: action.umgebung,
        datum: action.datum,
        duration,
        von,
        bis,
        logSearchType: action.logSearchType,
        logSearchValue: action.logSearchValue
      }
    }

    case 'setUmgebung':
      updateStoredUmgebung(action.umgebung)
      return {
        ...state,
        umgebung: action.umgebung
      }

    case 'setBis': {
      const {von, bis} = getDuration(getConfigurationValue('time.duration'))(moment(action.bis, TIME_FORMAT))
      return {
        ...state,
        von,
        bis,
      }
    }

    case 'setLogSearchParameters': {
      const {von, bis} = widenTime(getConfigurationValue('filter.widenFilter'))(state.von, state.bis)
      return {
        ...state,
        von,
        bis,
        logSearchType: action.logSearchType,
        logSearchValue: action.logSearchValue
      }
    }

    case 'setJobname':
      return {
        ...state,
        jobname: action.jobname
      }

    case 'setFilterQueues': {
      updateStoredUmgebung(action.umgebung)
      return {
        ...state,
        umgebung: action.umgebung,
        database: action.database
      }
    }

    case 'setFilterStatistics': {
      updateStoredUmgebung(action.umgebung)
      let datumStatVon = action.datumStatVon < action.datumStatBis ? action.datumStatVon : action.datumStatBis
      const datumStatBis = action.datumStatVon < action.datumStatBis ? action.datumStatBis : action.datumStatVon
      if (moment(datumStatVon, 'YYYY-MM-DD').add(31, 'days').valueOf() < moment(datumStatBis, 'YYYY-MM-DD').valueOf()) {
        datumStatVon = moment(datumStatBis, 'YYYY-MM-DD').subtract(31, 'days').format('YYYY-MM-DD')
      }
      return {
        ...state,
        umgebung: action.umgebung,
        datumStatVon,
        datumStatBis,
        statisticFlags: action.statisticFlags
      }
    }

    case 'setView':
      return {
        ...state,
        view: action.view,
        colorScheme: getConfigurationValue('statistics.colorSchemes')[action.view] || 'Tableau10'
      }

    case 'setColorScheme':
      const newConf = mergeDeepRight(getStoredConfiguration(), {statistics: {colorSchemes: {[state.view]: action.colorScheme}}})
      storeConfiguration(newConf)

      return {
        ...state,
        colorScheme: action.colorScheme,
      }

    case 'setFilterMessages': {
      updateStoredUmgebung(action.umgebung)
      let datumVon = action.datumVon < action.datumBis ? action.datumVon : action.datumBis
      const datumBis = action.datumVon < action.datumBis ? action.datumBis : action.datumVon
      if (moment(datumVon, 'YYYY-MM-DD').add(28, 'days').valueOf() < moment(datumBis, 'YYYY-MM-DD').valueOf()) {
        datumVon = moment(datumBis, 'YYYY-MM-DD').subtract(28, 'days').format('YYYY-MM-DD')
      }
      return {
        ...state,
        umgebung: action.umgebung,
        messageType: action.messageType,
        datumVon,
        datumBis,
        messageSearchType: action.messageSearchType,
        messageSearchValue: action.messageSearchValue
      }
    }

    case 'setRidgelineDimension': {
      return {
        ...state,
        ridgelineDimension: action.dimension,
      }
    }

    case 'setRidgelineWert': {
      return {
        ...state,
        ridgelineWert: action.wert,
      }
    }

    case 'updateConfiguration': {
      const newConfiguration = mergeDeepRight(state.configuration, action.values)
      storeConfiguration(newConfiguration)
      return {
        ...state,
        configuration: newConfiguration,
      }
    }

    case 'resetConfiguration': {
      const configuration = resetConfiguration()
      return {
        ...state,
        configuration,
      }
    }

    case 'setFilterCheckalive': {
      return {
        ...state,
        umgebung: action.umgebung,
      }
    }

    case 'sendStatusInfo': {
      const newInfo = typeof action.info === 'string' ? action.info : null
      if (!newInfo) return state

      return {
        ...state,
        infos: [newInfo].concat(state.infos),
      }
    }

    default:
      return state
  }
}

export default reducer
