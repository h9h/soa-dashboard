const endsWith = require('ramda').endsWith
const serve = require('../backend-common/util')

const parameters = require('../customisation/jobs.config.js')
const path = require('path')
const fs = require('fs').promises
const fsOld = require('fs')
const listJobs = require('./jobs').listJobs
const getJob = require('./jobs').getJob

const JOB_ROOT = path.normalize(parameters.JOB_PATH)
const MODEL_ROOT = parameters.MODEL_PATH

const router = serve.createRouter(parameters)

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
  const value = parameters[name]
  const status = value ? 'ok' : 'nok'
  ctx.body = { status, config: value }
})

const getHelpText = (config, dirCreated) => PORT =>  {
  return `

ESB-Dashboard File Backend
------------------------------------
Listening to http://localhost:${PORT}

Local dir for jobs:
  ${JOB_ROOT} ${dirCreated ? ' (neu angelegt)' : ''}

Local dir for model-data:
  ${MODEL_ROOT}
    
Base dir:
  ${__dirname}

Configuration:
  ${JSON.stringify(config, 2)}
  
Routes:
  GET  /jobs
  GET  /job/:jobname
  POST /job/save

  GET /model/:modelname

  GET  /checkalive
`
}


// ggf. Verzeichnis anlegen und auf jeden Fall Server starten
fsOld.mkdir(JOB_ROOT, err => {
  let dirCreated = true
  if (err) {
    if (err.message.indexOf('EEXIST') > -1) {
      dirCreated = false
    } else {
      console.log(err.message)
    }
  }

  serve.startServer(parameters, router, getHelpText(parameters, dirCreated))
})

