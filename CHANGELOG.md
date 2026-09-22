# Changelog

All notable changes to this project will be documented in this file.

## [Unreleased]

### Removed - Jobs-Backend und Exe-Bau

#### backend-jobs ausgelagert
- `backend-jobs/` entfernt — das Housekeeping-Backend wurde nach Go portiert und liegt jetzt
  im eigenen Projekt `../soa-dashboard-jobs`
- Das REST-Protokoll ist unverändert: die Oberfläche (`PageJobs.js`, `rest-api-local.js`,
  `REACT_APP_FILE_PORT`) spricht ohne Anpassung mit der neuen Fassung auf Port 4000
- Entfallen: `config/jobs.config.example.js`, die Skripte `start:file` und `ncc:server:file`,
  der Jobs-Teil von `ncc:build`; `customisation/jobs.config.js` wird nicht mehr von
  `npm run setup` angelegt
- `customisation/jobs.config.js` bleibt auf bestehenden Rechnern liegen (gitignored) — das neue
  Projekt konfiguriert sich über `jobs.config.json`

#### Exe-Bau entfernt
- Das Dashboard wird nicht mehr als `esb-dashboard.exe` ausgeliefert. Entfallen sind `pkg` samt
  aller `pkg:*`-Skripte, der `pkg.assets`-Block und der `bin`-Eintrag
- `backend-auth/server.js` liefert die gebaute SPA nicht mehr aus; die Erkennung über
  `process.argv[0]` und die Abhängigkeit `koa-send` sind weg. Das Backend ist reines REST auf :4166
- Deployment unverändert im Rest: `frontend/build` ausliefern und das mit `ncc` gebundelte
  `auth.js` starten. `build:all` = `backup:config` → `build` → `ncc:build` → Kopieren nach
  `frontend/build`
- Der Proxy-Workaround für `pkg-fetch` ist damit gegenstandslos und aus `README.md` entfernt

### Changed - Code Organization Improvements

#### Backend Structure
- **BREAKING**: Moved `server.js` to `backend-auth/server.js` for consistency with other backend modules
  - All backend services now follow the pattern: `backend-*/server.js`
  - Updated `package.json` bin reference to new location
- Extracted routes from server files into separate `routes.js` files:
  - `backend-auth/routes.js` - Authentication routes
  - `backend-jobs/routes.js` - Job/housekeeping routes
  - Improves separation of concerns and testability

#### Build Scripts & Tooling
- Created `scripts/` directory for build and utility scripts
  - Moved `backupConfig.js` to `scripts/backupConfig.js`
  - Added `scripts/setup-config.js` - automated configuration setup
- Updated all npm scripts to reference new file locations
- Added `npm run setup` command to bootstrap configuration
- Added linting support:
  - Added ESLint configuration (`.eslintrc.js`)
  - Added `npm run lint` and `npm run lint:fix` commands
  - Added `eslint` as dev dependency

#### Configuration Management
- Created `config/` directory with example configuration files:
  - `authentication.config.example.js`
  - `jobs.config.example.js`
  - `resend-users.config.example.js`
  - `authenticationImplementation.example.js`
  - `config/README.md` - Setup documentation
- All example configs are now tracked in git (no more missing templates)
- Actual configuration remains in `customisation/` (gitignored)
- Setup script copies examples to `customisation/` for first-time setup

#### Documentation
- Updated README.md with:
  - Clearer installation steps
  - New setup process using `npm run setup`
  - Organized script documentation
  - Updated paths to reflect new structure
- Created CHANGELOG.md to track changes

### Migration Guide

If you're upgrading from a previous version:

1. **Update npm scripts** - The main entry point has moved:
   ```bash
   # Old
   node server.js
   
   # New
   node backend-auth/server.js
   ```

2. **Configuration is unchanged** - Your existing `customisation/` directory will continue to work

3. **Package.json reference** - If you're using pkg, the binary entry point is now `backend-auth/server.js`

4. **No code changes needed** - This is purely structural; functionality remains the same

### Technical Debt Addressed

- ✅ Consolidated backend organization (all backends in `backend-*` directories)
- ✅ Separated routing logic from server initialization
- ✅ Added linting infrastructure
- ✅ Centralized configuration with examples
- ✅ Created setup automation for first-time users
- ✅ Improved documentation

### Future Improvements (Not Yet Implemented)

- Monorepo structure with workspaces
- Test infrastructure
- TypeScript support
- CI/CD pipeline improvements
