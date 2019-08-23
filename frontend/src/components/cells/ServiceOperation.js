import React from 'react'
import { Smaller } from '../styles'

const ServiceOperation = ({row}) => {
  const so = Array.isArray(row.value) ? row.value : row.value.split(':').map(t => t.trim())
  return (
    <>
      <Smaller key={0}>{so[0]}</Smaller>
      <br/>
      <Smaller key={1}>{so[1]}</Smaller>
    </>
  )
}

export default ServiceOperation
