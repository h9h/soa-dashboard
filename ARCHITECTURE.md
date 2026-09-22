# Architecture — ESB/SOA-Dashboard

> Status: describes the code as of branch `master`, frontend version `1.2.114`.
> Written in English; German domain terms (`Umgebung`, `Logpunkt`, `Queue`, `Job`) are kept
> verbatim because they are identifiers in the code and in the UI.

## 1. Purpose and scope

The ESB/SOA-Dashboard is an operations tool. It gives support and operations staff a read/write
view onto a running SOA/ESB installation:

- **Logpunkte** — the trace records the ESB writes for every service call, searchable by time
  window, Message-Id, Sender-FQN, Service-Namespace, Operation, Process-Instance-Id, …
- **Messages** — undelivered/expired/rejected messages, including their payload
- **Queues** — AQ queue tables and the messages sitting in them
- **Statistics** — aggregated call/fault/timing statistics rendered with `dc.js` + `crossfilter`
- **Checkalive** — results of the SOA's own availability runs
- **Housekeeping-Jobs** — bulk operations ("resend", "delete", "nur Log") over a saved selection
  of messages, persisted as job files on a local disk

The system deliberately holds **no database of its own**. Every piece of business data is fetched
live from the SOA's REST interface; the only state the dashboard owns is user session, UI
configuration, and job files.

### Architecturally significant requirements

| # | Requirement | Consequence |
|---|---|---|
| R1 | Authenticate against ActiveDirectory/LDAP | Needs a Node process — LDAP libraries depend on Node's `net`, unavailable in the browser |
| R2 | One build must serve several SOA stages (DEV/TEST/PROD) | Target URL is runtime configuration (`Umgebung`), not build-time |
| R3 | Deployable as a plain static drop plus one process, or as a single `.exe` | Backends are bundled with `ncc` and packaged with `pkg` |
| R4 | Job files and model data live on a local/served filesystem | Second backend with filesystem access, strictly path-fenced |
| R5 | Must be demoable/developable without a SOA | Global mock mode replaces every REST client with fixtures |

---

## 2. C4 Level 1 — System context

```mermaid
C4Context
    title Level 1 — System context, ESB/SOA-Dashboard

    Person(operator, "Betriebs-/Anwendungsbetreuer", "Analyses service calls, inspects messages, resends or deletes stuck messages")

    System(dashboard, "ESB/SOA-Dashboard", "React SPA plus two small Koa backends. Visualises logpoints, messages, queues and statistics; drives housekeeping jobs")

    System_Ext(soa, "SOA / ESB Runtime", "One instance per Umgebung (DEV/TEST/PROD). Exposes /dashboard/* and /me/* REST resources over its logpoint DB and AQ queues")
    System_Ext(ad, "ActiveDirectory / LDAP", "Corporate directory. Owns identities and the authorisation group")
    System_Ext(fileshare, "Job- und Modellverzeichnis", "Local or mounted Windows directories holding *.job.json, *.log and model JSON")

    Rel(operator, dashboard, "Uses", "HTTPS / Browser")
    Rel(dashboard, soa, "Reads logpoints, messages, queues, statistics; enqueues and deletes messages", "REST, JSON/XML")
    Rel(dashboard, ad, "Resolves DN, checks group membership, binds credentials", "LDAP")
    Rel(dashboard, fileshare, "Reads/writes job definitions, job logs, model data", "Filesystem")

    UpdateLayoutConfig($c4ShapeInRow="2", $c4BoundaryInRow="1")
```

**Key point:** the dashboard is a *client* of the SOA in the strict sense. It never talks to the
SOA's database directly and never holds a replica of SOA data.

---

## 3. C4 Level 2 — Containers

