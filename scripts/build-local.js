#!/usr/bin/env node
/**
 * Build Local Script
 *
 * Builds the SPA with REACT_APP_USE_LOCAL_AUTHENTICATION=true, so the
 * bundle calls the auth backend directly on http://localhost:<port>
 * instead of <protocol>//<hostname>/api (see
 * frontend/src/logic/api/rest-api-local.js).
 *
 * The result runs from any port -- and from file:// -- but points at
 * localhost and must never be deployed. A marker file in the build
 * directory records that.
 *
 * Usage: node scripts/build-local.js
 */

const { spawnSync } = require('child_process')
const fs = require('fs')
const path = require('path')

const FRONTEND_DIR = path.join(__dirname, '../frontend')
const BUILD_DIR = path.join(FRONTEND_DIR, 'build')

const MARKER = 'LOKALER-TESTBUILD.txt'
const MARKER_FILE = path.join(BUILD_DIR, MARKER)

const buildLocal = () => {
  console.log('SOA Dashboard - Lokaler Testbau')
  console.log('====================================\n')
  console.log('REACT_APP_USE_LOCAL_AUTHENTICATION=true')
  console.log('-> Authentifizierung geht direkt an http://localhost:<REACT_APP_AUTHENTICATION_PORT>\n')

  // Ein einzelner Kommandostring, damit node bei shell: true nicht DEP0190 meldet
  const result = spawnSync('npm run build', {
    cwd: FRONTEND_DIR,
    env: { ...process.env, REACT_APP_USE_LOCAL_AUTHENTICATION: 'true' },
    stdio: 'inherit',
    shell: true
  })

  if (result.status !== 0) {
    console.error('\n✗ Der Build ist fehlgeschlagen.')
    process.exit(result.status === null ? 1 : result.status)
  }

  fs.writeFileSync(MARKER_FILE, `Lokaler Testbau vom ${new Date().toISOString()}

Dieser Build wurde mit REACT_APP_USE_LOCAL_AUTHENTICATION=true erzeugt und ruft die
Authentifizierung auf http://localhost auf. Er darf NICHT deployt werden.

Für ein Deployment neu bauen mit: npm run build
`)

  console.log('\n' + '='.repeat(40))
  console.log(`✓ Lokaler Testbau liegt unter ${BUILD_DIR}`)
  console.log(`⚠ Nicht deployen - Hinweis dazu in ${MARKER}`)
  console.log('\nNächster Schritt: npm run start:local')
}

const isLocalBuild = () => fs.existsSync(MARKER_FILE)

if (require.main === module) buildLocal()

module.exports = { buildLocal, isLocalBuild, BUILD_DIR, MARKER, MARKER_FILE }
