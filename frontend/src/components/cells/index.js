import LogpointNummer from './LogpointNummer'
import Timestamp from './Timestamp'
import Sender from './Sender'
import Originator from './Originator'
import ServiceOperation from './ServiceOperation'
import MessageExchangePattern from './MessageExchangePattern'
import React from 'react'
import MessageId from './MessageId'
import MessageType from './MessageType'
import Default from './Default'
import Message from './Message'
import Errorcode from './Errorcode'
import QueueName from './QueueName'
import Anzahl from './Anzahl'
import Ursache from './Ursache'
import Timing from './Timing'
import MsgID from './MsgID'
import MessageContent from './MessageContent'
import moment from 'moment'
import Dauer from './Dauer'
import { Smaller } from '../styles'
import IsAlive from './IsAlive'
import { json2string } from '../../logic/utils'
import RowAktionen from './RowAktionen'
import Scheduler from './Scheduler'
import ProcessInstanceId from './ProcessInstanceID'
import ZeitKosten from './ZeitKosten'

const pk = key => {
  switch(key){
    case 'DURCHSCHNITT_GESAMT_ZEIT':
      return 'PartitionGesamtZeit'
    case 'DURCHSCHNITT_BUS_ZEIT':
      return 'PartitionBusZeit'
    case 'DURCHSCHNITT_PROVIDER_ZEIT':
      return 'PartitionProviderZeit'
    default:
      return null
  }
}

export const cellFactory = onClick => key => {
  switch (key) {
    case 'Aktionen':
      return row => <RowAktionen row={row} />
    case 'Timing':
      return row => <Timing row={row} onClick={onClick} />
    case 'LOGPOINTNO':
      return row => <LogpointNummer row={row}/>
    case 'LOGPOINTNO.Aggregated':
      return row => <LogpointNummer row={row}/>
    case 'Timestamp':
      return row => <Timestamp row={row} onClick={onClick}/>
    case 'Zeit':
      return row => <Timestamp row={{...row, value: moment(row.value)}} onClick={onClick}/>
    case 'Timestamp.Aggregated':
      return row => <Timestamp row={row} onClick={null}/>
    case 'Sender':
      return row => <Sender row={row}/>
    case 'ORIGINATOR':
      return row => <Originator row={row}/>
    case 'ServiceOperation':
      return row => <ServiceOperation row={row}/>
    case 'MEP':
      return row => <MessageExchangePattern row={row}/>
    case 'MESSAGEID':
      return () => null
    case 'VirtualMESSAGEID':
      return row => <MessageId row={row} />
    case 'MSGID':
      return row => <MsgID row={row} />
    case 'MESSAGESIZE': // statt MESSAGE, damit wir nach Größe sortieren können
      return row => <Message row={row} onClick={onClick}/>
    case 'MessageContent':
      return row => <MessageContent row={row} />
    case 'MESSAGETYPE':
      return row => <MessageType row={row} />
    case 'PROCESSINSTANCEID':
      return row => <ProcessInstanceId row={row} />
    case 'ERRORCODE':
      return row => <Errorcode row={row} />
    case 'QUEUE_NAME':
      return row => <QueueName row={row} />
    case 'EXPIRATION':
    case 'WAITING':
    case 'READY':
    case 'EXPIRED':
    case 'ANZAHLGESAMT':
    case 'ANZAHLFAULT':
      return row => <Anzahl row={row} />
    case 'SCHEDULE_DISABLED':
      return row => <Scheduler row={row} />
    case 'REASON':
      return row => <Ursache row={row} />
    case 'DURCHSCHNITT_GESAMT_ZEIT':
    case 'DURCHSCHNITT_BUS_ZEIT':
    case 'DURCHSCHNITT_PROVIDER_ZEIT':
      return row => <Dauer row={row} partitionKey={pk(key)} />
    case 'ContributionGesamtZeit':
      return row => <ZeitKosten row={row} />
    case 'USINGPORTFQN':
    case 'PROVIDINGPORTFQN':
      return row => <Smaller>{row.value}</Smaller>
    case 'SENDERFQN':
      return row => <div style={{ overflowX: 'auto', overflowY: 'hidden'}}>{row.value}</div>
    case 'ISALIVE':
      return row => <IsAlive row={row} />
    case 'RESPONSE':
      return row => <MessageContent row={row} />
    case 'DUMP':
      return row => <div style={{ wordBreak: 'normal', overflow: 'auto'}}>{json2string(row)}</div>
    default:
      return row => {
        return <Default row={row} />
      }
  }
}
