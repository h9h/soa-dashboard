import React from 'react'
import { SmallX } from '../styles'

const MessageContent = ({row}) => {
  return (
    <SmallX>
      {row.value}
    </SmallX>
  )
}

export default MessageContent
