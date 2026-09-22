# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project overview

ESB/SOA-Dashboard: a React SPA (`./frontend`) that visualizes log points, messages, queues, and statistics pulled from a SOA's REST interfaces, plus one small Koa backend:

- `./backend-auth/server.js` — authentication backend (LDAP/ActiveDirectory)

Authentication needs a real Node process because LDAP libraries depend on Node's `net` module, unavailable in the browser. See `README.md` for the full architecture diagram and rationale.

The housekeeping backend (job definitions, logs, model JSON) was ported to Go and now lives in its own repository, `../soa-dashboard-jobs`. Its REST protocol is unchanged, so the SPA's jobs UI (`PageJobs.js`, the `file` axios instance in `rest-api-local.js`, `REACT_APP_FILE_PORT`) still belongs here and talks to that process on `localhost:4000`. There is no `.exe` build in this repo any more — the dashboard is deployed as a static SPA plus the `ncc`-bundled auth backend.

## Setup (required before running anything)

Backend and frontend customisation files are **not** in the repo (gitignored) and must be created before the servers will start:

- `./customisation/authentication.config.js`, `./customisation/authenticationImplementation.js`, optionally
  `./customisation/resend-users.config.js` — see `customisation/README.md`
- `./frontend/src/customisation/configuration.config.js`, `./frontend/src/customisation/logo.png` — see
  `frontend/src/customisation/README.md`
- `./frontend/.env` based on `frontend/.env.example`

Without these, `require()` calls in `backend-auth/server.js` / frontend config modules fail at startup/build.

`npm run setup` (`scripts/setup-config.js`) copies the tracked templates in `config/*.example.js` into `customisation/` as a starting point.

## Commands

Root `package.json` scripts (run from repo root):

```
npm run start              # frontend (CRA hot reload, :3000) + auth backend (:4166) in parallel
npm run setup              # copy config/*.example.js -> customisation/ (first-time setup)
npm run start:auth         # auth backend only: node backend-auth/server.js
npm run start:frontend     # frontend only (cd frontend && npm run start)
npm run build              # build the frontend SPA -> frontend/build
npm run ncc:build          # bundle the auth backend with @vercel/ncc -> dist/auth
npm run build:all          # backup config + build + ncc:build, then copies dist/auth/index.js into frontend/build as auth.js
npm run serve:build        # serve frontend/build + proxy /api -> auth backend (local deployment test; :80, or any port in browser-proxy mode)
npm run build:local        # build the SPA with REACT_APP_USE_LOCAL_AUTHENTICATION=true (auth -> localhost; never deploy this)
npm run start:local        # build:local (if needed) + auth backend + serve:build on :8099 + open browser
npm run lint               # eslint over backend-*/**/*.js and scripts/**/*.js (npm run lint:fix to autofix)
```

Frontend (`./frontend`):

```
npm run start      # react-scripts start (dev server, :3000)
npm run build      # react-scripts build
npm test           # react-scripts test (Jest, watch mode by default)
```

Run a single frontend test: `cd frontend && npm test -- <pattern>` (e.g. a filename or `-t "test name"`).

Note: the repo is mid-migration from Yarn to npm (`yarn.lock` removed, `package-lock.json` is now authoritative) — use `npm`, not `yarn`, despite older mentions of `yarn install`/`yarn start` in `README.md`.

There is no backend test suite. Backend linting is `npm run lint` (eslint, config in `.eslintrc.js`); the frontend's only configured lint is CRA's built-in `eslintConfig: { extends: "react-app" }`, enforced as warnings during `npm run build`/`start`.

Note: `eslint` is declared in `devDependencies` but is not in `package-lock.json` and not installed in the root `node_modules`, so `npm run lint` falls back to fetching it via `npx` — which hangs behind the corporate proxy. `node --check` is the practical syntax gate until the lockfile can be regenerated with registry access.

## Backend architecture

The auth backend uses `backend-common/util.js`:
- `createRouter(config)` — a `koa-router` with a standard `GET /checkalive` route (uptime, config dump, version)
- `createApp(router)` — wires up `koa-bodyparser`, `@koa/cors`, request logging, and an `X-Response-Time` header
- `startServer(config, router, helptext)` — starts the `http` server on `config.LOCAL_SERVER_PORT` (or `argv[2]`) and prints a help banner

