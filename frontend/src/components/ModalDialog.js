import React from 'react'
import Modal from 'react-bootstrap/Modal'
import Button from 'react-bootstrap/Button'
import styled from 'styled-components'

const Wrap = styled.div`
  overflow: scroll;
`

const ModalDialog = ({show, onHide, title, children, ...props}) => {
  return (
    <Modal show={show} onHide={onHide}
           size="xl"
           centered
           restoreFocus={true}
           scrollable={true}
           {...props}
    >
      <Modal.Header closeButton>
        <Modal.Title>
          {title}
        </Modal.Title>
      </Modal.Header>
      <Modal.Body>
        <Wrap>
          {children}
        </Wrap>
      </Modal.Body>
      <Modal.Footer>
        <Button onClick={onHide}>Schließen</Button>
      </Modal.Footer>
    </Modal>
  )
}

export default ModalDialog
