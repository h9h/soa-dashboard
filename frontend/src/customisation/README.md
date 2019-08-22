# Customisation

All frontend customisation happens in this directory.

These files are required:

### Configuration

1: File: **configuration.config.js**

Configuration of different stages, identified by key and given an url:

```
export const getDefaultUmgebungen = {
    'DEV': 'http://name.der.ersten.umgebung',
    'PROD': 'http://name.der.zweiten.umgebung'
}

export const getDefaultUmgebungKey = 'DEV'

export const getDoMock = false
```

"getDefaultUmgebungKey" should contain the key to the stage you want to be selected as default.

"getDoMock" is usually false, unless youe want to mock the data. In that case, set it to ```true```. Then the data will 
not be obtained from your api, but will be mocked.

2: File: **logo.svg**

Your logo.

3: File **frontend/.env**

Create this file with contents as the example ```frontend/.env.example```
