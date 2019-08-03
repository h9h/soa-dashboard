import { defaultConfiguration } from './constants'
import { mergeDeepRight } from 'ramda'
import { validateConfiguration } from './validate'
import { migrate } from './migration'
import Persistence from './Persistence'

class Configuration extends Persistence {
  constructor() {
    super('esb-dashboard')
  }

  get = () => {
    const json = this.getRaw()
    if (!json) {
      console.log('Return default configuration')
      return defaultConfiguration
    }

    try {
      const storedConfiguration = JSON.parse(json)

      //
      // Ggf ist auf eine neue Version zu aktualisieren?
      //
      let haveToMigrate = false
      if (!storedConfiguration.version) storedConfiguration.version = 0
      while (storedConfiguration.version < defaultConfiguration.version) {
        haveToMigrate = true
        console.log('Migrate from version ' + storedConfiguration.version)
        migrate(storedConfiguration)
      }

      //
      // Aktuell, aber ggf nur Teile vorhanden
      //
      // effektive Konfiguration ergänzen um Defaults
      const effectiveConfiguration = mergeDeepRight(defaultConfiguration, storedConfiguration)

      //
      // Prüfen, ob Konfiguration so in Ordnung
      //
      const result = validateConfiguration(effectiveConfiguration)

      if (!result.valid) {
        console.error('Error validating stored configuration', { ...result.errors })
        console.log('Return default configuration')
        return defaultConfiguration
      } else {

        //
        // Wegschreiben, falls durch Migration geändert
        //
        if (haveToMigrate) this.set(JSON.stringify(storedConfiguration))

        //
        // effektive Konfiguration zurückgeben
        //
        return effectiveConfiguration
      }

    } catch (e) {
      console.error('Error merging default with stored, using default')
      console.error(e)
      return defaultConfiguration
    }
  }
}

export default Configuration
