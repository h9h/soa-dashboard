#!/usr/bin/env node
/**
 * Serve Build Script
 *
 * Serves ./frontend/build the way the production deployment does:
 * static files plus a reverse proxy /api -> auth backend.
 *
 * The SPA builds its auth URL at build time as
 * `${window.location.protocol}//${window.location.hostname}/api`
 * (see frontend/src/logic/api/rest-api-local.js) -- without a port.
 * Therefore this server has to listen on port 80, otherwise the
 * deployed bundle cannot reach the auth backend.
 *
 * Usage: node scripts/serve-build.js [port] [auth-port]
 */

const fs = require('fs')
const http = require('http')
const path = require('path')

const BUILD_DIR = path.join(__dirname, '../frontend/build')

const getConfiguredAuthPort = () => {
  try {
    return parseInt(require('../customisation/authentication.config').LOCAL_SERVER_PORT, 10)
  } catch (_) {
    return 4166
  }
}

const PORT = parseInt(process.argv[2] || process.env.SERVE_PORT || '80', 10)
const AUTH_PORT = parseInt(process.argv[3] || process.env.AUTH_PORT || getConfiguredAuthPort(), 10)

const MIME_TYPES = {
  '.css': 'text/css',
  '.eot': 'application/vnd.ms-fontobject',
  '.gif': 'image/gif',
  '.html': 'text/html; charset=utf-8',
  '.ico': 'image/x-icon',
  '.jpeg': 'image/jpeg',
  '.jpg': 'image/jpeg',
  '.js': 'text/javascript; charset=utf-8',
  '.json': 'application/json; charset=utf-8',
  '.map': 'application/json; charset=utf-8',
  '.png': 'image/png',
  '.svg': 'image/svg+xml',
  '.ttf': 'font/ttf',
  '.txt': 'text/plain; charset=utf-8',
  '.webmanifest': 'application/manifest+json',
  '.woff': 'font/woff',
  '.woff2': 'font/woff2'
}

const proxyToAuth = (req, res) => {
  const target = req.url.substring('/api'.length) || '/'

  const proxyRequest = http.request(
    {
      host: '127.0.0.1',
      port: AUTH_PORT,
      path: target,
      method: req.method,
      headers: { ...req.headers, host: `localhost:${AUTH_PORT}` }
    },
    proxyResponse => {
      console.log(`${req.method} ${req.url} -> :${AUTH_PORT}${target} ${proxyResponse.statusCode}`)
      res.writeHead(proxyResponse.statusCode, proxyResponse.headers)
      proxyResponse.pipe(res)
    }
  )

  proxyRequest.on('error', err => {
    console.log(`${req.method} ${req.url} -> :${AUTH_PORT}${target} FEHLER (${err.code})`)
    res.writeHead(502, { 'Content-Type': MIME_TYPES['.json'] })
    res.end(JSON.stringify({
      result: false,
      error: `Auth-Backend auf Port ${AUTH_PORT} nicht erreichbar (${err.code})`
    }))
  })

  req.pipe(proxyRequest)
}

const serveFile = (res, filename, statusCode = 200) => {
  fs.readFile(filename, (err, content) => {
    if (err) {
      res.writeHead(404, { 'Content-Type': MIME_TYPES['.txt'] })
      res.end('Not found')
      return
    }
    res.writeHead(statusCode, {
      'Content-Type': MIME_TYPES[path.extname(filename).toLowerCase()] || 'application/octet-stream',
      'Cache-Control': 'no-store'
    })
    res.end(content)
  })
}

const serveStatic = (req, res) => {
  const requested = decodeURIComponent(req.url.split('?')[0].split('#')[0])
  const filename = path.join(BUILD_DIR, requested === '/' ? 'index.html' : requested)

  // Kein Ausbruch aus dem Build-Verzeichnis
  if (!path.resolve(filename).startsWith(path.resolve(BUILD_DIR))) {
    res.writeHead(403, { 'Content-Type': MIME_TYPES['.txt'] })
    res.end('Forbidden')
    return
  }

  fs.stat(filename, (err, stats) => {
    if (err || !stats.isFile()) {
      // Die SPA nutzt den HashRouter, unbekannte Pfade landen auf der index.html
      serveFile(res, path.join(BUILD_DIR, 'index.html'), 200)
      return
    }
    serveFile(res, filename)
  })
}

if (!fs.existsSync(path.join(BUILD_DIR, 'index.html'))) {
  console.error(`✗ Kein Build gefunden unter ${BUILD_DIR}`)
  console.error('  Bitte zuerst "npm run build" ausführen.')
  process.exit(1)
}

const server = http.createServer((req, res) => {
  if (req.url === '/api' || req.url.startsWith('/api/')) {
    proxyToAuth(req, res)
    return
  }
  serveStatic(req, res)
})

server.on('error', err => {
  if (err.code === 'EADDRINUSE') {
    console.error(`✗ Port ${PORT} ist bereits belegt.`)
    console.error('  Unter Windows belegen IIS oder http.sys häufig Port 80 (netstat -ano | findstr :80).')
  } else if (err.code === 'EACCES') {
    console.error(`✗ Keine Berechtigung für Port ${PORT} - Konsole als Administrator starten.`)
  } else {
    console.error(`✗ Server-Fehler: ${err.message}`)
  }
  process.exit(1)
})

server.listen(PORT, () => {
  console.log(`

ESB-Dashboard Build-Server
--------------------------------------------
Statische Dateien:  ${BUILD_DIR}
URL:                http://localhost${PORT === 80 ? '' : `:${PORT}`}
Proxy:              /api  ->  http://localhost:${AUTH_PORT}

Das Auth-Backend separat starten (npm run start:auth oder node ./dist/auth).
Das Jobs-Backend wird von der SPA direkt auf http://localhost:4000 angesprochen.
${PORT === 80 ? '' : `
⚠ Achtung: Der gebaute Bundle ruft die Authentifizierung ohne Portangabe auf
  (http://localhost/api). Auf Port ${PORT} schlägt der Login daher fehl.
`}
Beenden mit Strg-C.
`)
})
