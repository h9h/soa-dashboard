import React, { useEffect, useState } from 'react'
import { getService } from '../logic/api/api-dashboard'
import WartenAnzeiger from './WartenAnzeiger'
import ServiceView from './ServiceView'
import Log from '../log'

const log = Log('messagefromlogpoint')

const MessageFromLogpoint = ({umgebung, logpointNo, id}) => {
  const [message, setMessage] = useState(null)

  useEffect(() => {
    log.trace('useEffect on id', id)
    if (!id) return
    getService({umgebung, id}, setMessage)
  }, [id, umgebung])

  log.trace('render')
  return (
    <>
      <h5>Logpoint Nummer: {logpointNo}</h5>
      {id && !message && <WartenAnzeiger/>}
      {message && <ServiceView data={message}/>}
    </>
  )
}

export default MessageFromLogpoint

