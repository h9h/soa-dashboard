/**
 * Authentication Configuration
 * 
 * Copy this file to ../customisation/authentication.config.js and update with your values
 */
const parameters = {
  URL_LDAP: "ldap://ldap.server.name",
  BASE_DN: "O=WHATEVER",
  SERVER_PORT: "4166",
  GROUP: "LDAP Group DN, if being in a group is required to get access to dashboard"
}

module.exports = parameters
