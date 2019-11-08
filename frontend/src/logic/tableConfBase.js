import { values, concat, uniq, sortBy, propOr } from 'ramda'
import { MEPS } from './mep'
import React from 'react'

export const MESSAGE_TYPE_COLUMNS = {
  Rejected: ['ID', 'Timestamp', 'ServiceOperation', 'MEP', 'MESSAGETYPE', 'DESCRIPTION', 'LOGPOINTNO', 'ORIGINATOR', 'ENCODING', 'MESSAGE', 'MessageSize'],
  Undelivered: ['ID', 'Timestamp', 'ServiceOperation', 'MEP', 'MESSAGETYPE', 'MESSAGEID', 'Sender', 'PROCESSINSTANCEID', 'SENDERTIMESTAMP', 'PARENTPROCESSINSTANCEID', 'RELATESTOMESSAGEID', 'MESSAGE', 'MessageSize', 'ERRORCODE', 'REASON', 'REPLYCONTEXT'],
  Expired: ['ID', 'Timestamp', 'ServiceOperation', 'MEP', 'MESSAGEID', 'Sender', 'PROCESSINSTANCEID', 'SENDERTIMESTAMP', 'PARENTPROCESSINSTANCEID', 'RELATESTOMESSAGEID', 'MESSAGE', 'MessageSize', 'REPLYCONTEXT']
}

export const TABLE_COLUMNS = {
  ...MESSAGE_TYPE_COLUMNS,
  LogPoints: ['INTERNALLOGID', 'Timestamp', 'DESCRIPTION', 'LOGPOINTNO', 'MESSAGEID', 'Sender', 'PROCESSINSTANCEID', 'SENDERTIMESTAMP', 'ENVIRONMENT', 'ORIGINATOR', 'OPERATION', 'SERVICE', 'MEP', 'PARENTPROCESSINSTANCEID', 'RELATESTOMESSAGEID', 'Aktionen'],
  Statistic: ['Zeit', 'Domain', 'DURATION', 'ORIGINATOR', 'OPERATION', 'SERVICE', 'MEP', 'ANZAHLGESAMT', 'ANZAHLFAULT', 'DURCHSCHNITT_GESAMT_ZEIT', 'DURCHSCHNITT_PROVIDER_ZEIT', 'DURCHSCHNITT_BUS_ZEIT'],
  Queues: ['QUEUE_NAME', 'QUEUE_TABLE', 'QUEUE_TYPE', 'EXPIRATION', 'USER_COMMENT', 'WAITING', 'READY', 'EXPIRED'],
  Queuetable: ['QUEUE_NAME', 'QUEUE_TABLE', 'MSGID', 'ENQ_TIME', 'MESSAGE', 'MessageSize', 'MessageContent'],
  Checkalive: ['USINGPORTFQN', 'PROVIDINGPORTFQN', 'ISALIVE', 'RESPONSE']
}

const filterOnParity = ({
  Filter: ({filter, onChange}) => (
    <select
      onChange={event => onChange(event.target.value)}
      style={{width: '100%'}}
      value={filter ? filter.value : ''}
    >
      {['Alle', 'Non-Zero'].map(value => <option key={value} value={value}>{value}</option>)}
    </select>
  ),
  filterMethod: (filter, row) => {
    if (filter.value === 'Alle') {
      return true
    } else {
      try {
        return parseInt('' + row[filter.id], 10) > 0
      } catch (_) {
        return true
      }
    }
  }
})

