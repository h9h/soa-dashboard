import React from 'react'
import { Smaller } from '../styles'
import CopyToClipboard from '../CopyToClipboard'

const ProcessInstanceId = ({row}) => {
  const processInstanceId = row.value
  if (!processInstanceId) return null

  return (
    <CopyToClipboard text={processInstanceId} notificationText="ProcessInstanceID">
      <Smaller style={{ cursor: 'pointer' }}>
        {processInstanceId.substring(0, 16)}
        <br />
        {processInstanceId.substring(16)}
      </Smaller>
    </CopyToClipboard>
  )
}

export default ProcessInstanceId
