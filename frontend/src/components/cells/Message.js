import React from 'react'
import { Centered, Smaller } from '../styles'
import Button from 'react-bootstrap/Button'
import { Icon } from '../icons'
import Blank from '../Blank'

const	BYTES = ["B", "KB", "MB", "GB", "TB", "PB", "EB", "ZB", "YB"]
const sizeOf = bytes => {
  const e = Math.min(8, Math.max(0, Math.floor(Math.log(bytes) / Math.log(1024))))

  const size = bytes === 0 ? 0 : Number((bytes / Math.pow(2, e * 10)).toFixed(e > 0 ? 1 : 0))
  const unit = BYTES[e];

  return size.toLocaleString('de-DE') + ' ' + unit
}

const Message = ({row, onClick}) => {
  return (
    <Centered>
      <Button size="sm" variant="light" onClick={() => onClick({
        origin: 'Message',
        row,
      })}>
        <Icon glyph='message'/>
        <Blank/>
        {row.row.MessageSize && (
          <Smaller>
            {sizeOf(row.row.MessageSize)}
          </Smaller>
        )}
      </Button>
    </Centered>
  )
}

export default Message
