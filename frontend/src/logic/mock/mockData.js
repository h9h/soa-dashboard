import { v4 as uuidv4} from 'uuid'
import moment from 'moment'
import { MEPS } from '../mep'

const HEADER = [
  {'INTERNALLOGID': 'VARCHAR(36)'},
  {'LOGTIMESTAMP': 'TIMESTAMP(0, 6'},
  {'DESCRIPTION': 'VARCHAR(255)'},
  {'LOGPOINTNO': 'NUMERIC(22)'},
  {'MESSAGEID': 'VARCHAR(66)'},
  {'SENDERFQN': 'VARCHAR(255)'},
  {'PROCESSINSTANCEID': 'VARCHAR(66)'},
  {'SENDERTIMESTAMP': 'CHAR(24)'},
  {'ENVIRONMENT': 'VARCHAR(255)'},
  {'ORIGINATOR': 'VARCHAR(5)'},
  {'OPERATION': 'VARCHAR(255)'},
  {'SERVICE': 'VARCHAR(1024)'},
  {'MEP': 'VARCHAR(25)'},
  {'PARENTPROCESSINSTANCEID': 'VARCHAR(66)'},
  {'RELATESTOMESSAGEID': 'VARCHAR(66)'},
]

const oneOutOf = n => Math.floor(Math.random() * (n + 1))

const DOMAINS = [
  'ei',
  'erp',
  'kam',
  'par',
]

const LOGPOINT_SETS = [
  [1, 2, 5, 8, 11, 57, 58],
  [2, 5, 8, 11, 12, 15, 18],
  [2, 5, 8, 9, 10, 11, 14, 17],
  [1, 18],
  [2, 5, 6, 8, 11, 13, 14, 17],
  [2, 5, 8, 11, 14, 17],
  [2, 17, 8, 11],
  [2, 2, 2, 8, 11, 17]
]

const LOGPOINT_TEXTS = {
  1: 'Request Routing zum Bus',
  2: 'Request vom SC empfangen',
  3: 'Request Validierung des externen Formats',
  4: 'Request Transformation zum KDM',
  5: 'Request Payload Validierung',
  6: 'Request Transformation (KDM -> DB Adapter Format)',
  7: 'Request Payload Validierung',
  8: 'Request Routing zum SP',
  9: 'Request vom SC empfangen',
  10: 'Response Routing zum Bus',
  11: 'Response von SP empfangen',
  12: 'Response externes Format Validierung',
  13: 'Response Transformation zum KDM',
  14: 'Response Payload Validierung',
  15: 'Response Transformation zum externen Format ',
  16: 'Response Validierung der externen Payload',
  17: 'Response Routing zum SC',
  18: 'Response vom Bus empfangen',
  52: 'Fault Validation',
  53: 'Fault Transformation (DB Adapter Format -> KDM)',
  54: 'Fault Validierung der KDM Payload',
  55: 'Fault Transformation in externes Format',
  56: 'Fault Validierung des externen Formats',
  57: 'Fault Routing zum SC',
  58: 'Fault vom Bus empfangen',
}

const MEPs = MEPS.filter(([m]) => m !== '').map(([value]) => value)

const getBisAndDurationFromUrl = url => {
  const regex = /.*LogPoints\/([^?]+)\?from=([^&]+)&to=([^&]+)/
  const groups = url.match(regex)
  const bis = moment(groups[1] + 'T' + groups[3], 'YYYY-MM-DDTHH:mm:ss')
  const duration = moment(groups[3], 'HH:mm:ss').diff(moment(groups[2], 'HH:mm:ss'), 'seconds')
  return [bis, duration]
}

const getBisAndDuration = url => {
  if (url) {
    return getBisAndDurationFromUrl(url)
  } else {
    return [moment(), 600]
  }
}

export const getMockLogpoints = (anzahl, url = null) => {
  const rows = []
  let count = 0
  const [bis, duration] = getBisAndDuration(url)

  while (count < anzahl) {
    const logpoints = LOGPOINT_SETS[oneOutOf(LOGPOINT_SETS.length - 1)]
    const messageId = 'M-' + uuidv4()
    const senderTS = moment(bis).subtract(oneOutOf(duration), 'seconds')
    const senderTIMESTAMP = senderTS.format('YYYY-MM-DDTHH:mm:ss.SSSZ')
    const bus = ['ESB0', 'OSB'][oneOutOf(1)]
    const mep = MEPs[oneOutOf(MEPs.length - 1)]
    const domain = DOMAINS[oneOutOf(DOMAINS.length - 1)]
    const version = oneOutOf(5)

    const logs = logpoints.map(logpointnr => {
      senderTS.add(oneOutOf(20), 'milliseconds')

      return [
        uuidv4(),
        senderTS.format('YYYY-MM-DDTHH:mm:ss.SSSZ'),
        LOGPOINT_TEXTS[logpointnr],
        logpointnr,
        messageId,
        'de.beispiel.architecture.' + domain + '.servicename.Port' + version,
        'P-' + uuidv4(),
        senderTIMESTAMP,
        'EW',
        bus,
        'operationname',
        'http://beispiel.de/service/' + domain + '/Servicename' + version,
        mep,
        null,
        null,
      ]
    })

    count += logs.length
    rows.push(...logs)
  }

  return {
    header: HEADER,
    rows,
  }
}
