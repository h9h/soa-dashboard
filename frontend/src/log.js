import DEBUG from 'debug';
import { getConfiguration } from './configuration'
import { defaultConfiguration } from './configuration/constants'

export const BASE = 'ESBD'

const intFormat = new Intl.NumberFormat('de-DE').format

const formatDiff = (tStart, tEnd) => {
  const diff = tEnd - tStart
  return intFormat(diff) + ' ms'
}

export default unit => {
  const conf = getConfiguration ? getConfiguration() : defaultConfiguration
  DEBUG.enable(conf.debug.namespaces)
  const logLevel = parseInt(conf.debug.level, 10)

  const namespace = `${BASE}:${unit}`;
  const debug = DEBUG(namespace);
  const times = new Map()

  return {
    trace: (...args) => logLevel < 1 ? debug('trace', ...args) : null,
    info: (...args) => logLevel < 2 ? debug('info', ...args) : null,
    warn: (...args) => logLevel < 3 ? debug('warn', ...args) : null,
    error: (...args) => logLevel < 4 ? debug('error', ...args) : null,
    time: label => {
      if (logLevel >= 4) return
      if (times.has(label)) {
        debug('warn', 'Duplicate label "' + label + '" for timer')
      } else {
        times.set(label, Date.now())
      }
    },
    timeEnd: label => {
      if (logLevel >= 4) return
      const end = Date.now()
      if (times.has(label)) {
        debug('info', '"' + label + '" took ' + formatDiff(times.get(label), end))
        times.delete(label)
      } else {
        debug('warn', 'No time-label "' + label + '" found')
      }
    }
  }
}
