import { logpointDirection, LP_DIRECTION, sortLogpunkte } from './logpunkt'
import { MEP_NAMES } from './mep'
import Log from '../log'

const log = Log('calltiming')

const diff = times => (no1, no2) => {
  const x1 = times['' + no1]
  const x2 = times['' + no2]
  if (x1 && x2) return x2 - x1
  return '-'
}

const diffs = dif => points => {
  const p = Array.isArray(points[0]) ? points : [points]
  for (let i = 0; i < p.length; i++) {
    const r = dif(p[i][0], p[i][1])
    if (r !== '-') return r
  }
  return '-'
}

const calculateTiming = (mep, t) => {
  const result = {
    consumer: t([1, 18]),
    provider: t([9, 10]),
    busProvider: t([[8, 11], [8, 53]]),
    busIn: t([2, 8]),
    busOut: t([[11, 17], [11, 57], [53, 57]]),
    antwort: t([[2, 17], [2, 57]]),
    sepIn: t([82, 84]),
    sepOut: t([75, 77])
  }

  switch (mep) {
    case MEP_NAMES.requestReply:
      break
    case MEP_NAMES.requestCallback:
    case MEP_NAMES.fireAndForget:
    case MEP_NAMES.notification:
      result.busIn = t([2, 17])
      result.busOut = t([[11, 14], [11, 57]])
      break
    default:
    log.warn('Unknown MEP:', mep)
  }

  return result
}

export const calculateTimingFromRows = (subRows) => {
  const mep = subRows[0].MEP
  const sorted = subRows.sort(sortLogpunkte)

  const times = sorted.reduce((acc, row) => {
    if (acc[row.LOGPOINTNO] && logpointDirection(row.LOGPOINTNO) === LP_DIRECTION.REQUEST) return acc

    acc[row.LOGPOINTNO] = row.Timestamp
    return acc
  }, {})

  const timing = calculateTiming(mep, diffs(diff(times)))
  return {mep, timing}
}
