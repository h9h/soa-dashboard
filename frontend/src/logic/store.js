import moment from 'moment'
import { getDuration } from './time'
import { MESSAGE_TYPES_NAMES } from './tableConfMessages'
import { VIEWS } from './statistics'
import Persistence from './Persistence'
import Log from '../log'
import { checkValidUser } from './authorization'
import { getStoredConfiguration } from './configuration'

export const USER_KEY = 'esbd.user'

const log = Log('store')

export const LOG_SEARCH_TYPES = {
  REFERENCE: 'Referenz',
  SENDERFQN: 'Sender-FQN',
  MESSAGEID: 'Message-Id',
  SERVICE: 'Service-Namespace',
  PROCESS_INSTANCE_ID: 'ProcessInstance-Id'
}

export const initialState = () => {
  log.trace('initialState called')
  const configuration = getStoredConfiguration()
  const { duration, von, bis } = getDuration(configuration.time.duration)(moment())

  const persistence = new Persistence(USER_KEY)
  let user = persistence.get()
  log.trace('Persisted Session', user)
  if (!checkValidUser(user)) user = null

  const defaultView = VIEWS.DEFAULT

  return {
    configuration,
    user: user,
    umgebung: configuration.filter.umgebung,
    datum: moment().format('YYYY-MM-DD'),
    duration,
    von,
    bis,
    logSearchType: LOG_SEARCH_TYPES.MESSAGEID,
    logSearchValue: '',
    onlyFaults: false,
    messageSearchType: LOG_SEARCH_TYPES.SENDERFQN,
    messageSearchValue: '',
    messageId: '',
    jobname: '',
    datumVon: moment().subtract(0, 'days').format('YYYY-MM-DD'),
    datumBis: moment().format('YYYY-MM-DD'),
    datumStatVon: moment().subtract(1, 'days').format('YYYY-MM-DD'),
    datumStatBis: moment().subtract(1, 'days').format('YYYY-MM-DD'),
    statisticFlags: [],
    messageType: MESSAGE_TYPES_NAMES.UNDELIVERED,
    view: defaultView,
    colorScheme: configuration.statistics.colorSchemes[defaultView] || 'Tableau10',
    ridgelineDimension: 'operation',
    ridgelineWert: 'anzahlGesamt',
    database: 'ME',
    infos: ['Anwendung initialisiert']
  }
}