```mermaid
C4Container
    title Level 2 — Containers

    Person(operator, "Betriebs-/Anwendungsbetreuer", "Browser user")

    Container_Boundary(dash, "ESB/SOA-Dashboard") {
        Container(spa, "Dashboard SPA", "React 17, CRA 5, Redux 4, React Router 6 (HashRouter)", "All UI and all business logic. Talks to the SOA directly from the browser")
        Container(auth, "Auth Backend", "Node.js, Koa 2, activedirectory2/ldapjs", "GET /dn/:user, PUT /authenticate, GET /version, GET /checkalive. When run as esb-dashboard.exe it also serves the built SPA")
        Container(jobs, "Jobs Backend", "Node.js, Koa 2, fs", "GET /jobs, GET /job/:name, POST /job/save, PUT /log, GET /model/:name, GET /config/:name, GET /checkalive")
        ContainerDb(files, "Job- und Modellverzeichnis", "Windows filesystem (JOB_PATH, MODEL_PATH)", "*.job.json job definitions, *.log traces, model JSON such as SenderFQN2QueueName.json")
        ContainerDb(browserstore, "Browser Storage", "localStorage via store.js (cookie fallback)", "Keys esbd.user (session) and esb-dashboard (UI configuration)")
    }

    System_Ext(soa, "SOA / ESB Runtime", "Per-Umgebung REST endpoint")
    System_Ext(ad, "ActiveDirectory / LDAP", "Corporate directory")

    Rel(operator, spa, "Uses", "HTTPS")
    Rel(spa, auth, "PUT /authenticate, GET /dn/:user, GET /version, GET /checkalive", "JSON/HTTP")
    Rel(spa, jobs, "Job CRUD, model + config lookup, client-side trace logging", "JSON/HTTP, localhost:4000")
    Rel(spa, soa, "GET logpoints/messages/queues/statistics, POST resend (XML), DELETE message", "REST")
    Rel(spa, browserstore, "Persists session and configuration", "Web Storage API")
    Rel(auth, ad, "find(CN=...), authenticate(dn, password)", "LDAP")
    Rel(jobs, files, "readdir / readFile / writeFile / appendFile", "fs")

    UpdateLayoutConfig($c4ShapeInRow="3", $c4BoundaryInRow="1")
```

### Container responsibilities

| Container | Source | Responsibility | Deliberately *not* responsible for |
|---|---|---|---|
| Dashboard SPA | `frontend/` | All domain logic: filtering, aggregation, timeline construction, job orchestration | Authentication against LDAP; filesystem access |
| Auth Backend | `server.js`, `backend-auth/` | LDAP DN resolution, group-based authorisation, credential bind, version endpoint, optional static hosting of the SPA | Session storage — it is completely stateless, a `kill` is a safe stop |
| Jobs Backend | `backend-jobs/` | Path-fenced filesystem I/O for jobs, logs, models, and exposing selected config values | Authentication — it has none (see §7.2) |

### Why the SPA calls the SOA directly

There is no API gateway of the dashboard's own. `frontend/src/logic/api/rest-api-esb.js` issues
`axios` calls straight from the browser to the URL configured for the selected `Umgebung`. This
keeps the backends trivial and stateless (R3) and makes switching stage a pure client-side
concern (R2) — at the cost of requiring CORS/network reachability from the client to every SOA
stage.

---

## 4. C4 Level 3 — Components

### 4.1 Dashboard SPA

