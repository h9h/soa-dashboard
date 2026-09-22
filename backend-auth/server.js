const serve = require('../backend-common/util')
const setupRoutes = require('./routes')

const version = require('../frontend/package').version
const parameters = require('../customisation/authentication.config')

const router = serve.createRouter(parameters)
setupRoutes(router, version)

const getHelpText = (parameters) => PORT => {
  return `

ESB-Dashboard Authentication Backend
--------------------------------------------
http listening on port ${PORT}
https listening on port ${PORT+1}

Base dir:
  ${__dirname}

Configuration:
  ${JSON.stringify(parameters, 2)}
  
Routes:
  GET  /dn/:user
  PUT  /authenticate { user, password }
  
  GET  /version
  GET  /checkalive
`
}

serve.startServer(parameters, router, getHelpText(parameters))
