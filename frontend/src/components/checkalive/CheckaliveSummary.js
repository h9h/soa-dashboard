import React from 'react'
import { filter } from 'ramda'
import { Red } from '../styles'

const CheckaliveSummary = ({ data }) => {
  const success = filter(r => r.ISALIVE === 'alive', data)
  const fail = filter(r => r.ISALIVE === 'dead', data)
  const na = filter(r => r.ISALIVE === '-', data)

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
      <div>N.A.: {na.length}</div>
      <div>Gesamt: {data.length}</div>
    </div>
  )
}

export default CheckaliveSummary
