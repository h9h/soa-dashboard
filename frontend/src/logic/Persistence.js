import store from 'store'

/*
Der Edge-Browser hat einen Bug und lässt kein localStorage zu, wenn die SPA
vom lokalen Filesystem geliefert wird. D.h. der Aufruf von index.html nach einem
yarn build scheitert an localStorage. Daher weichen wir ggf auf Cookie aus.

siehe auch https://developer.microsoft.com/en-us/microsoft-edge/platform/issues/8816771/
 */
class Persistence {
  constructor(key) {
    this.KEY = key
  }

  get = () => {
    try {
      return store.get(this.KEY)
    } catch (e) {
      console.error('Error reading persistence', e)
      return null
    }
  }

  set = (value) => {
    store.set(this.KEY, value)
  }
}

export default Persistence
