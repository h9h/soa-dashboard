import { all, split, zip } from 'ramda'
import moment from 'moment'
import uuid from 'uuid/v1'

export const isVersionOk = (thisVersion, officialVersion) => {
  const tv = split('.', thisVersion)
  const of = split('.', officialVersion)
  return all(([l, r]) => parseInt(l, 10) >= parseInt(r, 10), zip(tv, of))
}

export function keysAndRowToObject (keys, row) {
  return keys.reduce((acc, key, index) => {
    acc[key] = row[index]
    return acc
  }, {})
}

export const timeSpent = (out) => {
  const id = uuid()
  const start = moment()

  return (event, ...args) => {
    const now = moment()
    out({
      id,
      spent: now.valueOf() - start.valueOf(),
      event,
      ...args
    })
  }
}

