import React from 'react'
import { Smaller } from '../styles'
import CopyToClipboard from '../CopyToClipboard'

const MessageId = ({row}) => {
  const messageId = row.value
  if (!messageId) return null

  return (
    <CopyToClipboard text={messageId}>
      <Smaller style={{ cursor: 'pointer' }}>
        {messageId.substring(0, 16)}
        <br />
        {messageId.substring(16)}
      </Smaller>
    </CopyToClipboard>
  )
}

export default MessageId
