import React from 'react'
import Navbar from 'react-bootstrap/Navbar'
import moment from 'moment'
import Nav from 'react-bootstrap/Nav'
import Navigation from './Navigation'

const HeaderStandalone = ({ umgebung, datum, von, bis, searchType, searchValue }) => (
  <Navbar bg="light" expand="lg" key="navbar" fixed="top">
    <Navbar.Brand href="/">
      Nachrichten auf {umgebung} am {moment(datum, 'YYYY-MM-DD').format('DD.MM.YYYY')}
      {searchValue ? ` für ${searchType} ${searchValue}` :  ` von ${von} bis ${bis}`}
    </Navbar.Brand>
    <Navbar.Toggle aria-controls="basic-navbar-nav"/>
    <Navbar.Collapse id="basic-navbar-nav">
      <Nav className="mr-auto">
      </Nav>
      <Navigation page="standalone" />
    </Navbar.Collapse>
  </Navbar>
)

export default HeaderStandalone
