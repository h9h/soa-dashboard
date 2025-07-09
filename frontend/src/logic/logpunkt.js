export const logpointToNumber = lp => parseInt(('' + lp).replace(/\u2026/, ''), 10)

/*
Logpunkte
|Nr|Wer|Beschreibung
|---|---|---|
| 1|Service Consumer|Consumer sendet Request an den Bus
| 2|ESB             |Bus hat Request empfangen
| 3|ESB             | „Validate“ des Requests (sofern eine private Service Signatur vorliegt)
| 4|ESB             | „Transform“ zum KDM
| 5|ESB             | "Validate" der KDM Payload
| 6|ESB             | „Transform“ zum Provider DM
| 7|ESB             | „Validate“ (sofern eine private Service Signatur vorliegt)
| 8|ESB             | Bus sendet den Request an Service Provider "Routing"
| 9|Service Provider| Provider hat Request empfangen und startet die Verarbeitung "Operate"
|10|Service Provider|Provider sendet Response an den Bus
|11|ESB             | Bus hat Response empfangen
|12|ESB             | „Validate“ (sofern eine private Service Signatur vorliegt)
|13|ESB             | „Transform“ zum KDM
|14|ESB             | "Validate" der KDM Payload
|15|ESB             | „Transform“ zum Consumer DM
|16|ESB             | „Validate“ (sofern eine private Service Signatur vorliegt)
|17|ESB             | Bus sendet Response an Service Consumer "Routing"
|18|Service Consumer|Consumer hat Response empfangen und startet Verarbeitung "Operate"
|21|SEP intern      | Response wurde vom Bus entgegengenommen 
|23|SEP intern      | Response wurde an Consumer übergeben
|26|SEP intern      | Request wurde vom Consumer entgegengenommen
|28|SEP intern      | Request wurde an Bus übergeben
|42|ESB             | Nachricht wurde in Deadletter-Queue eingestellt
|44|ESB             | Nachricht wurde in Undelivered-Queue eingestellt
|48|ESB             | Resend aus Queue über Dashboard wurde angestoßen
|52|ESB             | „Validate“ (sofern eine private Service Signatur vorliegt)
|53|ESB             | „Transform“ zum KDM
|54|ESB             | "Validate" der KDM Payload
|55|ESB             | „Transform“ zum Consumer DM
|56|ESB             | „Validate“ (sofern eine private Service Signatur vorliegt)
|57|ESB             | Bus sendet Fault an Service Consumer "Routing"
|58|Service Consumer|Consumer hat Fault empfangen und startet Verarbeitung "Operate"
|61|SEP             | Response received from Backend
|63|SEP             | Passing Response to Caller
|82|SEP             | Request vom Bus ist beim SEP eingegangen
|84|SEP             | Request wurden an externen Provider abgesendet
|75|SEP             | Response vom externen Provider ist beim SEP eingegangen
|77|SEP             | Response wurde an den Bus abgegeben
|86|SEP             | Request vom externen Consumer ist beim SEP eingegangen
|88|SEP             | Request wurden an Bus abgesendet
|71|SEP             | Response vom Bus ist beim SEP eingegangen
|73|SEP             | Response wurde an den externen Consumer abgegeben
|96|SEP             | Request vom internen Consumer ist beim SEP eingegangen
|98|SEP             | Request wurden an Bus abgesendet
|61|SEP             | Response vom Bus ist beim SEP eingegangen
|63|SEP             | Response wurde an den internen Consumer abgegeben
|91|SEP             | Fault: Int Consumer -> SEP -> ext Provider
|92|SEP             | Fault: Ext Consumer -> SEP -> int Provider
|93|SEP intern      | Fault bei Aufrufen eines internen Consumers
|94|SEP intern      | Fault: Int Consumer -> SEP int -> Bus

 */
export const logpointWithMessage = logpoint => {
  const no = logpointToNumber(logpoint)
  return [
    2, 4, 6, 11, 13, 15, 53, 55, 58, 61, 63,
    71, 73, 75, 77, 82, 84, 86, 88, 91, 92, 93, 94, 96, 98, // Datapower Logpunkte
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
  if (logpoint  >  49 && logpoint  <  60) return true
  if (logpoint === 92 || logpoint === 94) return true // Datapower Faults
  if (logpoint === 92 || logpoint === 94) return true // Datapower Faults
  return false
}

export const logpointType = logpoint => {
  if (isApplication(logpoint)) return LP_TYPES.APPLICATION
  if (isFault(logpoint)) return LP_TYPES.FAULT
  if (logpoint > 70 || logpoint === 61 || logpoint === 63) return LP_TYPES.SEP // Datapower
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
