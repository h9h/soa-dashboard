# Changelog

All notable changes to this project will be documented in this file.

## [Unreleased]

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
