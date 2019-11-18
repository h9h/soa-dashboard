const auth = require('../customisation/authenticationImplementation')

module.exports = {
  getDN: auth.getDN,
  checkLogin: auth.checkLogin,
  config: auth.config
}