```mermaid
C4Component
    title Level 3 — Components inside the Dashboard SPA

    Container_Boundary(spa, "Dashboard SPA") {
        Component(app, "App / Routing", "React Router 6 HashRouter, React.lazy", "Route table. Public routes (login, help, profile, checkalive, standalone statistics) vs. ProtectedRoute-wrapped routes")
        Component(pages, "Pages", "PageDashboard, PageQueues, PageMessages, PageJobs, PageStatistics, PageServicecall, PageCheckalive, …", "One lazy-loaded module per screen; composes Header + BodyArea + tables/charts")
        Component(components, "UI component library", "components/, components/cells/, components/table/, components/dc/", "Bootstrap/Atlaskit widgets, react-table renderers, dc.js chart wrappers, vis-timeline service view")

        Component(store, "Redux store", "redux 4, single reducer, no middleware", "initialState() in logic/store.js; one case per action in logic/reducer.js")
        Component(persistence, "Persistence", "logic/Persistence.js over store.js", "Wraps localStorage with cookie fallback (Edge bug with file:// origins)")
        Component(config, "Configuration", "logic/configuration.js + configurationDefinition.js", "defaultConfiguration deep-merged with localStorage, validated against a jsonschema. Holds Umgebungen, time windows, page sizes, mock flag, debug level")
        Component(authz, "Authorization", "logic/authorization.js", "checkValidUser (12h session TTL), checkAvailability, checkVersion, per-user rights")

        Component(apiesb, "rest-api-esb", "logic/api/rest-api-esb.js", "Low-level axios wrapper for the SOA: fetchData/getData/postDataXml/del, header+rows to object mapping, evolveData normalisation, toast on error")
        Component(apidash, "api-dashboard", "logic/api/api-dashboard.js", "Builds every SOA URL from Umgebung + filter: LogPoints, Messages, Databases, Queues, Queuetables, CheckAliveRuns, resend, delete")
        Component(apistat, "rest-api-statistics", "logic/api/rest-api-statistics.js", "Slices the statistics query by hours, aggregates into crossfilter dimensions, derives domains and timing buckets")
        Component(apilocal, "rest-api-local", "logic/api/rest-api-local.js", "Two axios instances: auth backend and jobs backend. Login, version, checkalive, job save (64 KiB chunks), model/config lookup, logToFile")
        Component(handlers, "Action handlers", "logic/actionHandlers/ + Executor.js", "resendMessages, deleteMessage, nurLog. Executor runs the steps of a job, short-circuits on first failure, collects a per-step result protocol")
        Component(mock, "Mock fixtures", "logic/mock/", "Fixture data returned instead of REST results when mock.doMock === 'true'")
    }

    System_Ext(soa, "SOA / ESB Runtime", "")
    System_Ext(authx, "Auth Backend", "")
    System_Ext(jobsx, "Jobs Backend", "")

    Rel(app, pages, "renders")
    Rel(app, store, "Provider")
    Rel(pages, components, "composes")
    Rel(pages, apidash, "queries")
    Rel(pages, apistat, "queries")
    Rel(pages, handlers, "triggers jobs")
    Rel(app, authz, "ProtectedRoute guard")
    Rel(authz, apilocal, "loginUser / getVersion / checkAlive")
    Rel(store, persistence, "persists user, Umgebung, configuration, colour scheme")
    Rel(store, config, "seeds initialState")
    Rel(apidash, apiesb, "getData / postDataXml / del")
    Rel(apidash, config, "getEsbUrl(Umgebung)")
    Rel(handlers, apidash, "getMessage / resend / delete")
    Rel(handlers, apilocal, "getModel (SenderFQN to Queue)")
    Rel(apiesb, mock, "substitutes when mocking")
    Rel(apiesb, soa, "REST")
    Rel(apiesb, apilocal, "log.file — trace to jobs backend")
    Rel(apilocal, authx, "HTTP")
    Rel(apilocal, jobsx, "HTTP")

    UpdateLayoutConfig($c4ShapeInRow="3", $c4BoundaryInRow="1")
```

Notable structural facts:

- **The Redux store is deliberately thin.** It carries *filter state* (Umgebung, date, from/to,
  search type and value, message type, view, colour scheme) and the user session — not fetched
  data. Data lives in component state, fetched via callback-style `getXxx(filter, cb)` APIs.
- **`Executor` is the job engine.** Every housekeeping operation is a sequence of named steps
  (`ermittle Queuename` → `get Message` → `resend Message` → `delete Message` → `check Message
  deleted`). It stops at the first failing step and returns a numbered protocol, which is what the
  UI shows and what gets appended to the job log.
- **Mock mode is a system-wide switch,** not a test double injected per call site. `mock.doMock`
  is read inside the API modules and inside `authorization.js`, so a mocked build logs in with a
  synthetic user and serves fixtures.
- **`log.file`** routes selected client-side traces (`rest-api-esb`, `rest-api-statistics`) to
  `PUT /log` on the jobs backend, i.e. the browser writes trace files onto the operator's disk.

### 4.2 Auth Backend

```mermaid
C4Component
    title Level 3 — Components inside the Auth Backend

    Container_Boundary(authc, "Auth Backend (server.js)") {
        Component(routes, "Route layer", "server.js, koa-router", "GET /dn/:user, PUT /authenticate, GET /version, GET /checkalive. If argv[0] contains esb-dashboard.exe, also GET / and GET * serving frontend/build")
        Component(common, "backend-common/util", "Koa app factory", "createRouter (adds /checkalive with uptime, config dump, version), createApp (bodyparser 32 MB, CORS, request log, X-Response-Time), startServer (port from config or argv[2])")
        Component(indirect, "authentication.js", "Indirection module", "Re-exports getDN/checkLogin/config from customisation/authenticationImplementation.js")
        Component(custom, "authenticationImplementation.js", "Customisation hook (gitignored)", "Points at the bundled LDAP implementation, or at an installation-specific one")
        Component(ldap, "ldapAuthentication.js", "activedirectory2 promiseWrapper", "getDN: find(CN=escaped) with includeMembership; entryParser records the DN and whether GROUP is in groupMembership. checkLogin: resolve DN, require isAuthorized, then ad.authenticate(dn, password)")
        Component(cfgauth, "authentication.config.js", "Customisation (gitignored)", "URL_LDAP, BASE_DN, GROUP, LOCAL_SERVER_PORT")
        Component(resend, "resend-users.config.js", "Customisation (optional)", "Allowlist of uppercased user-ids permitted to resend. Absent means every authenticated user may resend")
    }

    System_Ext(ad, "ActiveDirectory / LDAP", "")
    System_Ext(build, "frontend/build", "Static SPA assets")

    Rel(routes, common, "createRouter / createApp / startServer")
    Rel(routes, indirect, "getDN, checkLogin")
    Rel(indirect, custom, "require")
    Rel(custom, ldap, "delegates")
    Rel(ldap, cfgauth, "reads")
    Rel(ldap, resend, "reads (optional)")
    Rel(ldap, ad, "LDAP find / bind")
    Rel(routes, build, "koa-send (exe mode only)")

    UpdateLayoutConfig($c4ShapeInRow="3", $c4BoundaryInRow="1")
```

