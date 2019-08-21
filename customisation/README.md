# Customisation

All backend customisation happens in this directory.

These files required:

### Authentication Customisation

1: File: **authentication.config.js**

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

```
module.exports = []
```

Array of user-names in capital letters who may resend messages.
If not given, all authenticated users can resend messages.

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
