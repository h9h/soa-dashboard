import React from 'react'
import Navbar from 'react-bootstrap/Navbar'

const HeaderServicecall = ({ messageId, umgebung, timestamp }) => (
  <Navbar bg="light" expand="lg" key="navbar" fixed="top">
    <Navbar.Brand href="/">
      Servicecall: {
        messageId
      } (auf {
        umgebung
      } am {
        timestamp.format('DD.MM.YYYY u\\m HH:mm')
      })
    </Navbar.Brand>
    <Navbar.Toggle aria-controls="basic-navbar-nav"/>
  </Navbar>
)

export default HeaderServicecall