The `authentication.js` → `customisation/authenticationImplementation.js` hop is the extension
point: an installation that does not use ActiveDirectory implements `getDN` and `checkLogin`
itself and never touches `backend-auth/ldap/`.

LDAP filter values are escaped per RFC 4515 (`escapeFilterValue`) before being interpolated into
`CN=…`, so a user-id like `a*` cannot turn the lookup into a wildcard search.

### 4.3 Jobs Backend

```mermaid
C4Component
    title Level 3 — Components inside the Jobs Backend

    Container_Boundary(jobsc, "Jobs Backend (backend-jobs/server.js)") {
        Component(jroutes, "Route layer", "koa-router", "PUT /log, GET /jobs, GET /job/:jobname, POST /job/save, GET /model/:name, GET /config/:name, GET /checkalive")
        Component(jcommon, "backend-common/util", "shared", "Same app factory as the auth backend")
        Component(guard, "Path guard", "checkStaysInDirectory / getJob", "Rejects any resolved path whose dirname is not exactly JOB_ROOT (resp. the model dir) — blocks ../ traversal and subdirectory writes")
        Component(jobsmod, "jobs.js", "fs helpers", "listJobs filters *.job.json; getJob reads a single file with the same dirname check")
        Component(jcfg, "jobs.config.js", "Customisation (gitignored)", "JOB_PATH, MODEL_PATH, LOCAL_SERVER_PORT, plus arbitrary values exposed via GET /config/:name")
    }

    ContainerDb(fs, "Filesystem", "JOB_PATH / MODEL_PATH", "")

    Rel(jroutes, jcommon, "uses")
    Rel(jroutes, guard, "validates every write path")
    Rel(jroutes, jobsmod, "listJobs / getJob")
    Rel(jroutes, jcfg, "reads config values")
    Rel(jobsmod, fs, "fs.promises")
    Rel(jroutes, fs, "appendFile / writeFile")

    UpdateLayoutConfig($c4ShapeInRow="3", $c4BoundaryInRow="1")
```

`JOB_ROOT` is created on startup if missing (`fs.mkdir`, `EEXIST` tolerated), then the server
starts.

---

## 5. Runtime views

### 5.1 Login

```mermaid
sequenceDiagram
    autonumber
    actor U as Operator
    participant SPA as Dashboard SPA
    participant A as Auth Backend
    participant AD as ActiveDirectory

    U->>SPA: opens /#/login
    SPA->>A: GET /checkalive
    A-->>SPA: 200 (else: stop icon, login disabled)
    SPA->>A: GET /version
    A-->>SPA: { version } compared with REACT_APP_VERSION
    U->>SPA: user + password
    SPA->>A: PUT /authenticate { user, password }
    A->>AD: find(CN=escaped user, includeMembership)
    AD-->>A: entry (dn, groupMembership)
    Note over A: isAuthorized = GROUP unset OR GROUP in groupMembership
    alt not found or not authorized
        A-->>SPA: { result: null }
        SPA-->>U: login rejected
    else authorized
        A->>AD: authenticate(dn, password)
        AD-->>A: bind ok
        A-->>SPA: { result: { timestamp, userId, canResend, idm } }
        SPA->>SPA: dispatch loggedIn, persist esbd.user in localStorage
        SPA-->>U: redirect to start page
    end
```

The returned object *is* the session: there is no token and no server-side session store.
`checkValidUser` treats it as valid for 12 hours from `timestamp`, and `ProtectedRoute` re-checks
it on every protected navigation. A restart of the auth backend logs nobody out.

### 5.2 Querying logpoints

