import React from 'react'
import Navbar from 'react-bootstrap/Navbar'
import Nav from 'react-bootstrap/Nav'
import Navigation from './Navigation'
import Form from 'react-bootstrap/Form'
import SelectReportview from './SelectReportview'
import { VIEWS } from '../logic/statistics'
import Blank from './Blank'
import ButtonWithTip from './ButtonWithTip'
import { filterAll, renderAll } from 'dc'

const HeaderStandaloneStatistics = ({ title, view = 'default', setView = () => {} }) => {
  return (
    <Navbar bg="light" expand="lg" key="navbar" fixed="top">
      <Navbar.Brand href="/">
        {title}
      </Navbar.Brand>
      <Navbar.Toggle aria-controls="basic-navbar-nav"/>
      <Navbar.Collapse id="basic-navbar-nav">
        <Nav className="me-auto">
          <Form  className="d-flex">
            <SelectReportview views={VIEWS} value={view} onChange={setView} ohneTitel={true}/>
            <Blank/>
            <Blank/>
          </Form>
          <Form  className="d-flex">
            <ButtonWithTip
              title="Charts"
              description="Setze Charts zurück, lösche alle Filter"
              text="Reset"
              glyph="clearFilters"
              handleClick={() => {
                filterAll()
                renderAll()
              }}
            />
          </Form>
        </Nav>
        <Navigation page="standalone"/>
      </Navbar.Collapse>
    </Navbar>
  )
}

export default HeaderStandaloneStatistics
