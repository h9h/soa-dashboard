import React from 'react'
import { Smaller } from '../styles'
import CopyToClipboard from '../CopyToClipboard'

const ServiceOperation = ({row}) => {
  const so = Array.isArray(row.value) ? row.value : row.value.split(':').map(t => t.trim())

  return (
    <>
      <CopyToClipboard text={so[0]} notificationText="Servicename">
        <Smaller key={0}>{so[0]}</Smaller>
      </CopyToClipboard>
      <br/>
      <CopyToClipboard text={so[1]} notificationText="Operation">
        <Smaller key={1}>{so[1]}</Smaller>
      </CopyToClipboard>
    </>
  )
}

export default ServiceOperation