```mermaid
sequenceDiagram
    autonumber
    actor U as Operator
    participant P as PageDashboard
    participant AD as api-dashboard
    participant RE as rest-api-esb
    participant S as SOA (selected Umgebung)
    participant J as Jobs Backend

    U->>P: sets Umgebung, date, from/to, search type + value
    P->>AD: getLogpoints(filter, cb)
    AD->>AD: getEsbUrl(Umgebung) from configuration
    Note over AD: with a search value and bis != 00:00:00 the window is widened<br/>backwards by filter.widenFilter.anzahlMitSuchparameter
    AD->>RE: getData(API.LOGPOINT, url, cb)
    RE->>J: PUT /log (trace: start get-call)
    RE->>S: GET /dashboard/LogPoints/{datum}?from&to&searchType
    S-->>RE: { header, rows }
    RE->>RE: header+rows to objects, evolveData (ORIGINATOR, MEP, Sender, Timestamp)
    RE->>J: PUT /log (trace: end get-call, noOfRecords)
    RE-->>P: cb({ status: 'ready', data })
    P-->>U: LogTable / LogpointDistribution / timeline
```

On an axios error `fetchData` raises a non-auto-closing toast, calls back with
`status: 'Keine Daten abgeholt'`, and returns `{ abort: true }` — errors surface in the UI rather
than being swallowed, and no partial render is attempted.

### 5.3 Housekeeping: resending a queued message

```mermaid
sequenceDiagram
    autonumber
    actor U as Operator
    participant PJ as PageJobs / Jobs
    participant L as rest-api-local
    participant J as Jobs Backend
    participant EX as Executor
    participant AD as api-dashboard
    participant S as SOA

    Note over PJ,J: precondition — GET /model/SenderFQN2QueueName must exist
    PJ->>L: getModel('SenderFQN2QueueName')
    L->>J: GET /model/SenderFQN2QueueName
    J-->>L: model JSON (cached in a Map)

    U->>PJ: saves the current selection as a job
    PJ->>L: saveJob(jobname, { filter…, filteredMessages })
    loop per message, 64 KiB chunks
        L->>J: POST /job/save { jobname, chunk, append: true }
        J->>J: checkStaysInDirectory(JOB_ROOT/jobname.job.json)
    end
    Note over L: payload is trimmed once the selection exceeds<br/>advanced.maxQueuedMessagesWithMessagecontent

    U->>PJ: runs "Resend"
    loop per record
        PJ->>EX: resendMessages(withQueueMessage)(record)
        EX->>AD: 1 ermittle Queuename (via model lookup)
        EX->>AD: 2 getMessage(Umgebung, messageType, ID)
        AD->>S: GET /dashboard/{Type}Messages/{id}
        EX->>AD: 3 resendMessage(...)
        AD->>S: POST /me/Databases/ME/Queues?MEP&operation&QueueName (XML body)
        S-->>AD: { JMSMessageID } — absent means the step fails
        EX->>AD: 4 deleteMessage(...)
        AD->>S: DELETE /dashboard/{Type}Messages/{id}
        EX->>AD: 5 check Message deleted (must not be found)
        EX-->>PJ: numbered step protocol { success, result }
    end
    PJ->>J: PUT /log (job protocol appended to jobname.log)
```

Two independent gates protect resending: `canResend` on the session (from
`resend-users.config.js`) and the fact that `checkAliveFile` — and therefore the whole jobs
backend integration — is only probed for users who have it.

---

## 6. Deployment views

### 6.1 Development

```mermaid
C4Deployment
    title Deployment — development (npm run start)

    Deployment_Node(dev, "Developer workstation", "Windows 11") {
        Deployment_Node(cra, "CRA dev server", "react-scripts, :3000") {
            Container(spa, "Dashboard SPA", "hot reload", "")
        }
        Deployment_Node(nodeauth, "node server.js", "Node.js, :4166") {
            Container(auth, "Auth Backend", "Koa", "")
        }
        Deployment_Node(nodejobs, "node backend-jobs/server.js", "Node.js, :4000") {
            Container(jobs, "Jobs Backend", "Koa", "")
        }
        Deployment_Node(disk, "Local disk", "C:/Dashboard, C:/DashboardModel") {
            ContainerDb(files, "Job- und Modelldateien", "*.job.json, *.log, *.json", "")
        }
    }

    Deployment_Node(corp, "Corporate network", "") {
        System_Ext(soa, "SOA REST endpoints", "one per Umgebung")
        System_Ext(ad, "ActiveDirectory", "")
    }

    Rel(spa, auth, "REACT_APP_USE_LOCAL_AUTHENTICATION=true, http://localhost:4166")
    Rel(spa, jobs, "http://localhost:4000")
    Rel(spa, soa, "REST")
    Rel(auth, ad, "LDAP")
    Rel(jobs, files, "fs")
```

