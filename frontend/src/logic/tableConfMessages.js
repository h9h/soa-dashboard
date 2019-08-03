import React from 'react'
import { cellFactory } from '../components/cells'
import { columnFactory, MESSAGE_TYPE_COLUMNS } from './tableConfBase'
import { values } from 'ramda'

export const MESSAGE_TYPES_NAMES = {
  REJECTED: 'Rejected',
  EXPIRED: 'Expired',
  UNDELIVERED: 'Undelivered'
}

export const MESSAGE_TYPES = [
  [MESSAGE_TYPES_NAMES.REJECTED, 'Rejected (Nicht angenommen)'],
  [MESSAGE_TYPES_NAMES.EXPIRED, 'Expired (Dead Letter)'],
  [MESSAGE_TYPES_NAMES.UNDELIVERED, 'Undelivered (Nicht auslieferbar)'],
]

export const OptionenMessageTypes = values(MESSAGE_TYPES)
  .map(([value, text]) => <option key={value} value={value}>{text}</option>)

const decorator = columnObject => {
  [
    'PROCESSINSTANCEID',
    'SENDERTIMESTAMP',
    'PARENTPROCESSINSTANCEID',
    'RELATESTOMESSAGEID',
    'DESCRIPTION',
    'ID',
    'Env',
    'Enc'
  ].forEach(key => {
    if (columnObject[key]) columnObject[key].show = false
  })
  return columnObject
}

export const getColumns = (messageType, onClick) => {
  return columnFactory(cellFactory(onClick), decorator, MESSAGE_TYPE_COLUMNS[messageType])
}
