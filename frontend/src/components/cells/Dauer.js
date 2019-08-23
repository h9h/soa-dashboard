import React from 'react'
import { Right } from '../styles'
import { HISTOGRAMM_COLORS } from '../dc/barCharts'

const Dauer = ({row, partitionKey}) => {
  const dauer = row.value

  let formatted
  try {
    formatted = parseInt('' + dauer, 10).toLocaleString()
  } catch (_) {
    formatted = '-'
  }

  const color = HISTOGRAMM_COLORS[row.original[partitionKey]] || '#000'

  return (
    <Right>
      <span style={{marginRight: '10px', color}}>
        {formatted} ms
      </span>
    </Right>
  )
}

export default Dauer
