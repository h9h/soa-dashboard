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
  LogPoints: ['INTERNALLOGID', 'Timestamp', 'DESCRIPTION', 'LOGPOINTNO', 'MESSAGEID', 'Sender', 'PROCESSINSTANCEID', 'SENDERTIMESTAMP', 'ENVIRONMENT', 'ORIGINATOR', 'OPERATION', 'SERVICE', 'MEP', 'PARENTPROCESSINSTANCEID', 'RELATESTOMESSAGEID'],
  Statistic: ['STARTTIMESTAMP', 'DURATION', 'ENVIRONMENT', 'ORIGINATOR', 'OPERATION', 'SERVICE', 'MEP', 'Sender', 'ANZAHLGESAMT', 'ANZAHLFAULT', 'DURCHSCHNITT_GESAMT_ZEIT', 'DURCHSCHNITT_PROVIDER_ZEIT', 'DURCHSCHNITT_OSB_ZEIT'],
  Queues: ['QUEUE_NAME', 'QUEUE_TABLE', 'QUEUE_TYPE', 'EXPIRATION', 'USER_COMMENT', 'WAITING', 'READY', 'EXPIRED'],
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
  Sender: {
    Header: 'Sender',
    width: 220,
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
        // wir filtern nur auf Message-Ebene
        return row.LOGPOINTNO.split(',').indexOf(filter.value) > -1
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
    minWidth: 300,
    ordnung: 25
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
    width: 80,
    ordnung: 10
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
    ordnung: 15
  },
  REASON: {
    Header: 'Ursache',
    width: 300,
    ordnung: 16,
    style: { 'whiteSpace': 'unset' }
  },
  QUEUE_NAME: {
    Header: 'Queue',
    width: 250,
    ordnung: 20
  },
  QUEUE_TABLE: {
    Header: 'Queue-Tabelle',
    width: 250,
    ordnung: 21
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
  USER_COMMENT: {
    Header: 'Kommentar',
    minWidth: 500,
    ordnung: 30
  },

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
