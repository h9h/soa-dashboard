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

export const cellFactory = onClick => key => {
  switch (key) {
    case 'Timing':
      return row => <Timing row={row} onClick={onClick} />
    case 'LOGPOINTNO':
      return row => <LogpointNummer row={row}/>
    case 'LOGPOINTNO.Aggregated':
      return row => <LogpointNummer row={row}/>
    case 'Timestamp':
      return row => <Timestamp row={row} onClick={onClick}/>
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
      return row => <MessageId row={row} />
    case 'MessageSize': // statt MESSAGE, damit wir nach Größe sortieren können
      return row => <Message row={row} onClick={onClick}/>
    case 'MESSAGETYPE':
      return row => <MessageType row={row} />
    case 'ERRORCODE':
      return row => <Errorcode row={row} />
    case 'QUEUE_NAME':
      return row => <QueueName row={row} />
    case 'EXPIRATION':
    case 'WAITING':
    case 'READY':
    case 'EXPIRED':
      return row => <Anzahl row={row} />
    case 'REASON':
      return row => <Ursache row={row} />
    default:
      return row => {
        return <Default row={row} />
      }
  }
}