### 6.2 Server deployment (`build:all`)

```mermaid
C4Deployment
    title Deployment — served SPA plus auth process

    Deployment_Node(client, "Client workstation", "Windows") {
        Deployment_Node(browser, "Browser", "Chrome / Edge") {
            Container(spa, "Dashboard SPA", "static bundle from frontend/build", "")
            ContainerDb(ls, "localStorage", "esbd.user, esb-dashboard", "")
        }
        Deployment_Node(exejobs, "esb-jobs.exe", "pkg, node10-win-x64, :4000") {
            Container(jobs, "Jobs Backend", "", "")
        }
        Deployment_Node(disk, "Local disk", "JOB_PATH / MODEL_PATH") {
            ContainerDb(files, "Job- und Modelldateien", "", "")
        }
    }

    Deployment_Node(server, "Web server", "Windows / reverse proxy") {
        Deployment_Node(static, "Static hosting", "frontend/build") {
            Container(assets, "SPA assets + auth.js", "bundled auth backend copied in as auth.js", "")
        }
        Deployment_Node(nodeauth, "node ./auth.js", "Node.js, :4166") {
            Container(auth, "Auth Backend", "stateless", "")
        }
    }

    System_Ext(ad, "ActiveDirectory", "")
    System_Ext(soa, "SOA REST endpoints", "")

    Rel(spa, assets, "loads")
    Rel(spa, auth, "protocol//hostname/api — reverse proxy to :4166")
    Rel(spa, jobs, "http://localhost:4000")
    Rel(spa, soa, "REST, per selected Umgebung")
    Rel(spa, ls, "session + configuration")
    Rel(auth, ad, "LDAP")
    Rel(jobs, files, "fs")
```

`rest-api-local.js#getLocalURL` encodes exactly this split:

| Target | `REACT_APP_USE_LOCAL_AUTHENTICATION` | Resulting base URL |
|---|---|---|
| Auth backend | `true` | `http://localhost:${REACT_APP_AUTHENTICATION_PORT}` |
| Auth backend | anything else | `${window.location.protocol}//${window.location.hostname}/api` |
| Jobs backend | irrelevant | `http://localhost:${REACT_APP_FILE_PORT}` |

The jobs backend is therefore **always** a per-workstation process; the auth backend can be
central behind a reverse proxy that maps `/api` onto port 4166.

### 6.3 Standalone `esb-dashboard.exe`

`esb-dashboard.exe` packs the SPA (`pkg.assets: frontend/build/**/*`) together with the auth
backend. It detects its own mode via `process.argv[0].indexOf('esb-dashboard.exe') > -1` and, in
that case, registers `GET /` and `GET *` to `koa-send` from `frontend/build`. The whole dashboard
is then reachable at `http://localhost:4166`, no web server required.

### 6.4 Build pipeline

```mermaid
flowchart LR
    subgraph src[Sources]
        FE[frontend/src]
        BE["server.js, backend-auth/, backend-common/"]
        BJ["backend-jobs/"]
        CU["customisation/*, frontend/src/customisation/*, frontend/.env"]
    end

    CU -.->|required at require-time| FE
    CU -.-> BE
    CU -.-> BJ

    FE -->|react-scripts build| BUILD[frontend/build]
    BE -->|ncc build| DA[dist/auth/index.js]
    BJ -->|ncc build| DJ[dist/jobs/index.js]
    BUILD --> PKGD
    BE --> PKGD["pkg --target node10-win-x64"]
    BJ --> PKGJ["pkg --target node10-win-x64"]
    PKGD --> EXE1[esb-dashboard.exe]
    PKGJ --> EXE2[esb-jobs.exe]
    DA -->|"cpy --rename=auth.js"| BUILD

    BACKUP[backupConfig.js] -->|zip| ZIP["C:/Temp/soa-dashboard-config-backup-*.zip"]

    classDef art fill:#e8f0fe,stroke:#4285f4
    class BUILD,DA,DJ,EXE1,EXE2,ZIP art
```

`npm run build:all` = `backup:config` → `pkg:all` → `ncc:build` → `postbuild:all` (copy
`dist/auth/index.js` into `frontend/build` as `auth.js`). Deploying then means copying
`frontend/build` and adding `node ./auth.js` to the server's startup.

