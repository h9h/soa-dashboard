import React from 'react'
import { Icon } from '../icons'
import { Centered } from '../styles'

const getIconName = value => {
  switch(value) {
    case 'enabled': return "success"
    case 'disabled': return "fail"
    default: return null
  }
}

const Scheduler = ({row}) => {
  const glyph = getIconName(row.value)
  return (
    <Centered>
      {glyph ? <Icon glyph={glyph} /> : '-'}
    </Centered>
  )
}

export default Scheduler
