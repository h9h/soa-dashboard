import React from 'react'
import { Smaller } from '../styles'
import { prop } from 'ramda'
import { sortLogpunkte } from '../../logic/logpunkt'

const Sender = ({row}) => {
  if (!row.aggregated) {
    return (
      <Smaller>{row.value}</Smaller>
    )
  }

  if (row.aggregated) {
    const senderRows = row.subRows.sort(sortLogpunkte)
    const uniqueSenders = senderRows.map(prop('Sender')).filter((v,i,a) => a.indexOf(v) === i)

    return (
      <Smaller>
        {uniqueSenders.map((sender, idx) => (
          <div key={idx}>{sender}</div>
        ))}
      </Smaller>
    )
  }

}

export default Sender
