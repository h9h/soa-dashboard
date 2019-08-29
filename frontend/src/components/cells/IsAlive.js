import React from 'react'
import { Icon } from '../icons'
import { Centered } from '../styles'

const IsAlive = ({row}) => (
  <Centered>
    {row.value ? <Icon glyph="success" /> : <Icon glyph="fail" /> }
  </Centered>
)

export default IsAlive