const DEFAULT_PROPS = {
  Aktionen: {
    width: 100,
    filterable: false,
    sortable: false
  },
  MESSAGEID: {
    Header: 'Message-ID',
    width: 180,
    ordnumg: 1
  },
  Timestamp: {
    Header: 'Timestamp',
    width: 100,
    aggregate: values => values[values.length - 1],
    ordnung: 3
  },
  Zeit: {
    Header: 'Zeit',
    width: 100,
    ordnung: 3
  },
  Sender: {
    Header: 'Sender',
    width: 200,
    aggregate: values => {
      return values.filter((v, i, a) => a.indexOf(v) === i).sort((a,) => a.indexOf('user') > 0 ? -1 : 1)
    },
    ordnung: 8
  },
  LOGPOINTNO: {
    Header: 'Logpunkte',
    width: 250,
    aggregate: values => values.join(','),
    filterMethod: (filter, row) => {
      if (typeof row.LOGPOINTNO === 'string') {
        const pruefer = RegExp(filter.value)
        const test = pruefer.test.bind(pruefer)
        // wir filtern nur auf Message-Ebene
        return row.LOGPOINTNO.split(',').some(test)
      } else {
        // die Einzel-Sätze wollen wir alle anzeigen
        return true
      }
    },
    ordnung: 10
  },
  MEP: {
    Header: 'MEP',
    width: 50,
    Filter: ({filter, onChange}) =>
      <select
        onChange={event => onChange(event.target.value)}
        style={{width: '100%'}}
        value={filter ? filter.value : ''}
      >
        {MEPS.map(([value, text]) => <option key={value} value={value}>{text}</option>)}
      </select>,
    ordnung: 15
  },
  ORIGINATOR: {
    Header: 'Bus',
    width: 50,
    aggregate: values => (
      values.indexOf('ESB0') > -1 ? 'ESB0' : values.indexOf('OSB') > -1
        ? 'OSB'
        : values[0]
    ),
    ordnung: 20
  },
  ServiceOperation: {
    Header: 'Service - Operation',
    minWidth: 250,
    ordnung: 25
  },
  SERVICE: {
    Header: 'Service',
    minWidth: 300,
    ordnung: 10
  },
  OPERATION: {
    Header: 'Operation',
    minWidth: 300,
    ordnung: 11
  },
  filter: {
    Header: 'filter',
    show: false
  },
  ENVIRONMENT: {
    Header: 'Env',
    width: 50
  },
  ENCODING: {
    Header: 'Enc',
    width: 50
  },
  MessageSize: {
    Header: 'Nachricht',
    width: 100,
    ordnung: 10
  },
  MessageContent: {
    Header: 'Nachrichteninhalt',
    ordnung: 11,
    accessor: item => item.MESSAGE,
  },
  MESSAGE: {
    show: false
  },
  MESSAGETYPE: {
    Header: 'Type',
    width: 80,
    ordnung: 20
  },
  ERRORCODE: {
    Header: 'Errorcode',
    width: 300,
    ordnung: 15,
    style: { 'whiteSpace': 'unset' }
  },
  REASON: {
    Header: 'Ursache',
    width: 300,
    ordnung: 16,
    style: { 'whiteSpace': 'unset' }
  },
  QUEUE_NAME: {
    Header: 'Queue',
    width: 350,
    ordnung: 1
  },
  QUEUE_TABLE: {
    Header: 'Queue-Tabelle',
    width: 350,
    ordnung: 2
  },
  MSGID: {
    Header: 'MSGID',
    width: 250,
    ordnung: 4,
  },
  QUEUE_TYPE: {
    Header: 'Queue-Typ',
    width: 130,
    ordnung: 22
  },
  EXPIRATION: {
    Header: 'Expiration',
    width: 100,
    ...filterOnParity,
    ordnung: 25
  },
  WAITING: {
    Header: 'Waiting',
    width: 100,
    ...filterOnParity,
    ordnung: 26
  },
  READY: {
    Header: 'Ready',
    width: 100,
    ...filterOnParity,
    ordnung: 27
  },
  EXPIRED: {
    Header: 'Expired',
    width: 100,
    ...filterOnParity,
    ordnung: 28
  },
  ENQ_TIME: {
    Header: 'Enqueue-Zeitpunkt',
    width: 250,
    ordnung: 3
  },
  USER_COMMENT: {
    Header: 'Kommentar',
    minWidth: 500,
    ordnung: 30
  },
  ANZAHLGESAMT: {
    Header: 'Calls',
    width: 100,
    ordnung: 20
  },
  ANZAHLFAULT: {
    Header: 'Faults',
    width: 100,
    ordnung: 21
  },
  DURCHSCHNITT_GESAMT_ZEIT: {
    Header: 'Ø Gesamt',
    width: 100,
    ordnung: 30
  },
  DURCHSCHNITT_BUS_ZEIT: {
    Header: 'Ø Bus',
    width: 100,
    ordnung: 31
  },
  DURCHSCHNITT_PROVIDER_ZEIT: {
    Header: 'Ø Provider',
    width: 100,
    ordnung: 32
  },
  Domain: {
    Header: 'Domäne',
    width: 150,
    ordnung: 12
  },
  USINGPORTFQN: {
    Header: 'Consumer',
    accessor: item => item.USINGPORTFQN.substring(20),
    width: 500,
    ordnung: 1
  },
  PROVIDINGPORTFQN: {
    Header: 'Provider',
    accessor: item => item.PROVIDINGPORTFQN.substring(20),
    width: 500,
    ordnung: 2
  },
  ISALIVE: {
    Header: 'isAlive',
    width: 100,
    ordnung: 3,
    accessor: item => item.ISALIVE === 1,
    Filter: ({filter, onChange}) =>
      <select
        onChange={event => onChange(event.target.value)}
        style={{width: '100%'}}
        value={filter ? filter.value : ''}
      >
        {[['', 'alle'], [ false, 'dead'], [true, 'alive']].map(([value, text]) => <option key={value} value={value}>{text}</option>)}
      </select>,
  },
  RESPONSE: {
    Header: 'Response',
    minWidth: 350,
    ordnung: 4
  }
}

const columnBase = cellfactory => uniq(Object.keys(TABLE_COLUMNS).reduce((acc, key) => concat(acc, TABLE_COLUMNS[key]), []))
  .map(item => {
    const o = {
      Header: item,
      id: item,
      accessor: item,
      aggregate: values => values[0],
      Cell: cellfactory(item)
    }

    if (DEFAULT_PROPS[item]) {
      return {
        ...o,
        ...DEFAULT_PROPS[item]
      }
    } else {
      return o
    }
  })
  .reduce((acc, item) => {
    acc[item.accessor] = item
    return acc
  }, {})

export const columnFactory = (cellfactory, decorator, columnIDs) => {
  const columns = decorator(columnBase(cellfactory))
  const sorted = sortBy(propOr(99, 'ordnung'), values(columns))
  return sorted.filter(c => columnIDs.indexOf(c.id) > -1)
}
