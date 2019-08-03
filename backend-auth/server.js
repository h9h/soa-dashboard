const serve = require('../backend-common/util')
const Send = require('koa-send')
const path = require('path')

const version = require('../frontend/package').version
const parameters = require('../customisation/authentication.config')
const getDN = require('./authentication').getDN
const checkLogin = require('./authentication').checkLogin

const haveFrontend = process.argv && process.argv[0] && process.argv[0].indexOf('esb-dashboard.exe') > -1

const router = serve.createRouter(parameters)

router.get('/dn/:user', async ctx => {
  const { dn, isAuthorized, result } = await getDN(ctx.params.user)

  ctx.body = {
    dn,
    isAuthorized,
    result
  }
})

router.put('/authenticate', async (ctx) => {
  const userId = ctx.request.body.user
  const password = ctx.request.body.password

  const user = await checkLogin(userId, password)

  if (user && user.dn) console.log(user.dn)

  ctx.body = { result: user }
})

router.get('/version', async ctx => {
  ctx.body = {
    version
  }
})

if (haveFrontend) {
  router.get('/', async ctx => {
    await Send(ctx, path.join('frontend/build', 'index.html'), {root: __dirname})
  })

  router.get('*', async ctx => {
    await Send(ctx, path.join('frontend/build', ctx.path), {root: __dirname})
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

