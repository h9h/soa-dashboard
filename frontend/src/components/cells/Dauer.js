import React from 'react'
import { Right } from '../styles'

const Dauer = ({row}) => {
  const dauer = row.value

  let formatted
  try {
    formatted = parseInt('' + dauer, 10).toLocaleString()
  } catch (_) {
    formatted = '-'
  }

  return (
    <Right>
      <span style={{marginRight: '10px'}}>
        {formatted} ms
      </span>
    </Right>
  )
}

export default Dauer
