import { getConfiguration } from '../configuration'
import moment from 'moment'
import { getDuration } from './time'
import { MESSAGE_TYPES_NAMES } from './tableConfMessages'
import { VIEWS } from './statistics'
import Persistence from '../configuration/Persistence'
import Log from '../log'
import { checkValidUser } from './authorization'

export const USER_KEY = 'esbd.user'

const log = Log('store')

export const LOG_SEARCH_TYPES = {
  REFERENCE: 'Referenz',
  SENDERFQN: 'Sender-FQN',
  MESSAGEID: 'Message-Id'
}

export const initialState = () => {
  log.trace('initialState called')
  const configuration = getConfiguration()
  const { von, bis } = getDuration(configuration.time.duration)(moment())

  const persistence = new Persistence(USER_KEY)
  let user = persistence.get()
  log.trace('Persisted Session', user)
  if (!checkValidUser(user)) user = null

  const defaultView = VIEWS.DEFAULT

  return {
    user: user,
    umgebung: configuration.filter.umgebung,
    datum: moment().format('YYYY-MM-DD'),
    von,
    bis,
    logSearchType: LOG_SEARCH_TYPES.MESSAGEID,
    logSearchValue: '',
    messageId: '',
    jobname: '',
    datumVon: moment().subtract(0, 'days').format('YYYY-MM-DD'),
    datumBis: moment().format('YYYY-MM-DD'),
    datumStatVon: moment().subtract(1, 'days').format('YYYY-MM-DD'),
    datumStatBis: moment().subtract(1, 'days').format('YYYY-MM-DD'),
    messageType: MESSAGE_TYPES_NAMES.UNDELIVERED,
    view: defaultView,
    colorScheme: configuration.statistics.colorSchemes[defaultView] || 'Tableau10',
    ridgelineDimension: 'operation',
    ridgelineWert: 'anzahlGesamt',
    database: 'ME'
  }
}
