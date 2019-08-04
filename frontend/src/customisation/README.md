# Customisation

All frontend customisation happens in this directory.

These files are required:

### Configuration

1: File: **configuration.config.js**

Configuration of different stages, identified by Key and given an url:

```
export const getDefaultUmgebungen = {
    'DEV': 'http://name.der.ersten.umgebung',
    'PROD': 'http://name.der.zweiten.umgebung'
}

export const getDefaultUmgebungKey = 'DEV'

export const getDoMock = 'true'
```

2.File **logo.jpg**

Your logo.
