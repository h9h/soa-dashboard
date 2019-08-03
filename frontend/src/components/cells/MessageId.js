import React from 'react'
import { Smaller } from '../styles'

const MessageId = ({row}) => {
  const messageId = row.value
  if (!messageId) return null

  return (
    <Smaller>
      {messageId.substring(0, 16)}
      <br />
      {messageId.substring(16)}
    </Smaller>
  )
}

export default MessageId
