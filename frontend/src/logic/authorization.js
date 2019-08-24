import moment from 'moment'
import Log from '../log'
import { checkAlive, getVersion, loginUser } from './api/rest-api-local'
import { isVersionOk } from './utils'
import { getConfigurationValue } from './configuration'

const log = Log('authorization')
const isMocked = () => getConfigurationValue('mock.doMock') === 'true'

export async function checkVersion () {
  if (isMocked()) return true

  const currentVersion = await getVersion()
  if (!currentVersion) {
    log.info('Versionscheck fehlgeschlagen')
    return true
  }

  const localVersion = process.env.REACT_APP_VERSION
  return isVersionOk(localVersion, currentVersion)
}

export async function checkAvailability () {
  if (isMocked()) return true

  return await checkAlive()
}

// prüfe user/password. Falls erfolgreich, gib token zurück, ansonsten null
export async function checkLogin (userId, password) {
  log.trace('Authenticating user', userId)

  if (isMocked()) return {
    timestamp: Date.now(),
    userId: 'einUser',
    idm: {
      dn: 'cn=einUser, ou=test',
      sn: 'Mustermann',
      givenName: 'Max'
    }
  }

  return await loginUser(userId, password)
}

export const checkValidUser = (user) => {
  if (!user) return false

  if (isMocked()) return true

  try {
    if (!user.timestamp) return false

    if (moment().subtract(1, 'hours').valueOf() > user.timestamp) {
      log.trace('invalidating expired session')
      return false
    }
  } catch (e) {
    log.error('error checking user', e)
    return false
  }

  // TODO - z.B. prüfen eines JWT gegen Authentifizierungs-Backend
  return true
}

/*
Einzelne Rechte
 */
export const rightToViewProps = user => {
  if (isMocked()) return true
  if (!user) return false
  return user.userId === process.env.REACT_APP_ADMIN
}
