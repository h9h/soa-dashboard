# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project overview

ESB/SOA-Dashboard: a React SPA (`./frontend`) that visualizes log points, messages, queues, and statistics pulled from a SOA's REST interfaces, plus two small Koa backends:

- `./server.js` — authentication backend (LDAP/ActiveDirectory), serves the built SPA when run as `esb-dashboard.exe`
- `./backend-jobs/server.js` — housekeeping backend: read/write job definitions, logs, and model JSON from local directories

Authentication needs a real Node process because LDAP libraries depend on Node's `net` module, unavailable in the browser. See `README.md` for the full architecture diagram and rationale.

## Setup (required before running anything)

Backend and frontend customisation files are **not** in the repo (gitignored) and must be created before the servers will start:

- `./customisation/authentication.config.js`, `./customisation/authenticationImplementation.js`, optionally
  `./customisation/resend-users.config.js` — see `customisation/README.md`
- `./customisation/jobs.config.js` (defines `JOB_PATH`, `MODEL_PATH`, `LOCAL_SERVER_PORT`)
- `./frontend/src/customisation/configuration.config.js`, `./frontend/src/customisation/logo.png` — see
  `frontend/src/customisation/README.md`
- `./frontend/.env` based on `frontend/.env.example`

Without these, `require()` calls in `server.js` / `backend-jobs/server.js` / frontend config modules fail at startup/build.

## Commands

Root `package.json` scripts (run from repo root):

```
npm run start              # frontend (CRA hot reload, :3000) + auth backend (:4166) + jobs backend (:4000) in parallel
npm run start:auth         # auth backend only: node server.js
npm run start:file         # jobs backend only: node backend-jobs/server.js
npm run start:frontend     # frontend only (cd frontend && npm run start)
npm run build              # build the frontend SPA -> frontend/build
npm run ncc:build          # bundle both backends with @vercel/ncc -> dist/auth, dist/jobs
npm run pkg:all             # package both backends as Windows .exe via `pkg` -> esb-dashboard.exe, esb-jobs.exe
npm run build:all          # backup config + pkg:all + ncc:build, then copies dist/auth/index.js into frontend/build as auth.js
```

Frontend (`./frontend`):

```
npm run start      # react-scripts start (dev server, :3000)
npm run build      # react-scripts build
npm test           # react-scripts test (Jest, watch mode by default)
```

Run a single frontend test: `cd frontend && npm test -- <pattern>` (e.g. a filename or `-t "test name"`).

Note: the repo is mid-migration from Yarn to npm (`yarn.lock` removed, `package-lock.json` is now authoritative) — use `npm`, not `yarn`, despite older mentions of `yarn install`/`yarn start` in `README.md`.

There is no backend test suite or lint script configured at the repo root; the frontend's only configured lint is CRA's built-in `eslintConfig: { extends: "react-app" }`, enforced as warnings during `npm run build`/`start`.

### Windows packaging caveat

`pkg:server:dashboard` / `pkg:server:file` download Node binaries for `pkg`; behind a proxy this fails. Workaround documented in `README.md` under "zeit/pkg": manually download the matching `pkg-fetch` release into `~/.pkg-cache/v3.2` and rename it to `fetched-...`.

## Backend architecture

Both backends share `backend-common/util.js`:
- `createRouter(config)` — a `koa-router` with a standard `GET /checkalive` route (uptime, config dump, version)
- `createApp(router)` — wires up `koa-bodyparser`, `@koa/cors`, request logging, and an `X-Response-Time` header
- `startServer(config, router, helptext)` — starts the `http` server on `config.LOCAL_SERVER_PORT` (or `argv[2]`) and prints a help banner

**Auth backend** (`server.js` → `backend-auth/authentication.js` → `customisation/authenticationImplementation.js`
→ `backend-auth/ldap/ldapAuthentication.js`):
- `GET /dn/:user` — resolve a user's DN and whether they're authorized (LDAP group membership) and can resend messages
- `PUT /authenticate { user, password }` — bind against AD with the resolved DN
- When invoked as `esb-dashboard.exe` (detected via `process.argv[0]`), also serves the built SPA from `frontend/build` for `/` and `*`
- `resend-users.config.js` is an allowlist (by uppercased user-id) of who may resend messages; if absent, everyone authenticated can resend

**Jobs backend** (`backend-jobs/server.js` + `backend-jobs/jobs.js`):
- `GET /jobs`, `GET /job/:jobname`, `POST /job/save` — list/read/write `*.job.json` files under `JOB_PATH`
- `GET /model/:name`, `GET /config/:name` — read model JSON / expose individual config values
- All file writes are restricted to `JOB_PATH` directly (`checkStaysInDirectory`/`path.dirname` checks) to prevent path traversal outside the configured directory

## Frontend architecture

CRA app using Redux (single store, no middleware) + React Router v6 (`HashRouter`), lazy-loaded pages.

- `frontend/src/logic/store.js` — `initialState()` builds the entire Redux state tree (filters, time ranges, search params, view, persisted user session)
- `frontend/src/logic/reducer.js` — single reducer, one `case` per action type, handles filter/time/view changes and persists some values (user session, environment selection, configuration, color scheme) via `frontend/src/logic/Persistence.js` / browser `store`
- `frontend/src/logic/configuration.js` — runtime-configurable settings (time windows, page sizes, advanced tuning, mock mode) merged from `defaultConfiguration` with whatever is persisted in `localStorage`
  (`esb-dashboard` key); validated against a JSON schema in `configurationDefinition.js`
- `frontend/src/logic/api/` — REST clients: `rest-api-esb.js` (calls the SOA's own REST log/message APIs),
  `rest-api-local.js` (calls the two Node backends above: auth, checkalive, file/jobs), `rest-api-statistics.js`,
  `api-dashboard.js`. When `mock.doMock` is `'true'` (see customisation config), calls are replaced by fixtures in
  `frontend/src/logic/mock/`
- `frontend/src/logic/actionHandlers/` — higher-level operations against the SOA (resend, delete, "nur Log") built
  on top of `Executor.js`
- `frontend/src/App.js` — route table; routes under `<ProtectedRoute>` require a valid persisted user
  (`logic/authorization.js#checkValidUser`, session expires after 12h)
- Environment targets (which SOA stage to query) are configured per-deployment in
  `frontend/src/customisation/configuration.config.js` (`getDefaultUmgebungen`), selectable in the UI under "Umgebung"

## Working with this repo

- Backend code is plain CommonJS JavaScript (not TypeScript) despite the user's general TS preference — match the existing module style in `server.js`, `backend-auth/`, `backend-jobs/`, `backend-common/` rather than introducing TS tooling into this repo.
- Frontend is plain JS (CRA, not TS) using Redux/class-and-hook React, not htmx — match existing patterns.
- User-facing strings and comments in this codebase are predominantly German; match that when editing existing UI text/log messages.
