const Koa = require('koa')
const http = require('http')
const https = require('https')
const Router = require('koa-router')
const bodyParser = require('koa-bodyparser')
const cors = require('@koa/cors')
const moment = require('moment')
const version = require('../frontend/package.json').version

const createApp = (router) => {
  const app = new Koa()

  app.use(bodyParser(
    { jsonLimit: '32mb' }
  ))
  app.use(cors())

  app.on('error', (err, ctx) => {
    console.error('server error', err, ctx)
  })

  app.use(async (ctx, next) => {
    await next()
    const rt = ctx.response.get('X-Response-Time')
    if (ctx.url !== '/checkalive' && ctx.url !== '/log') {
      console.log(`${ctx.method} ${ctx.url} - ${rt} ms`)
    }
  })

  app.use(async (ctx, next) => {
    const start = Date.now()
    await next()
    const ms = Date.now() - start
    ctx.response.set('X-Response-Time', `${ms}`)
  })

  app
    .use(router.routes())
    .use(router.allowedMethods())

  return app
}

const createRouter = (config) => {
  const starttime = moment()

  const router = new Router()

  router.get('/checkalive', async ctx => {
    const now = moment()

    ctx.body = {
      result: true,
      env: config,
      'process-start': starttime.from(now),
      'uptime-in-ms': now.valueOf() - starttime.valueOf(),
      version
    }
  })
  return router
}

const startServer = (config, router, helptext) => {
  const argv = process.argv
  let PORT = argv.length === 3 ? parseInt(argv[2], 10) : parseInt(config.SERVER_PORT, 10)

  const app = createApp(router)
  http.createServer(app.callback()).listen(PORT)
  
  console.log(helptext(PORT))
}

module.exports = {
  createRouter,
  startServer
}
