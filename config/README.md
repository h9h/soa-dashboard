# Configuration

This directory contains example configuration files for the SOA Dashboard.

## Setup Instructions

1. Copy all `.example.js` files to `../customisation/` directory (remove `.example` from filenames)
2. Update the copied files with your actual values
3. Ensure the `customisation` directory exists (it's gitignored by default)

## Configuration Files

### authentication.config.js
LDAP/Active Directory connection settings and server port for the authentication backend.

### jobs.config.js  
File paths and server port for the jobs/housekeeping backend.

### resend-users.config.js
List of users authorized to resend messages (optional - defaults to all authenticated users).

### authenticationImplementation.js
Authentication strategy implementation. The example uses LDAP, but you can implement your own.

## Frontend Configuration

Frontend configuration goes in `frontend/.env`. See `frontend/.env.example` for reference.
