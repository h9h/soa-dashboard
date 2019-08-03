import React from 'react'
import Navbar from 'react-bootstrap/Navbar'
import Nav from 'react-bootstrap/Nav'
import Navigation from './Navigation'

const HeaderProfile = () => {

  return (
    <Navbar bg="light" expand="lg" key="navbar" fixed="top">
      <Navbar.Brand href="/">
        Einstellungen
      </Navbar.Brand>
      <Navbar.Toggle aria-controls="basic-navbar-nav"/>
      <Navbar.Collapse id="basic-navbar-nav">
        <Nav className="mr-auto">
        </Nav>
        <Navigation page="profile" />
      </Navbar.Collapse>
    </Navbar>

  )
}

export default HeaderProfile
