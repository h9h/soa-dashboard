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

export getLogoFilename = 'logo.svg'

export const getDoMock = false
```

"getDefaultUmgebungKey" should contain the key to the stage you want to be selected as default.

"getLogoFilename" should contain the filename of your logo, without path. The logo will be pulled from this directory.

"getDoMock" is usually false, unless youe want to mock the data. In that case, set it to ```true```. Then the data will 
not be obtained from your api, but will be mocked.

2: File: **#your logo file#**

Your logo. Filename as configured in ```getLogoFilename```
