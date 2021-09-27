import React from 'react'
import { cellFactory } from '../components/cells'
import { columnFactory } from './tableConfBase'
import { calculateTimingFromRows } from './calltiming'
import Log from '../log'

const log = Log('tableconflog')

const spezial = cell => ({
  Aktionen: {
    Aggregated: cell('Aktionen'),
  },
  MESSAGEID: {
    PivotValue: cell('MESSAGEID'),
  },
  VirtualMESSAGEID: {
    Aggregated: cell('MESSAGEID'),
  },
  Timestamp: {
    Aggregated: cell('Timestamp.Aggregated'),
  },
  Timing: {
    Aggregated: cell('Timing'),
  },
  LOGPOINTNO: {
    Aggregated: cell('LOGPOINTNO.Aggregated'),
  },
  ServiceOperation: {
    Aggregated: cell('ServiceOperation'),
  },
  filter: {
    show: false
  },
  DESCRIPTION: {
    show: false,
  },
  SENDERTIMESTAMP: {
    show: false,
  },
  PARENTPROCESSINSTANCEID: {
    show: false,
  },
  RELATESTOMESSAGEID: {
    show: false,
  },
  INTERNALLOGID: {
    show: false,
  },
  OPERATION: {
    show: false,
  },
  SERVICE: {
    show: false,
  },
  ENVIRONMENT: {
    show: false,
  },
  ORIGINATOR: {
    show: false,
  },
  SENDERFQN: {
    show: false,
  }
})

const TIMING_FILTER = [
  { value: 0, text: 'Alle', range: [0, Number.MAX_SAFE_INTEGER]},
  { value: 1, text: '< 50 ms', range: [0, 50]},
  { value: 2, text: '50 - 99 ms', range: [50, 100]},
  { value: 3, text: '100 - 499 ms', range: [100, 500]},
  { value: 4, text: '> 499 ms', range: [500, Number.MAX_SAFE_INTEGER]},
]

const decorator = showFunction => columnObject => {
  columnObject.Timing = {
    Header: 'Timing',
    id: 'Timing',
    accessor: 'LOGPOINTNO',
    width: 130,
    Filter: ({filter, onChange}) =>
      <select
        onChange={event => onChange(event.target.value)}
        style={{width: '100%'}}
        value={filter ? filter.value : ''}
      >
        {TIMING_FILTER.map(({value, text}) => <option key={value} value={value}>{text}</option>)}
      </select>,
    filterMethod: (filter, row) => {
      if (row._aggregated) {
        // wir filtern nur auf Message-Ebene
        try {
          const {timing} = calculateTimingFromRows(row._subRows)
          const [min, max] = TIMING_FILTER.filter(item => ('' + item.value) === filter.value)[0].range
          return min <= timing.antwort && timing.antwort < max
        } catch (e) {
          log.warn('caught exeption in filter method', filter, row, e)
          return true
        }
      } else {
        // die Einzel-Sätze wollen wir alle anzeigen
        return true
      }
    },
    ordnung: 5
  }

  columnObject.filter = {
    Header: 'filter',
    id: 'filter',
    accessor: 'filter',
    show: false
  }

  const s = spezial(cellFactory(showFunction))

  Object.keys(s).forEach(key => {
    if (columnObject[key]) {
      columnObject[key] = {
        ...columnObject[key],
        ...s[key]
      }
    }
  })

  return columnObject
}

export const getColumns = (showFunction, keys) => {
  const allKeys = keys.concat([
    'VirtualMESSAGEID',
    'Timestamp',
    'Sender',
    'ServiceOperation',
    'filter',
    'Timing',
    'Aktionen'
  ])

  return columnFactory(cellFactory(showFunction), decorator(showFunction), allKeys)
}
