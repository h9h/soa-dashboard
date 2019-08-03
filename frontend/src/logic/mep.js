export const MEP_NAMES = {
  requestReply: 'requestReply',
  requestCallback: 'requestCallback',
  fireAndForget: 'fireAndForget',
  notification: 'notification',
}

export const MEPS = [
  ['', 'Alle MEPs'],
  [MEP_NAMES.requestReply, 'Request Reply'],
  [MEP_NAMES.requestCallback, 'Request Callback'],
  [MEP_NAMES.fireAndForget, 'Fire and Forget'],
  [MEP_NAMES.notification, 'Notification'],
]

export const getContentMep = mep => {
  switch(mep){
    case MEP_NAMES.requestReply:
      return 'Synchroner Message-Call'
    case MEP_NAMES.requestCallback:
      return 'Asynchroner Message-Call mit Callback'
    case MEP_NAMES.fireAndForget:
      return 'Asynchroner Message-Call ohne Callback'
    case MEP_NAMES.notification:
      return 'Einliefernder Call in Kafka'
    default:
      return 'Hilfetext für "' + mep + '" noch zu ergänzen'
  }
}
