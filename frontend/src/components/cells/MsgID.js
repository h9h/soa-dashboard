import React from 'react'
import { Smaller } from '../styles'

const MsgID = ({row}) => {
  return (
    <Smaller>
      {row.value}<br />
    </Smaller>
  )
}

export default MsgID
