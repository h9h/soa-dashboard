export const logpointToNumber = lp => parseInt(('' + lp).replace(/\u2026/, ''), 10)

export const logpointWithMessage = logpoint => {
  const no = logpointToNumber(logpoint)
  return [2, 4, 6, 11, 13, 15, 53, 55, 58].indexOf(no) > -1
}

export const LP_TYPES = {
  APPLICATION: 'application',
  FAULT: 'fault',
  BUS: 'bus'
}

export const logpointType = logpoint => {
  if ([1, 9, 10, 18, 58].indexOf(logpoint) > -1) return LP_TYPES.APPLICATION
  if (logpoint > 49) return LP_TYPES.FAULT
  return LP_TYPES.BUS
}

export const LP_DIRECTION = {
  REQUEST: 'request',
  RESPONSE: 'response',
}

export const logpointDirection = logpoint => {
  const no = logpointToNumber(logpoint)
  if (no < 10) return LP_DIRECTION.REQUEST
  return LP_DIRECTION.RESPONSE
}

export const sortLogpunkte = (a, b) => {
  const diff = a.Timestamp.valueOf() - b.Timestamp.valueOf()
  if (diff !== 0) return diff
  return logpointToNumber(a.LOGPOINTNO) - logpointToNumber(b.LOGPOINTNO)
}
