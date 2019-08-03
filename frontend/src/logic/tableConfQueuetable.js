import React from 'react'
import Default from '../components/cells/Default'
import MessageExchangePattern from '../components/cells/MessageExchangePattern'

const cell = key => {
  switch (key) {
    case 'MEP':
      return row => <MessageExchangePattern row={row} />
    case 'Q_NAME':
    case 'MSGID':
    case 'ENQ_TIME':
    case 'OPERATION':
    case 'USER_DATA.TEXT_LOB':
    default:
      return row => <Default row={row} />
  }
}

const columns = () => {
  return [
    {
      Header: 'Queue Name',
      accessor: 'Q_NAME',
      Cell: cell('Q_NAME'),
      width: 130,
    },
    {
      Header: 'MSGID',
      accessor: 'MSGID',
      Cell: cell('MSGID'),
      width: 130,
    },
    {
      Header: 'ENQ_TIME',
      accessor: 'ENQ_TIME',
      Cell: cell('ENQ_TIME'),
      width: 130,
    },
    {
      Header: 'MEP',
      accessor: 'MEP',
      Cell: cell('MEP'),
      width: 130,
    },
    {
      Header: 'OPERATION',
      accessor: 'OPERATION',
      Cell: cell('OPERATION'),
      width: 200,
    },
    {
      Header: 'USER_DATA.TEXT_LOB',
      accessor: 'USER_DATA.TEXT_LOB',
      Cell: cell('USER_DATA.TEXT_LOB'),
      width: 500,
    },
  ]
}

export const getColumns = () => {
  return columns()
}
