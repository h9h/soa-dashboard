const getDN = require('./authentication').getDN
const checkLogin = require('./authentication').checkLogin

/**
 * Authentication Routes
 * 
 * Defines all authentication-related API routes
 */
function setupRoutes(router, version) {
  router.get('/dn/:user', async ctx => {
    const { dn, isAuthorized, result, canResend } = await getDN(ctx.params.user)

    ctx.body = {
      dn,
      isAuthorized,
      result,
      canResend
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

  return router
}

module.exports = setupRoutes
