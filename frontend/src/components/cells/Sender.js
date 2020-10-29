import React from 'react'
import { Smaller } from '../styles'
import { indexOf } from 'ramda'
import { sortLogpunkte } from '../../logic/logpunkt'
import CopyToClipboard from '../CopyToClipboard'

const Sender = ({row}) => {
  if (!row.aggregated) {
    return (
      <CopyToClipboard text={row.original ? row.original.SENDERFQN : ""} notificationText="SenderFQN">
        <Smaller>{row.value}</Smaller>
      </CopyToClipboard>
    )
  }

  if (row.aggregated) {
    const senderRows = row.subRows.sort(sortLogpunkte)
    const uniqueSenders = senderRows.map(row => ([row.Sender, row._original.SENDERFQN])).filter((v,i,a) => indexOf(v, a) === i)

    return (
      <Smaller>
        {uniqueSenders.map((sender, idx) => (
          <CopyToClipboard key={idx} text={sender[1]} notificationText="SenderFQN">
            <div>{sender[0]}</div>
          </CopyToClipboard>
        ))}
      </Smaller>
    )
  }
}

export default Sender
