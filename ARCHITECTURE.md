# Architecture Documentation

## Project Structure

```
soa-dashboard/
├── backend-auth/           # Authentication backend service
│   ├── server.js          # Server entry point
│   ├── routes.js          # API route definitions
│   ├── authentication.js  # Auth facade
│   └── ldap/              # LDAP implementation
├── backend-jobs/           # Housekeeping/jobs backend service
│   ├── server.js          # Server entry point
│   ├── routes.js          # API route definitions
│   └── jobs.js            # Job utilities
├── backend-common/         # Shared backend utilities
│   └── util.js            # Common server setup, routing
├── frontend/               # React SPA
│   ├── public/            # Static assets
│   ├── src/               # React source code
│   └── package.json       # Frontend dependencies
├── config/                 # Configuration templates (tracked in git)
│   ├── *.example.js       # Example configs to copy
│   └── README.md          # Configuration documentation
├── customisation/          # Actual configuration (gitignored)
│   └── README.md          # Setup instructions
├── scripts/                # Build and utility scripts
│   ├── backupConfig.js    # Config backup utility
│   └── setup-config.js    # First-time setup script
├── images/                 # Documentation images
├── dist/                   # Build output (generated)
│   ├── auth/              # Bundled auth backend
│   └── jobs/              # Bundled jobs backend
└── package.json            # Root package (backend deps & scripts)
```

## Backend Architecture

### Three-Service Design

The application consists of three independent services:

1. **Authentication Backend** (`backend-auth`)
   - Handles LDAP/Active Directory authentication
   - Provides user authorization checks
   - Default port: 4166
   - Can serve frontend in production mode (when packaged as .exe)

2. **Jobs Backend** (`backend-jobs`)
   - Provides housekeeping APIs
   - File-based job management
   - Model data serving
   - Default port: 4000

3. **Frontend** (`frontend`)
   - React SPA (Create React App)
   - Connects to both backend services
   - Development port: 3000
   - Production: served by auth backend or static hosting

### Backend Common Layer

`backend-common/util.js` provides shared functionality:
- Koa server setup
- Common middleware (CORS, body parser, error handling)
- Router creation with `/checkalive` endpoint
- Response time tracking

### Route Organization

Each backend service now separates concerns:

**Server Files** (`server.js`):
- Configuration loading
- Server initialization
- Directory setup
- Help text generation

**Route Files** (`routes.js`):
- API endpoint definitions
- Request/response handling
- Business logic coordination

This separation improves:
- Testability (routes can be tested independently)
- Maintainability (clear separation of concerns)
- Readability (smaller, focused files)

## Configuration Management

### Two-Layer System

1. **Example Configs** (`config/` directory)
   - Tracked in git
   - Safe to share (no secrets)
   - Documented with comments
   - Used as templates

2. **Actual Configs** (`customisation/` directory)
   - Gitignored
   - Contains environment-specific values
   - Required at runtime
   - Created by copying examples

### Setup Flow

```
npm run setup
    ↓
scripts/setup-config.js
    ↓
Copies config/*.example.js → customisation/*.js
    ↓
User edits customisation/*.js with actual values
```

## Build Process

### Development Mode
```
npm start
    ↓
npm-run-all --parallel
    ↓
├── start:frontend (React dev server)
├── start:auth (Node with ncc)
└── start:file (Node with ncc)
```

### Production Builds

**Option 1: Bundled JavaScript**
```
npm run ncc:build
    ↓
@vercel/ncc compiles dependencies
    ↓
dist/auth/index.js & dist/jobs/index.js
```

**Option 2: Windows Executables**
```
npm run pkg:all
    ↓
pkg bundles Node.js + code
    ↓
esb-dashboard.exe & esb-jobs.exe
```

**Complete Build**
```
npm run build:all
    ↓
1. Backup config
2. Build frontend
3. Create .exe files
4. Bundle JavaScript
5. Copy auth bundle to frontend/build
```

## Deployment Scenarios

### Scenario 1: Separate Services
- Deploy frontend to static hosting (Nginx, Apache, CDN)
- Run `node dist/auth/index.js` on auth server
- Run `node dist/jobs/index.js` on jobs server
- Configure CORS appropriately

### Scenario 2: Bundled (Windows)
- Run `esb-dashboard.exe` (serves frontend + auth backend)
- Run `esb-jobs.exe` (jobs backend)
- Single-machine deployment

### Scenario 3: Development
- `npm start` runs all three services locally
- Hot-reloading for frontend
- Manual restart for backends

## Technology Stack

### Backend
- **Runtime**: Node.js
- **Framework**: Koa 2.x
- **Authentication**: LDAP via activedirectory2 / ldapjs
- **Build**: @vercel/ncc (bundling), pkg (executables)

### Frontend
- **Framework**: React 17
- **Tooling**: Create React App (react-scripts 5.x)
- **UI**: React Bootstrap, Atlaskit components
- **Data Viz**: D3.js, dc.js, crossfilter2
- **State**: Redux

### Common
- **Utilities**: Ramda (functional programming)
- **Date/Time**: Moment.js
- **HTTP Client**: Axios

## Security Considerations

### Authentication
- LDAP credentials never stored
- Group-based authorization
- Optional user whitelist for sensitive operations (resend messages)

### File Access
- Path validation in jobs backend
- Directory traversal protection
- Configurable root directories

### Configuration
- Secrets in gitignored files
- Example configs contain no sensitive data
- Clear separation between templates and actual config

## Development Workflow

1. **Setup** (first time)
   ```bash
   npm install
   cd frontend && npm install
   npm run setup
   # Edit customisation/*.js
   ```

2. **Development**
   ```bash
   npm start  # All services with hot-reload
   ```

3. **Code Quality**
   ```bash
   npm run lint        # Check backend code
   npm run lint:fix    # Auto-fix issues
   ```

4. **Build for Production**
   ```bash
   npm run build:all   # Complete build
   ```

## Future Architecture Improvements

### Recommended
1. **Monorepo with Workspaces**
   - Use npm/yarn workspaces
   - Separate versioning per package
   - Shared dependencies in root

2. **API Gateway Pattern**
   - Single entry point for both backends
   - Unified authentication
   - Request routing

3. **Testing Infrastructure**
   - Unit tests for routes
   - Integration tests for backends
   - E2E tests for critical flows

4. **TypeScript Migration**
   - Type safety across services
   - Better IDE support
   - Reduced runtime errors

5. **Container Deployment**
   - Docker images for each service
   - Docker Compose for local development
   - Kubernetes for production

### Under Consideration
- GraphQL API layer
- Real-time updates with WebSockets
- Microservices architecture for larger deployments
- Message queue for async jobs
