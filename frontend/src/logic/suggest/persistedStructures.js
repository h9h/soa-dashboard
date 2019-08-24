import Persistence from '../Persistence'
import { LRU } from './lru'
import Log from '../../log'

const log = Log('persistedstructures')

export const getPersistedLRU = (limit, cacheKey) => {
  const lru = new LRU(limit)

  const persistence = new Persistence('ESB-' + cacheKey)
  const stored = persistence.get()
  log.trace('Stored values', cacheKey, stored)

  if (stored) {
    stored.reverse().forEach(item => lru.put(item, item))
  }

  return {
    dump: () => {
      return lru.dump()
    },
    store: (value) => {
      lru.put(value, value)
      log.trace('store values', lru.dump())
      persistence.set(lru.dump())
    },
  }
}
