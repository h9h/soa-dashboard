import { SuggestionProvider } from './provider'
import { getPersistedLRU } from '../../logic/suggest/persistedStructures'

export class LRUProvider extends SuggestionProvider {
  constructor(key) {
    super([])
    this.persistedLRU = getPersistedLRU(25, key)
    const values = this.persistedLRU.dump()
    this.setValues(values)
  }

  store = (value) => {
    this.persistedLRU.store(value)
    this.setValues(this.persistedLRU.dump())
  }
}
