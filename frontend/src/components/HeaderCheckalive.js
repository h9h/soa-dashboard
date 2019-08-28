import React, { useState, useEffect } from 'react'
import Form from 'react-bootstrap/Form'
import FormControl from 'react-bootstrap/FormControl'
import FormGroup from 'react-bootstrap/FormGroup'
import Nav from 'react-bootstrap/Nav'
import Navbar from 'react-bootstrap/Navbar'
import { getUmgebungen } from '../logic/api/api-dashboard'
import { withNotification } from '../logic/notification'
import Log from '../log'
import Navigation from './Navigation'
import { connect } from 'react-redux'
import { setFilterCheckalive } from '../logic/actions'
import { getConfigurationValue } from '../logic/configuration'

const log = Log('headercheckalive')

const HeaderCheckalive = props => {
  const {umgebung} = props
  const [filter, changeFilter] = useState({umgebung})

  useEffect(() => {
    changeFilter({umgebung})
  }, [umgebung])

  const refresh = newFilter => {
    withNotification({
      nachricht: `Checkalive wird für Umgebung ${newFilter.umgebung} geladen`,
      fn: () => props.setFilterCheckalive(newFilter.umgebung)
    })
  }

  const handleFilterChange = key => event => {
    const value = event.target ? event.target.value : event
    log.trace('filter change', key, value)

    changeFilter(filter => {
      const newFilter = {
        ...filter,
        [key]: value
      }
      refresh(newFilter)
      return newFilter
    })
  }

  return (
    <Navbar bg="light" expand="lg" key="navbar" fixed="top">
      <Navbar.Brand href="/">
        Checkalive
      </Navbar.Brand>
      <Navbar.Toggle aria-controls="basic-navbar-nav"/>
      <Navbar.Collapse id="basic-navbar-nav">
        <Nav className="mr-auto">
          <Form inline>
            <FormGroup controlId="select.umgebung">
              <FormControl as="select" value={filter.umgebung}
                           onChange={handleFilterChange('umgebung')}>
                {getUmgebungen(getConfigurationValue('umgebungen'))
                  .map(umgebung => <option key={umgebung}>{umgebung}</option>)}
              </FormControl>
            </FormGroup>
          </Form>
        </Nav>
        <Nav className="justify-content-end">
          <Navigation page="checkalive"/>
        </Nav>
      </Navbar.Collapse>
    </Navbar>
  )
}

export default connect(
  state => ({
    umgebung: state.umgebung,
  }),
  dispatch => ({
    setFilterCheckalive: (umgebung) => dispatch(setFilterCheckalive(umgebung)),
  })
)(HeaderCheckalive)
