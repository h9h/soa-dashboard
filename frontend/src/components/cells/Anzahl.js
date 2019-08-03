import React from 'react'
import { Right } from '../styles'

const Anzahl = ({row}) => {
  const anzahl = row.value

  let formatted
  try {
    formatted = parseInt('' + anzahl, 10).toLocaleString()
  } catch (_) {
    formatted = 'n.a.'
  }

  return (
    <Right>
    <span style={{marginRight: '10px'}}>
      {formatted}
    </span>
    </Right>
  )
}

export default Anzahl
