export const logpointToNumber = lp => parseInt(('' + lp).replace(/\u2026/, ''), 10)

export const logpointWithMessage = logpoint => {
  const no = logpointToNumber(logpoint)
  return [
    2, 4, 6, 11, 13, 15, 53, 55, 58, 61, 63,
    71, 73, 75, 77, 82, 84, 86, 88, 91, 92, 94, 96, 98, // Datapower Logpunkte
    // 42, // ab zur Deadletter Queue --> hat keine neuen Informationen
    // 44, // ab zur Undelivered Queue --> nein, Nachricht in Undelivered Queue
    48 // resend aus Queue --> könnte gepatcht sein
  ].indexOf(no) > -1
}

export const LP_TYPES = {
  APPLICATION: 'application',
  FAULT: 'fault',
  BUS: 'bus',
  SEP: 'sep'
}

export const isApplication = logpoint => {
  if ([1, 9, 10, 18, 58].indexOf(logpoint) > -1) return true
  if ([48].indexOf(logpoint) > -1) return true // Resend aus Queue
  return false
}

export const isFault = logpoint => {
  if (logpoint === 42 || logpoint === 44) return true // Einstellen in Queue
  if (logpoint > 49 && logpoint < 70) return true
  if (logpoint > 90) return true // Datapower Faults
  return false
}

export const logpointType = logpoint => {
  if (isApplication(logpoint)) return LP_TYPES.APPLICATION
  if (isFault(logpoint)) return LP_TYPES.FAULT
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
  if (no > 80 && no < 90) return LP_DIRECTION.REQUEST
  if (no === 96 || no === 98) return LP_DIRECTION.REQUEST
  if (no === 42 || no === 48) return LP_DIRECTION.REQUEST
  return LP_DIRECTION.RESPONSE
}

export const sortLogpunkte = (a, b) => {
  const diff = a.Timestamp.valueOf() - b.Timestamp.valueOf()
  if (diff !== 0) return diff
  return logpointToNumber(a.LOGPOINTNO) - logpointToNumber(b.LOGPOINTNO)
}
