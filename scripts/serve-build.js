#!/usr/bin/env node
/**
 * Serve Build Script
 *
 * Serves ./frontend/build the way the production deployment does:
 * static files plus a reverse proxy /api -> auth backend.
 *
 * The SPA fixes the URL of the auth backend at build time as
 * `${window.location.protocol}//${window.location.hostname}/api`
 * (see frontend/src/logic/api/rest-api-local.js) -- without a port.
 * A deployment build therefore only works if the server answers on
 * port 80. Two modes make that possible:
 *
 * 1. Direct: this server listens on port 80 (needs a free port 80).
 * 2. Forward proxy: the browser is started with --proxy-server and asks
 *    this server for http://<vhost>/..., so port 80 is never bound.
 *
 * Usage: node scripts/serve-build.js [port] [auth-port]
 */

const fs = require('fs')
const http = require('http')
const net = require('net')
const os = require('os')
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
const VHOST = (process.env.SERVE_HOST || 'soa-dashboard.local').toLowerCase()

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

/**
 * /api/... -> Auth-Backend
 */
const proxyToAuth = (req, res, url) => {
  const target = url.substring('/api'.length) || '/'

  const proxyRequest = http.request(
    {
      host: '127.0.0.1',
      port: AUTH_PORT,
      path: target,
      method: req.method,
      headers: { ...req.headers, host: `localhost:${AUTH_PORT}` }
    },
    proxyResponse => {
      console.log(`${req.method} ${url} -> :${AUTH_PORT}${target} ${proxyResponse.statusCode}`)
      res.writeHead(proxyResponse.statusCode, proxyResponse.headers)
      proxyResponse.pipe(res)
    }
  )

  proxyRequest.on('error', err => {
    console.log(`${req.method} ${url} -> :${AUTH_PORT}${target} FEHLER (${err.code})`)
    res.writeHead(502, { 'Content-Type': MIME_TYPES['.json'] })
    res.end(JSON.stringify({
      result: false,
      error: `Auth-Backend auf Port ${AUTH_PORT} nicht erreichbar (${err.code})`
    }))
  })

  req.pipe(proxyRequest)
}

/**
 * Alles andere im Proxy-Modus: unveraendert an den echten Server weiterreichen
 */
const forwardToOrigin = (req, res, target) => {
  const proxyRequest = http.request(
    {
      host: target.hostname,
      port: target.port || 80,
      path: target.pathname + target.search,
      method: req.method,
      headers: req.headers
    },
    proxyResponse => {
      console.log(`${req.method} ${target.href} ${proxyResponse.statusCode}`)
      res.writeHead(proxyResponse.statusCode, proxyResponse.headers)
      proxyResponse.pipe(res)
    }
  )

  proxyRequest.on('error', err => {
    console.log(`${req.method} ${target.href} FEHLER (${err.code})`)
    res.writeHead(502, { 'Content-Type': MIME_TYPES['.txt'] })
    res.end(`Weiterleitung an ${target.host} fehlgeschlagen (${err.code})`)
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

const serveStatic = (req, res, url) => {
  const requested = decodeURIComponent(url.split('?')[0].split('#')[0])
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

const handle = (req, res, url) => {
  if (url === '/api' || url.startsWith('/api/')) {
    proxyToAuth(req, res, url)
    return
  }
  serveStatic(req, res, url)
}

if (!fs.existsSync(path.join(BUILD_DIR, 'index.html'))) {
  console.error(`✗ Kein Build gefunden unter ${BUILD_DIR}`)
  console.error('  Bitte zuerst "npm run build" ausführen.')
  process.exit(1)
}

const server = http.createServer((req, res) => {
  // Im Proxy-Modus schickt der Browser die absolute URL
  if (/^https?:\/\//i.test(req.url)) {
    const target = new URL(req.url)
    if (target.hostname.toLowerCase() === VHOST) {
      handle(req, res, target.pathname + target.search)
    } else {
      forwardToOrigin(req, res, target)
    }
    return
  }
  handle(req, res, req.url)
})

// https im Proxy-Modus: nur durchtunneln, nichts mitlesen
server.on('connect', (req, clientSocket, head) => {
  const [host, port] = req.url.split(':')
  const originSocket = net.connect(parseInt(port, 10) || 443, host, () => {
    clientSocket.write('HTTP/1.1 200 Connection Established\r\n\r\n')
    originSocket.write(head)
    originSocket.pipe(clientSocket)
    clientSocket.pipe(originSocket)
  })
  originSocket.on('error', () => clientSocket.destroy())
  clientSocket.on('error', () => originSocket.destroy())
})

server.on('error', err => {
  if (err.code === 'EADDRINUSE') {
    console.error(`✗ Port ${PORT} ist bereits belegt (netstat -ano | findstr :${PORT}).`)
  } else if (err.code === 'EACCES') {
    console.error(`✗ Port ${PORT} ist gesperrt.`)
    console.error('  Unter Windows reserviert http.sys den Port 80 häufig dauerhaft; Administratorrechte helfen dann nicht.')
    console.error('  Prüfen mit: netsh int ipv4 show excludedportrange protocol=tcp')
    console.error('  Alternative: diesen Server auf einem freien Port starten und den Browser im Proxy-Modus betreiben.')
  } else {
    console.error(`✗ Server-Fehler: ${err.message}`)
  }
  process.exit(1)
})

server.listen(PORT, () => {
  const userDataDir = path.join(os.tmpdir(), 'soa-dashboard-proxy')

  console.log(`

ESB-Dashboard Build-Server
--------------------------------------------
Statische Dateien:  ${BUILD_DIR}
Proxy:              /api  ->  http://localhost:${AUTH_PORT}
Port:               ${PORT}

1) Direktaufruf (nur mit freiem Port 80 sinnvoll):
   http://localhost${PORT === 80 ? '' : `:${PORT}`}${PORT === 80 ? '' : `
   ⚠ Der Deployment-Build ruft die Authentifizierung ohne Portangabe auf
     (http://localhost/api). Auf Port ${PORT} schlägt der Login daher fehl.`}

2) Als Browser-Proxy (ohne Administratorrechte, Port 80 bleibt unbelegt):
   chrome.exe --proxy-server="127.0.0.1:${PORT}" --user-data-dir="${userDataDir}" http://${VHOST}/

Das Auth-Backend separat starten (npm run start:auth oder node ./dist/auth).
Das Jobs-Backend spricht die SPA direkt auf http://localhost:4000 an (am Proxy vorbei).

Beenden mit Strg-C.
`)
})
