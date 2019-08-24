import React from 'react'
import { Smaller } from '../styles'

const MsgID = ({row}) => {
  let decoded
  try {
    decoded = window.atob(String(row.value).replace(/[\t\n\f\r ]+/g, ""))
  } catch (_) {
    decoded = 'n.a.'
  }

  return (
    <Smaller>
      {row.value}<br />
      {decoded}
    </Smaller>
  )
}

export default MsgID
