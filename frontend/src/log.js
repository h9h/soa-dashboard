import { getConfigurationValue } from './logic/configuration'
import DEBUG from 'debug';
const debugConfiguration = getConfigurationValue('debug')
DEBUG.enable(debugConfiguration.namespaces)

export const BASE = 'ESBD'

const intFormat = new Intl.NumberFormat('de-DE').format

const formatDiff = (tStart, tEnd) => {
  const diff = tEnd - tStart
  return intFormat(diff) + ' ms'
}

const myLog = unit => {
  const logLevel = parseInt(debugConfiguration.level, 10)

  const namespace = `${BASE}:${unit}`;
  const debug = DEBUG(namespace);
  const times = new Map()

  console.log('Debug',debugConfiguration.namespaces,  namespace, logLevel, logLevel < 1, DEBUG.enabled(namespace))
  debug('sollte erscheinen')
  return {
    trace: (...args) => logLevel < 1 && debug.enabled ? console.log(namespace, 'trace', ...args) : null,
    info: (...args) => logLevel < 2 && debug.enabled ? console.log('info', ...args) : null,
    warn: (...args) => logLevel < 3 && debug.enabled ? console.log('warn', ...args) : null,
    error: (...args) => logLevel < 4 && debug.enabled ? console.log('error', ...args) : null,
    assert: (testmessage, condition) => {
      if (!condition) throw new Error('Assertion failed:' + testmessage)
    },
    time: label => {
      if (logLevel >= 4) return
      if (times.has(label)) {
        console.log('warn', 'Duplicate label "' + label + '" for timer')
      } else {
        times.set(label, Date.now())
      }
    },
    timeEnd: label => {
      if (logLevel >= 4) return
      const end = Date.now()
      if (times.has(label)) {
        console.log('info', '"' + label + '" took ' + formatDiff(times.get(label), end))
        times.delete(label)
      } else {
        console.log('warn', 'No time-label "' + label + '" found')
      }
    }
  }
}

export default myLog