---

## 7. Cross-cutting concerns

### 7.1 Configuration — four distinct layers

```mermaid
flowchart TB
    A["<b>1. Customisation modules</b><br/>customisation/*.config.js<br/>frontend/src/customisation/configuration.config.js<br/><i>gitignored, required at require-time</i>"]
    B["<b>2. Build-time env</b><br/>frontend/.env produces REACT_APP_*<br/><i>baked into the bundle</i>"]
    C["<b>3. Runtime defaults</b><br/>logic/configuration.js defaultConfiguration<br/>validated by configurationDefinition.js (jsonschema)"]
    D["<b>4. User overrides</b><br/>localStorage 'esb-dashboard'<br/>edited under Einstellungen"]
    A --> C
    C -->|mergeDeepRight| D
    D --> E["effective configuration<br/>getConfigurationValue(path)"]
    B --> E
```

Consequences worth knowing:

- Missing customisation files make the servers and the frontend build **fail at startup**, by
  design — there is no silent fallback. `customisation/README.md` and
  `frontend/src/customisation/README.md` are the contracts.
- Because `REACT_APP_*` is build-time, changing ports or the local-auth flag requires a rebuild;
  changing the list of `Umgebungen`, time windows, or page sizes does not.
- `defaultConfiguration.version` (currently `6`) is the migration marker for stored
  configurations.

### 7.2 Security model

| Aspect | Implementation | Consequence / limitation |
|---|---|---|
| Authentication | LDAP bind through the auth backend | Password is sent to the auth backend in the request body — TLS termination is the deployment's responsibility |
| Authorisation (access) | `GROUP` membership checked in `entryParser`; empty `GROUP` means everyone | Enforced at login only |
| Authorisation (resend) | `resend-users.config.js` allowlist produces `canResend` on the session | Absent file means every authenticated user may resend |
| Session | Plain JSON object in `localStorage`, 12 h TTL checked client-side | No token, no server-side revocation. The `TODO` in `authorization.js` marks JWT as the intended evolution |
| Route protection | `ProtectedRoute` + `checkValidUser` | Client-side only — the SOA REST endpoints are called directly by the browser and are not gated by the dashboard |
| Path traversal | `checkStaysInDirectory` / `path.dirname === root` in both the jobs server and `jobs.js` | Solid against `../`, but the jobs backend has **no authentication at all** — it is safe only because it binds a localhost port on the operator's own machine |
| LDAP injection | `escapeFilterValue` (RFC 4515) on the user-id | Wildcards and parentheses cannot leak into the filter |
| CORS | `@koa/cors()` with defaults on both backends | Wide open; acceptable for localhost/intranet, worth narrowing if the auth backend is exposed |

### 7.3 Error handling and observability

- **Backends:** `app.on('error')` logs to the console; each request logs method, URL and
  `X-Response-Time`, with `/checkalive` and `/log` filtered out to keep the console readable.
  `GET /checkalive` returns uptime, the full config dump and the version — it is both the liveness
  probe used by the SPA and the diagnostic endpoint.
- **Frontend:** `log.js` wraps the `debug` package with a numeric level (`debug.level`) and a
  namespace filter (`debug.namespaces`, default `ESBD:*`), both runtime-configurable. API errors
  become `react-toastify` notifications that do not auto-close. `Statusleiste` shows a rolling
  `infos` list fed by `sendStatusInfo`.
- **Job tracing:** `logToFile(destination)` posts to `PUT /log`, appending one JSON object per
  line to `<destination>.log` in `JOB_PATH`.

### 7.4 Performance-relevant decisions

- Statistics queries are **sliced** into chunks of `advanced.sliceFetchStatisticsHours` (default
  12 h) and aggregated client-side with `crossfilter2`, keeping single responses bounded.
- Job saving streams in **64 KiB chunks** via repeated `POST /job/save { append: true }`; the
  bodyparser limit is raised to 32 MB accordingly.
- Above `advanced.maxQueuedMessagesWithMessagecontent` records, message payloads are dropped from
  the saved job and reduced to the extracted `senderFQN`.
- All pages are `React.lazy` code-split behind a single `Suspense` boundary.

---

## 8. Architecture decisions and their rationale

