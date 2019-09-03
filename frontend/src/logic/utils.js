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

export const getDefaultFilterMethod = (pivot = false) => (filter, row) => {
  try {
    // die einzelnen Logpunkte einer Nachricht filtern wir nicht
    if (pivot && !row._aggregated) return true

    const field = row[filter.id]
    const testField = filter.id === 'Zeit' ? moment(field).format('YYYY-MM-DDTHH:mm:ss.SSS') : field

    const pruefer = RegExp(filter.value)
    const test = pruefer.test.bind(pruefer)
    if (Array.isArray(testField)) {
      return testField.some(test)
    } else {
      return test(testField)
    }
  } catch (_) {
    // Fehler hier interessieren nicht, z.B. noch unvollständige RegExps
    return true
  }
}

const getCircularReplacer = () => {
  const seen = new WeakSet()
  return (key, value) => {
    if (typeof value === "object" && value !== null) {
      if (seen.has(value)) {
        return
      }
      seen.add(value)
    }
    return value
  }
}

export const json2string = json => {
  return JSON.stringify(json, getCircularReplacer)
}
