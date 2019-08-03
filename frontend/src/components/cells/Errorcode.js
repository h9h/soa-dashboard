import React from 'react'
import { Red, Smaller, Small } from '../styles'

const error = text => {
  const idx = text.indexOf('Exception:')
  if (idx < 0) return null

  return text.substring(idx + 10)
}

const Errorcode = ({row}) => {
  const ec = row.row && row.row.ERRORCODE ? row.row.ERRORCODE : null
  if (!ec) return null

  const cause = error(ec)

  return (
    <Red>
      {cause && <Smaller>{cause}</Smaller>}
      {!cause && <Small>{ec}</Small>}
    </Red>
  )
}

export default Errorcode
