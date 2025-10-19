/**
 * Authentication Implementation
 * 
 * This redirects to the provided LDAP authentication implementation.
 * Copy this file to ../customisation/authenticationImplementation.js
 * 
 * Alternatively, create your own implementation by exporting getDN and checkLogin functions.
 */
const auth = require('../backend-auth/ldap/ldapAuthentication')

module.exports = {
  getDN: auth.getDN,
  checkLogin: auth.checkLogin,
  config: auth.config
}
