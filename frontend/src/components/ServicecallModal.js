import React from 'react'
import { Link } from 'react-router-dom'
import Servicecall from './Servicecall'
import ModalDialog from './ModalDialog'
import { Icon } from './icons'
import Blank from './Blank'
import { getMessageRoute } from '../logic/routes'
import Log from '../log'

const log = Log('servicecallmodal')

const ServicecallModal = (props) => {
  log.trace('Mount ServicecallModal', props)
  const {show, onHide, row} = props

  const filter = row.subRows[0].filter
  const { umgebung, datum, von, bis } = filter
  const messageId = row.row.MESSAGEID
  const route = getMessageRoute(umgebung, datum, von, bis, messageId)
  log.trace('Route', route)

  const title = (
    <>
      Logpoints für {row.row.ServiceOperation[1]} / {row.row.MESSAGEID}
      { route && (
        <>
          <Blank/>
          <Blank/>
          <Link id={route} to={route} target="_blank">
            <Icon glyph="logpointActionExtern"/>
          </Link>
        </>
      )}
    </>
  )

  return (
    <ModalDialog show={show} onHide={onHide} title={title}>
      <Servicecall umgebung={umgebung} logpoints={row.subRows}/>
    </ModalDialog>
  )
}

export default ServicecallModal
