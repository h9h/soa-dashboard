import React from 'react'
import { Smaller } from '../styles'

const MsgID = ({row}) => (
  <Smaller>
    {row.value}<br />
    {window.atob(String(row.value).replace(/[\t\n\f\r ]+/g, ""))}
  </Smaller>
)

export default MsgID
