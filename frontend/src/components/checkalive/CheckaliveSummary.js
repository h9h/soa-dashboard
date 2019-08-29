import React from 'react'
import { filter } from 'ramda'
import { Red } from '../styles'

const CheckaliveSummary = ({ data }) => {
  const success = filter(r => r.ISALIVE === 1, data)
  const fail = filter(r => !r || r.ISALIVE !== 1, data)

  return (
    <div>
      <div>Alive: {success.length}</div>
      <div>
        {fail.length > 0 ? (
          <Red>Dead: {fail.length}</Red>
        ) : (
          <span>Dead: {fail.length}</span>
        )}
      </div>
      <div>Gesamt: {data.length}</div>
    </div>
  )
}

export default CheckaliveSummary
