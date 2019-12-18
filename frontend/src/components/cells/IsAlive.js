import React from 'react'
import { Icon } from '../icons'
import { Centered } from '../styles'

const getGlyph = value => {
  switch(value) {
    case 'dead': return 'fail'
    case 'alive': return 'success'
    default: return 'dontknow'
  }
}
const IsAlive = ({row}) => {
  const glyph = getGlyph(row.value)

  return (
    <Centered>
      <Icon glyph={glyph} />
    </Centered>
  )
}

export default IsAlive
