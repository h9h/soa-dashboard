import React from 'react'
import Spinner from 'react-bootstrap/Spinner'
import styled from 'styled-components'
import Navbar from 'react-bootstrap/Navbar'

const TopSpace = styled.div`
  position: absolute;
  top: 250px;
  left: 50%;
  z-index: 9;
`

const WartenAnzeiger = ({nachricht = null, withHeader = false}) => (
  <>
    {withHeader && (
      <Navbar bg="light" expand="lg" key="navbar" fixed="top">
        <Navbar.Brand href="/">
          ESB-Dashboard
        </Navbar.Brand>
      </Navbar>
    )}
    <TopSpace>
      <div className="d-flex justify-content-center">
        {nachricht && (
          <h2>{nachricht}</h2>
        )}
      </div>
      <div className="d-flex justify-content-center">
        <Spinner animation="border" role="status">
          <span className="sr-only">Bitte warten...</span>
        </Spinner>
      </div>
    </TopSpace>
  </>
)

export default WartenAnzeiger