| Decision | Rationale | Trade-off accepted |
|---|---|---|
| A separate Node process purely for authentication | Every usable LDAP/AD client depends on Node's `net`; a browser cannot bind LDAP, and hand-rolling the protocol was rejected | An extra process to deploy and monitor |
| Two backends instead of one | Different lifecycles and trust zones: auth is central and stateless, jobs is per-workstation and filesystem-bound | Duplicated bootstrapping — mitigated by `backend-common/util.js` |
| SPA calls the SOA directly | Stage switching stays a client concern; backends stay trivial | Requires client-to-SOA reachability and CORS; no central audit point for SOA calls |
| Stateless auth backend | Restart/kill is always safe, no session store to operate | Sessions cannot be revoked server-side |
| Customisation via gitignored `require`d modules | Deployment-specific data (LDAP URLs, stage URLs, paths) never enters the repository | Fails hard when missing; `backupConfig.js` exists precisely because this config is unversioned |
| `HashRouter` rather than `BrowserRouter` | The build must work when opened from `file://` and from static hosting without server-side rewrite rules | `#`-URLs |
| Global mock switch | Demo and offline development without a SOA (the public demo runs this way) | Mock branches are interleaved with production code paths |
| `pkg` to Windows `.exe` | Target environment has no managed Node runtime; operators just run a binary | Pinned to `node10-win-x64`; behind a proxy `pkg-fetch` must be primed manually (see `README.md`) |
| CommonJS JS backends, plain-JS CRA frontend | Consistency with the existing code base | Diverges from the general TypeScript preference — deliberate for this repo |

---

## 9. Constraints, risks, and evolution

**Constraints**

- Windows-centric: `JOB_PATH`/`MODEL_PATH` default to `C:/…`, artefacts are `.exe`, the packaging
  workaround is Windows-specific.
- The `pkg` target is `node10-win-x64`; backend code must stay within that language level.
- CRA 5 / React 17 with a large, version-pinned dependency set (`dc` 4, `react-table` 6 *and* 7,
  `vis-timeline`, Atlaskit, Bootstrap 5). Upgrades are coupled.
- The repo is mid-migration from Yarn to npm — `package-lock.json` is authoritative,
  `yarn.lock` was removed, but `README.md` still shows `yarn` commands.

**Risks**

- *No automated tests.* There is no backend test suite and no test files beyond CRA's default
  runner; the only enforced quality gate is `eslintConfig: react-app` warnings during build.
- *Jobs backend is unauthenticated.* The localhost-binding assumption is the entire security
  boundary. Binding it to a non-loopback interface would expose arbitrary read/write inside
  `JOB_PATH` and read inside `MODEL_PATH` to the network.
- *Client-side-only session validation.* The 12 h TTL and the `GROUP` check are advisory once a
  session exists; the SOA endpoints have to enforce their own access control.
- *Two React table libraries* (`react-table` 6 and 7) coexist, doubling the table idioms a
  maintainer must know.

**Natural next steps** (implied by `TODO`s in the code, not yet implemented)

- Replace the persisted-object session with a JWT verified against the auth backend
  (`logic/authorization.js`).
- Remove the temporary widened-time-window workaround in `api-dashboard.js#getLogpoints` once the
  new SOA API is rolled out, and the `USER_DATA.TEXT_LOB` fallback in `rest-api-esb.js#evolveData`.
- Consolidate onto one table library.

---

## 10. Where to look in the code

| Question | File |
|---|---|
| Which routes exist, what is protected? | `frontend/src/App.js`, `frontend/src/ProtectedRoute.js` |
| What is in the Redux state? | `frontend/src/logic/store.js`, `frontend/src/logic/reducer.js` |
| Which SOA URL is called for X? | `frontend/src/logic/api/api-dashboard.js` |
| How is a SOA response normalised? | `frontend/src/logic/api/rest-api-esb.js` (`evolveData`, `makeObjectFromHeaderAndRows`) |
| How does the SPA reach the backends? | `frontend/src/logic/api/rest-api-local.js` (`getLocalURL`) |
| What settings exist and what are the defaults? | `frontend/src/logic/configuration.js`, `configurationDefinition.js` |
| How does a housekeeping job run? | `frontend/src/logic/actionHandlers/` (`Executor.js`, `resendMessages.js`) |
| How is a user authenticated/authorised? | `backend-auth/ldap/ldapAuthentication.js` |
| Shared backend bootstrapping | `backend-common/util.js` |
| Path-traversal fencing | `backend-jobs/server.js` (`checkStaysInDirectory`), `backend-jobs/jobs.js` |
| What must be configured before anything runs? | `customisation/README.md`, `frontend/src/customisation/README.md`, `frontend/.env.example` |
