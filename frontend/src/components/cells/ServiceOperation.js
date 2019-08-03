import React from 'react'
import { Smaller } from '../styles'

const ServiceOperation = ({row}) => {
  return (
    <>
      <Smaller key={0}>{row.value[0]}</Smaller>
      <br/>
      <Smaller key={1}>{row.value[1]}</Smaller>
    </>
  )
}

export default ServiceOperation
