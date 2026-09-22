const serve = require('../backend-common/util')
const setupRoutes = require('./routes')
const parameters = require('../customisation/jobs.config.js')
const path = require('path')
const fsOld = require('fs')

const JOB_ROOT = path.normalize(parameters.JOB_PATH)
const MODEL_ROOT = parameters.MODEL_PATH

const router = serve.createRouter(parameters)
setupRoutes(router, JOB_ROOT, MODEL_ROOT)

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

