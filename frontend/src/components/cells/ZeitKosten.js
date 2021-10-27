import { Right } from '../styles'
import React from 'react'

const getColor = value => value >= 10 ? 'red': value >= 3 ? 'rgb(213, 187, 33)' : 'green'

const ZeitKosten = ({row}) => {
  const value = Math.round(row.value)
  return (
    <Right>
      <span style={{marginRight: '10px', color: getColor(value)}}>
        {value}
      </span>
    </Right>
  )
}

export default ZeitKosten
