import Cookies from 'universal-cookie'

/*
Der Edge-Browser hat einen Bug und lässt kein localStorage zu, wenn die SPA
vom lokalen Filesystem geliefert wird. D.h. der Aufruf von index.html nach einem
yarn build scheitert an localStorage. Daher weichen wir ggf auf Cookie aus.

siehe auch https://developer.microsoft.com/en-us/microsoft-edge/platform/issues/8816771/
 */
class Persistence {
  constructor(key) {
    try {
      this.haveLocalStorage = !!localStorage
    } catch (e) {
      this.haveLocalStorage = false
    }
    console.log('Have local storage? ' + this.haveLocalStorage)

    if (!this.haveLocalStorage) {
      this.cookie = new Cookies()
    }

    this.KEY = key
  }

  getRaw = () => {
    try {
      if (this.haveLocalStorage) {
        return localStorage.getItem(this.KEY)
      } else {
        return this.cookie.get(this.KEY)
      }
    } catch (e) {
      console.error('Error reading persistence', e)
      return null
    }
  }

  get = () => {
    const json = this.getRaw()

    //
    // Habe etwas gelesen
    //
    if (json) {
      try {
        return JSON.parse(json)
      } catch (e) {
        return null
      }
    }

    return null
  }

  set = (value) => {
    if (this.haveLocalStorage) {
      localStorage.setItem(this.KEY, JSON.stringify(value))
    } else {
      this.cookie.set(this.KEY, JSON.stringify(value), { path: '/' })
    }
  }
}

export default Persistence
