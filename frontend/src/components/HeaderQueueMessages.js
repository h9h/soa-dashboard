import React from 'react'
import Nav from 'react-bootstrap/Nav'
import Navbar from 'react-bootstrap/Navbar'
import Navigation from './Navigation'

const HeaderQueueMessages = () => {
  return (
    <Navbar bg="light" expand="lg" key="navbar" fixed="top">
      <Navbar.Brand href="/">
        Queue-Nachrichten
      </Navbar.Brand>
      <Navbar.Toggle aria-controls="basic-navbar-nav"/>
      <Navbar.Collapse id="basic-navbar-nav">
        <Nav className="me-auto">
        </Nav>
        <Nav className="justify-content-end">
          <Navigation page="queuedmessages" />
        </Nav>
      </Navbar.Collapse>
    </Navbar>
  )
}

export default HeaderQueueMessages
