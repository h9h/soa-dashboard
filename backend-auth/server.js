const serve = require('../backend-common/util')
const setupRoutes = require('./routes')
const Send = require('koa-send')
const path = require('path')

const version = require('../frontend/package').version
const parameters = require('../customisation/authentication.config')

const haveFrontend = process.argv && process.argv[0] && process.argv[0].indexOf('esb-dashboard.exe') > -1

const router = serve.createRouter(parameters)
setupRoutes(router, version)

if (haveFrontend) {
  router.get('/', async ctx => {
    await Send(ctx, path.join('../frontend/build', 'index.html'), {root: __dirname})
  })

  router.get('*', async ctx => {
    await Send(ctx, path.join('../frontend/build', ctx.path), {root: __dirname})
  })
}

const frontendRouteText = haveFrontend ? `
  GET  / ==> ESB-Dashboard
` : ''

const getHelpText = (parameters) => PORT => {
  return `

ESB-Dashboard SPA und Authentication Backend
--------------------------------------------
http listening on port ${PORT}
https listening on port ${PORT+1}

Base dir:
  ${__dirname}

Configuration:
  ${JSON.stringify(parameters, 2)}
  
Routes:
${frontendRouteText}  
  GET  /dn/:user
  PUT  /authenticate { user, password }
  
  GET  /version
  GET  /checkalive
`
}

serve.startServer(parameters, router, getHelpText(parameters))

