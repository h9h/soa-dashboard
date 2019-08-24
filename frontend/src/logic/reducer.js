import moment from 'moment'
import { mergeDeepRight } from 'ramda'
import { getDuration, TIME_FORMAT, widenTime } from './time'
import { getConfiguration, setConfiguration } from '../configuration'
import Persistence from '../configuration/Persistence'
import { USER_KEY } from './store'

import Log from '../log'
import { storeConfiguration } from './configuration'

const log = Log('reducer')

function reducer (state = {}, action) {
  log.trace('reduce', {state, action})

  const configuration = getConfiguration()

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
      const {von, bis} = getDuration(configuration.time.duration)(moment())
      return {
        ...state,
        logSearchValue: '',
        datum,
        von,
        bis
      }

    }

    case 'setFilter': {
      const {von, bis} = getDuration(configuration.time.duration)(moment(action.bis, TIME_FORMAT))
      return {
        ...state,
        umgebung: action.umgebung,
        datum: action.datum,
        von,
        bis,
        logSearchType: action.logSearchType,
        logSearchValue: action.logSearchValue
      }
    }

    case 'setUmgebung':
      return {
        ...state,
        umgebung: action.umgebung
      }

    case 'setBis': {
      const {von, bis} = getDuration(configuration.time.duration)(moment(action.bis, TIME_FORMAT))
      return {
        ...state,
        von,
        bis,
      }
    }

    case 'setLogSearchParameters': {
      const {von, bis} = widenTime(configuration.filter.widenFilter)(state.von, state.bis)
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
      return {
        ...state,
        umgebung: action.umgebung,
        database: action.database
      }
    }

    case 'setFilterStatistics': {
      let datumStatVon = action.datumStatVon < action.datumStatBis ? action.datumStatVon : action.datumStatBis
      const datumStatBis = action.datumStatVon < action.datumStatBis ? action.datumStatBis : action.datumStatVon
      if (moment(datumStatVon, 'YYYY-MM-DD').add(31, 'days').valueOf() < moment(datumStatBis, 'YYYY-MM-DD').valueOf()) {
        datumStatVon = moment(datumStatBis, 'YYYY-MM-DD').subtract(31, 'days')
      }
      return {
        ...state,
        umgebung: action.umgebung,
        datumStatVon,
        datumStatBis,
      }
    }

    case 'setView':
      return {
        ...state,
        view: action.view,
        colorScheme: configuration.statistics.colorSchemes[action.view] || 'Tableau10'
      }

    case 'setColorScheme':
      const newConf = mergeDeepRight(configuration, {statistics: {colorSchemes: {[state.view]: action.colorScheme}}})
      setConfiguration(newConf)

      return {
        ...state,
        colorScheme: action.colorScheme,
      }

    case 'setFilterMessages': {
      return {
        ...state,
        umgebung: action.umgebung,
        messageType: action.messageType,
        datumVon: action.datumVon < action.datumBis ? action.datumVon : action.datumBis,
        datumBis: action.datumVon < action.datumBis ? action.datumBis : action.datumVon,
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

    default:
      return state
  }
}

export default reducer
