import React from 'react'
import { SmallX } from '../styles'

const MessageContent = ({row}) => {
  return (
    <SmallX>
      <div style={{ overflow: 'auto'}}>
        {row.value}
      </div>
    </SmallX>
  )
}

export default MessageContent
