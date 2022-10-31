import React from 'react'
import Navbar from 'react-bootstrap/Navbar'
import Nav from 'react-bootstrap/Nav'
import Navigation from './Navigation'

const HeaderHelp = () => (
  <Navbar bg="light" expand="lg" key="navbar" fixed="top">
    <Navbar.Brand href="/">
      Hilfe
    </Navbar.Brand>
    <Navbar.Toggle aria-controls="basic-navbar-nav"/>
    <Navbar.Collapse id="basic-navbar-nav">
      <Nav className="me-auto">
      </Nav>
      <Navigation page="help" />
    </Navbar.Collapse>
  </Navbar>
)

export default HeaderHelp
