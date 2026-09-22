#!/usr/bin/env node
/**
 * Start Local Script
 *
 * Runs the complete local test setup for the built SPA:
 *
 *   1. builds the SPA locally (scripts/build-local.js) unless a local
 *      test build already exists
 *   2. starts the auth backend   (backend-auth/server.js)
 *   3. serves frontend/build     (scripts/serve-build.js)
 *   4. opens the browser
 *
 * Ctrl-C stops everything.
 *
 * Usage: node scripts/start-local.js [port] [--no-build] [--no-open]
 */

const { spawn } = require('child_process')
const path = require('path')

const { buildLocal, isLocalBuild, MARKER } = require('./build-local')

const ROOT_DIR = path.join(__dirname, '..')

const args = process.argv.slice(2)
const options = args.filter(arg => arg.startsWith('--'))
const PORT = parseInt(args.find(arg => !arg.startsWith('--')) || process.env.SERVE_PORT || '8099', 10)
const URL = `http://localhost:${PORT}`

const children = []

const start = (label, file, fileArgs) => {
  const child = spawn(process.execPath, [file, ...fileArgs], { cwd: ROOT_DIR })

  const print = data => {
    data.toString().split('\n').forEach(line => {
      if (line.trim().length > 0) console.log(`[${label}] ${line}`)
    })
  }

  child.stdout.on('data', print)
  child.stderr.on('data', print)
  child.on('exit', code => {
    console.log(`[${label}] beendet (Code ${code})`)
    stopAll(code === 0 ? 0 : 1)
  })

  children.push(child)
  return child
}

let stopping = false
const stopAll = (code = 0) => {
  if (stopping) return
  stopping = true
  children.forEach(child => child.kill())
  process.exit(code)
}

process.on('SIGINT', () => {
  console.log('\nBeende lokalen Test ...')
  stopAll(0)
})

const openBrowser = () => {
  if (options.includes('--no-open')) return
  const command = process.platform === 'win32'
    ? ['cmd', ['/c', 'start', '', URL]]
    : process.platform === 'darwin'
      ? ['open', [URL]]
      : ['xdg-open', [URL]]
  spawn(command[0], command[1], { detached: true, stdio: 'ignore' }).unref()
}

if (!options.includes('--no-build') && !isLocalBuild()) {
  console.log(`Kein lokaler Testbau gefunden (${MARKER} fehlt) - es wird zuerst gebaut.\n`)
  buildLocal()
  console.log('')
}

start('auth', path.join(ROOT_DIR, 'backend-auth/server.js'), [])
start('web', path.join(ROOT_DIR, 'scripts/serve-build.js'), [String(PORT)])

setTimeout(() => {
  console.log(`

Lokaler Test läuft
--------------------------------------------
Dashboard:     ${URL}
Auth-Backend:  http://localhost:4166 (bzw. LOCAL_SERVER_PORT)
Jobs-Backend:  http://localhost:4000 - falls benötigt, separat aus ../soa-dashboard-jobs starten

Beenden mit Strg-C.
`)
  openBrowser()
}, 1500)
