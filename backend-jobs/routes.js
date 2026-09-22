const endsWith = require('ramda').endsWith
const path = require('path')
const fs = require('fs').promises
const listJobs = require('./jobs').listJobs
const getJob = require('./jobs').getJob

/**
 * Jobs/Housekeeping Routes
 * 
 * Defines all job-related API routes
 */
function setupRoutes(router, JOB_ROOT, MODEL_ROOT) {
  const checkStaysInDirectory = file => (
    path.dirname(file) === JOB_ROOT
  )

  router.put('/log', async (ctx) => {
    const { destination, ...content } = ctx.request.body
    const ext = endsWith('.log', destination) ? '' : '.log'
    const filepath = path.join(JOB_ROOT, destination + ext)

    if (!checkStaysInDirectory(filepath)) {
      ctx.body = {result: 'invalid file'}
      return
    }

    try {
      await fs.appendFile(filepath, JSON.stringify({ ...content}) + ',\n')
      ctx.body = { result: 'ok' }
    } catch (e) {
      ctx.body = { result: e }
    }
  })

  router.get('/jobs', async ctx => {
    const jobs = await listJobs(JOB_ROOT)
    ctx.body = { jobs }
  })

  router.get('/job/:jobname', async ctx => {
    const { status, job } = await getJob(JOB_ROOT, ctx.params.jobname)
    ctx.body = { status, job }
  })

  router.post('/job/save', async (ctx) => {
    const { jobname, append = false, chunk } = ctx.request.body
    const ext = endsWith('.job.json', jobname) ? '' : '.job.json'

    const filepath = path.join(JOB_ROOT, jobname + ext)
    if (!checkStaysInDirectory(filepath)) {
      ctx.body = {result: 'invalid file'}
      return
    }

    try {
      await fs.writeFile(filepath, chunk, { flag: append ? 'a' : 'w'})
      ctx.body = { result: 'ok' }
    } catch (e) {
      ctx.body = { result: e }
    }
  })

  router.get('/model/:name', async ctx => {
    const name = ctx.params.name
    const ext = endsWith('.json', name) ? '' : '.json'
    const { status, job } = await getJob(MODEL_ROOT, `${name}${ext}`)
    ctx.body = { status, model: job }
  })

  router.get('/config/:name', async ctx => {
    const name = ctx.params.name
    const parameters = require('../customisation/jobs.config.js')
    const value = parameters[name]
    const status = value ? 'ok' : 'nok'
    ctx.body = { status, config: value }
  })

  return router
}

module.exports = setupRoutes
