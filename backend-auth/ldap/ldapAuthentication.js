const ActiveDirectory = require('activedirectory2').promiseWrapper
const moment = require('moment')
const flatten = require('ramda').flatten

const parameters = require('../../customisation/authentication.config.js')

/**
 * resendUsers contains a list of user-ids. Those users can resend messages from the queue
 */
let resendUsers
try {
  resendUsers = require('../../customisation/resend-users.config.js')
} catch (_) {
  resendUsers = null
}

const log = {
  trace: console.log
}

/**
 * We need to use our own entryParser to interpret the result from th AD
 * - dn needs to be in specified ldap group
 *
 * @returns {{entryParser: entryParser, isAuthorized: (function(*))}}
 */
const entryFound = () => {
  let foundDn = null
  let dashBoard = false

  return {
    entryParser: (entry, raw, cb) => {
      if (entry.dn) foundDn = entry.dn
      // log.trace('groupMembership', entry.groupMembership)
      dashBoard = (parameters.GROUP && entry.groupMembership && entry.groupMembership.indexOf(parameters.GROUP) > -1) || !parameters.GROUP
      cb(entry)
    },
    isAuthorized: dn => dn === foundDn && dashBoard
  }
}
const ldap = entryFound()

const config = {
  url: parameters.URL_LDAP,
  baseDN: parameters.BASE_DN,
  strictDN: false,
  entryParser: ldap.entryParser
}

const ad = new ActiveDirectory(config)

const negativeResult = (message, results, ...args) => {
  log.trace(message, ...args)
  return { dn: null, results }
}

async function getDN (userId) {
  log.trace('Searching', userId)

  let user = null
  try {
    user = await ad.find({filter: 'CN=' + userId, includeMembership: ['users', 'other']})
  } catch (err) {
    log.trace(err)
  }
  log.trace('user', user)
  if (!user) return negativeResult('Not found', null)

  const results = flatten([user.groups, user.users, user.other])
  if (results.length < 1) return negativeResult('No results', results)

  const dn = results[0].dn
  if (!dn) return negativeResult('Finding DN for user failed', results, userId)

  return { dn, isAuthorized: ldap.isAuthorized(dn), results, canResend: (resendUsers && resendUsers.indexOf(userId.toUpperCase()) > -1) || !resendUsers }
}

async function checkLogin (userId, password) {
  log.trace('Authenticating user', userId)

  const { dn, isAuthorized, results } = await getDN(userId)
  if (!dn || !isAuthorized) return null

  try {
    const auth = await ad.authenticate(dn, password)
    log.trace('Authenticated?', auth)
    return {
      timestamp: moment().valueOf(),
      userId,
      canResend: (resendUsers && resendUsers.indexOf(userId.toUpperCase()) > -1) || !resendUsers,
      idm: { ...results[0] }
    }
  } catch (e) {
    log.trace('Authentication error', e)
    return null
  }
}

module.exports = {
  getDN,
  checkLogin,
  config
}
