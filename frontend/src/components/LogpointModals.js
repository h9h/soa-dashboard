import React, { useState } from 'react'

import ServiceModal from './ServiceModal'
import ServicecallModal from './ServicecallModal'

export const Modal = props => {
  if (!props.show) return null

  const type = props.component
  if (!type) return null

  switch (type) {
    case 'Timestamp':
      return <ServiceModal {...props} />
    case 'LogpointAction':
      return <ServicecallModal {...props} />
    default:
      throw new Error('Unbekannter Type "' + type + '" in Modalem Dialog in LogTable')
  }
}

export const useModal = () => {
  const [modal, setModal] = useState({show: false})

  const hideModal = () => {
    setModal({show: false})
  }

  const showModal = (props) => {
    setModal({show: true, onHide: hideModal, ...props})
  }

  return [modal, showModal, hideModal]
}
