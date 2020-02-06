# Customisation

All frontend customisation happens in this directory.

These files are required:

### Configuration

1: File: **configuration.config.js**

Configuration of different stages, identified by key and given an url:

```
const getDefaultUmgebungen = {
    'DEV': 'http://name.der.ersten.umgebung',
    'PROD': 'http://name.der.zweiten.umgebung'
}

const getDefaultUmgebungKey = 'DEV'
const getDoMock = 'false'

const getLinks = {
  'Text in Menue': 'https://some.link'
}

module.exports = {
  getDefaultUmgebungen,
  getDefaultUmgebungKey,
  getDoMock,
  getLinks
}
```

"getDefaultUmgebungKey" should contain the key to the stage you want to be selected as default.

"getDoMock" is usually 'false', unless you want to mock the data. In that case, set it to ```'true'```. Then the data will
not be obtained from your api, but will be mocked.

If "getLinks" is ```{}```, nothing happens. Else the given URLs will appear as Links under Menue Einstellungen

2: File: **logo.png**

Your logo.

3: File **frontend/.env**

Create this file with contents as the example ```frontend/.env.example```