**Auth backend** (`backend-auth/server.js` → `backend-auth/routes.js` → `backend-auth/authentication.js`
→ `customisation/authenticationImplementation.js` → `backend-auth/ldap/ldapAuthentication.js`):
- `GET /dn/:user` — resolve a user's DN and whether they're authorized (LDAP group membership) and can resend messages
- `PUT /authenticate { user, password }` — bind against AD with the resolved DN
- `resend-users.config.js` is an allowlist (by uppercased user-id) of who may resend messages; if absent, everyone authenticated can resend

**Jobs backend** — not in this repo, see `../soa-dashboard-jobs` (Go). Routes consumed by the SPA: `PUT /log`, `GET /jobs`, `GET /job/:jobname`, `POST /job/save`, `GET /model/:name`, `GET /config/:name`, `GET /checkalive`. Changing `rest-api-local.js`'s `file` instance means changing that repository too.

## Frontend architecture

CRA app using Redux (single store, no middleware) + React Router v6 (`HashRouter`), lazy-loaded pages.

- `frontend/src/logic/store.js` — `initialState()` builds the entire Redux state tree (filters, time ranges, search params, view, persisted user session)
- `frontend/src/logic/reducer.js` — single reducer, one `case` per action type, handles filter/time/view changes and persists some values (user session, environment selection, configuration, color scheme) via `frontend/src/logic/Persistence.js` / browser `store`
- `frontend/src/logic/configuration.js` — runtime-configurable settings (time windows, page sizes, advanced tuning, mock mode) merged from `defaultConfiguration` with whatever is persisted in `localStorage`
  (`esb-dashboard` key); validated against a JSON schema in `configurationDefinition.js`
- `frontend/src/logic/api/` — REST clients: `rest-api-esb.js` (calls the SOA's own REST log/message APIs),
  `rest-api-local.js` (calls the auth backend and the external jobs backend: auth, checkalive, file/jobs), `rest-api-statistics.js`,
  `api-dashboard.js`. When `mock.doMock` is `'true'` (see customisation config), calls are replaced by fixtures in
  `frontend/src/logic/mock/`
- `rest-api-local.js#getLocalURL` fixes the auth base URL **at build time**:
  `http://localhost:<REACT_APP_AUTHENTICATION_PORT>` when `REACT_APP_USE_LOCAL_AUTHENTICATION=true`, otherwise
  `<protocol>//<hostname>/api` — without a port. A deployment build therefore cannot be tested by opening
  `frontend/build/index.html` from disk (it would call `file:///api`); use `npm run serve:build`
  (`scripts/serve-build.js`, static files + `/api` proxy). Port 80 is usually blocked by an http.sys reservation
  on Windows (admin rights don't help), so the script doubles as an HTTP forward proxy: run it on any port and
  start the browser with `--proxy-server=127.0.0.1:<port>` against `http://soa-dashboard.local/`. The practical
  path is `npm run start:local` (local test build against `localhost`, marked by
  `frontend/build/LOKALER-TESTBUILD.txt` — that build must not be deployed). The jobs backend is always
  `http://localhost:<REACT_APP_FILE_PORT>`
- `frontend/src/logic/actionHandlers/` — higher-level operations against the SOA (resend, delete, "nur Log") built
  on top of `Executor.js`
- `frontend/src/App.js` — route table; routes under `<ProtectedRoute>` require a valid persisted user
  (`logic/authorization.js#checkValidUser`, session expires after 12h)
- Environment targets (which SOA stage to query) are configured per-deployment in
  `frontend/src/customisation/configuration.config.js` (`getDefaultUmgebungen`), selectable in the UI under "Umgebung"

## Working with this repo

- Backend code is plain CommonJS JavaScript (not TypeScript) despite the user's general TS preference — match the existing module style in `backend-auth/`, `backend-common/`, `scripts/` rather than introducing TS tooling into this repo.
- Frontend is plain JS (CRA, not TS) using Redux/class-and-hook React, not htmx — match existing patterns.
- User-facing strings and comments in this codebase are predominantly German; match that when editing existing UI text/log messages.
