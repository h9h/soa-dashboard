# Customisation

All backend customisation happens in this directory.

These files required:

### Authentication Customisation

1: File: **authentication.config.js**

If you use provided LDAP-Authentication, you need this file:

```
const parameters = {
  URL_LDAP: "ldap://ldap.server.name",
  BASE_DN: "O=WHATEVER",
  SERVER_PORT: "4166",
  GROUP: "LDAP Group DN, if being in a group ist required to get access to dashboard"
}

module.exports = parameters
```

2: File (optional): **resend-users.config.js**

Array of user-names in capital letters who may resend messages.
If not given, all authenticated users can resend messages.

```
module.exports = []
```

3: File: **authenticationImplementation.js**

Redirect to provided LDAP-Authentication-Implementation:
```
const auth = require('../backend-auth/ldap/ldapAuthentication')

module.exports = {
  getDN: auth.getDN,
  checkLogin: auth.checkLogin,
  config: auth.config
}

```

or create your own by implementing getDN and checkLogin. The export of config 
is just for showing in console, could be empty object.

### Jobs Customisation

1: File: **jobs.config.js**

```
const parameters = {
  JOB_PATH: "C:/Dashboard",
  MODEL_PATH: "C:/DashboardModel",
  SERVER_PORT: "4000",
}

module.exports = parameters
```
