import React, { useState, useEffect } from 'react'
import ModalDialog from './ModalDialog'
import { getService } from '../logic/api/api-dashboard'
import WartenAnzeiger from './WartenAnzeiger'
import ServiceView from './ServiceView'
import Log from '../log'

const log = Log('servicemodal')


const ServiceModal = (props) => {
  log.trace('Mount ServiceModal', props)
  const {show, onHide, row} = props
  const [service, setService] = useState(null)

  const { umgebung } = row.row.filter
  const { MESSAGEID: messageId, INTERNALLOGID: id } = row.row

  useEffect(() => {
    if (!show) return
    getService({ umgebung, id }, setService)
  }, [umgebung, id, show])

  return (
    <ModalDialog show={show} onHide={onHide} title={'Message: ' + messageId}>
      {service ? <ServiceView data={service} /> : <WartenAnzeiger />}
    </ModalDialog>
  )
}

export default ServiceModal
