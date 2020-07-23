export const logpointToNumber = lp => parseInt(('' + lp).replace(/\u2026/, ''), 10)

export const logpointWithMessage = logpoint => {
  const no = logpointToNumber(logpoint)
  return [
    2, 4, 6, 11, 13, 15, 53, 55, 58,
    71, 73, 75, 77, 82, 84, 86, 88, 91, 92, // Datapower Logpunkte
  ].indexOf(no) > -1
}

export const LP_TYPES = {
  APPLICATION: 'application',
  FAULT: 'fault',
  BUS: 'bus',
  SEP: 'sep'
}

export const logpointType = logpoint => {
  if ([1, 9, 10, 18, 58].indexOf(logpoint) > -1) return LP_TYPES.APPLICATION
  if (logpoint > 49 && logpoint < 70) return LP_TYPES.FAULT
  if (logpoint > 90) return LP_TYPES.FAULT // Datapower Faults
  if (logpoint > 70) return LP_TYPES.SEP // Datapower
  return LP_TYPES.BUS
}

export const LP_DIRECTION = {
  REQUEST: 'request',
  RESPONSE: 'response',
}

export const logpointDirection = logpoint => {
  const no = logpointToNumber(logpoint)
  if (no < 10) return LP_DIRECTION.REQUEST
  if (no === 82 || no === 84) return LP_DIRECTION.REQUEST
  return LP_DIRECTION.RESPONSE
}

export const sortLogpunkte = (a, b) => {
  const diff = a.Timestamp.valueOf() - b.Timestamp.valueOf()
  if (diff !== 0) return diff
  return logpointToNumber(a.LOGPOINTNO) - logpointToNumber(b.LOGPOINTNO)
}
