import React, { useState } from 'react'
import Form from 'react-bootstrap/Form'
import FormControl from 'react-bootstrap/FormControl'
import FormGroup from 'react-bootstrap/FormGroup'
import Nav from 'react-bootstrap/Nav'
import Navbar from 'react-bootstrap/Navbar'
import Blank from '../components/Blank'
import { getUmgebungen } from '../logic/api/api-dashboard'
import { withExplanation } from '../logic/notification'
import SelectDatabase from './SelectDatabase'
import Log from '../log'
import Navigation from './Navigation'
import { connect } from 'react-redux'
import { setFilterQueues } from '../logic/actions'
import { getConfigurationValue } from '../logic/configuration'

const log = Log('headerqueues')

const HeaderQueues = props => {
  const { umgebung, database } = props
  const [filter, changeFilter] = useState({ umgebung, database })

  const handleFilterChange = key => event => {
    const value = event.target ? event.target.value : event
    log.trace('filter change', key, value)

    changeFilter(filter => {
      const newFilter = {
        ...filter,
        [key]: value
      }

      withExplanation({
        nachricht: 'Queue-Übersicht wird geladen',
        fn: () => props.setFilterQueues(newFilter.umgebung, newFilter.database)
      })

      return newFilter
    })
  }

  return (
    <Navbar bg="light" expand="lg" key="navbar" fixed="top">
      <Navbar.Brand href="/">
        Queues
      </Navbar.Brand>
      <Navbar.Toggle aria-controls="basic-navbar-nav"/>
      <Navbar.Collapse id="basic-navbar-nav">
        <Nav className="mr-auto">
          <Form inline>
            <FormGroup controlId="filter.umgebung">
              <FormControl as="select" value={filter.umgebung}
                           onChange={handleFilterChange('umgebung')}>
                {getUmgebungen(getConfigurationValue('umgebungen'))
                  .map(umgebung => <option key={umgebung}>{umgebung}</option>)}
              </FormControl>
            </FormGroup>
            <Blank/>
            <Blank/>
            <Form.Group controlId="filter.database">
              <SelectDatabase umgebung={filter.umgebung} database={filter.database} onSelect={handleFilterChange('database')} />
            </Form.Group>
          </Form>
        </Nav>
        <Nav className="justify-content-end">
          <Navigation page="queues" />
        </Nav>
      </Navbar.Collapse>
    </Navbar>
  )
}

export default connect(
  state => ({
    umgebung: state.umgebung,
    database: state.database,
  }),
  dispatch => ({
    setFilterQueues: (umgebung, database) => dispatch(setFilterQueues(umgebung, database))
  })
)(HeaderQueues)
