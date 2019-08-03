const endsWith = require('ramda').endsWith

const path = require('path')
const fs = require('fs').promises

const listJobs = async (dir) => {
  try {
    const files = await fs.readdir(dir)
    return files.filter(f => endsWith('.job.json', f))
  } catch (err) {
    console.log('Unable to scan directory: ' + err)
    return []
  }
}

const getJob = async (dir, jobname) => {
  try {
    const filepath = path.join(dir, jobname)
    if (path.dirname(filepath) !== path.normalize(dir)) {
      return { status: 'invalid file' }
    }

    const job = await fs.readFile(filepath, 'utf8')
    return { status: 'ok', job }
  } catch (err) {
    return { status: err.message }
  }
}

module.exports = {
  listJobs,
  getJob
}
