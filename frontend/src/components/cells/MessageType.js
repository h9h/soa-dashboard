import React from 'react'
import { Icon } from '../icons'
import { Red, Smaller } from '../styles'
import Tipp from '../Tipp'

const MessageType = ({row}) => {
  const messageType = row.value
  if (!messageType) return null

  if (['Request', 'Callback'].indexOf(messageType) < 0) {
    return (
      <Red>
        <Tipp title="Falsche Beleung"
              content={`Dieses Feld dürfte nur mit "Request" oder "Callback" belegt sein. Tatsächlicher Inhalt ist "${messageType}"`}
        >
          <Icon glyph="danger" />
          <Smaller>Falsche Belegung</Smaller>
          <div>{messageType}</div>
        </Tipp>
      </Red>
    )
  }

  return (
    <div>
      {messageType}
    </div>
  )
}

export default MessageType
