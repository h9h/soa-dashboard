import React, { useState, useEffect } from 'react'
import Form from 'react-bootstrap/Form'
import FormControl from 'react-bootstrap/FormControl'
import FormGroup from 'react-bootstrap/FormGroup'
import Nav from 'react-bootstrap/Nav'
import Navbar from 'react-bootstrap/Navbar'
import ButtonWithTip from '../components/ButtonWithTip'
import Blank from '../components/Blank'
import { getUmgebungen } from '../logic/api/api-dashboard'
import { withExplanation } from '../logic/notification'
import Log from '../log'
import Navigation from './Navigation'
import { connect } from 'react-redux'
import { setFilterMessages } from '../logic/actions'
import { OptionenMessageTypes } from '../logic/tableConfMessages'
import { calculateNewDates } from '../logic/time'
import Datum from './datetime/Datum'
import moment from 'moment'
import { getConfigurationValue } from '../logic/configuration'

const today = moment().format('DD.MM.YYYY')

const log = Log('headermessages')

export const HeaderForm = props => {
  const {umgebung, messageType, datumVon, datumBis} = props
  const [filter, changeFilter] = useState({umgebung, messageType, datumVon, datumBis})

  useEffect(() => {
    changeFilter({umgebung, messageType, datumVon, datumBis})
  }, [umgebung, messageType, datumVon, datumBis])

  const handleFilterChange = key => event => {
    const value = event.target ? event.target.value : event
    log.trace('filter change', key, value)

    changeFilter(filter => {
      let newFilter

      if (key === 'datumVon' || key === 'datumBis') {
        const {datumVon, datumBis} = calculateNewDates(filter, key, value)
        newFilter = {
          ...filter,
          datumVon,
          datumBis
        }
      } else {
        newFilter = {
          ...filter,
          [key]: value
        }
      }

      if (key === 'umgebung' || key === 'messageType') {
        withExplanation({
          nachricht: 'Nachrichten werden geladen',
          fn: () => props.setFilterMessages(newFilter.umgebung, newFilter.messageType, newFilter.datumVon, newFilter.datumBis)
        })
      }

      return newFilter
    })
  }

  return (
    <Form inline>
      <FormGroup controlId="select.umgebung">
        <FormControl as="select" value={filter.umgebung}
                     onChange={handleFilterChange('umgebung')}>
          {getUmgebungen(getConfigurationValue('umgebungen'))
            .map(umgebung => <option key={umgebung}>{umgebung}</option>)}
        </FormControl>
      </FormGroup>
      <Blank/>
      <Blank/>
      <Form.Label>Typ: </Form.Label>
      <Blank/>
      <FormGroup controlId="select.messagetype">
        <FormControl as="select" value={filter.messageType}
                     onChange={handleFilterChange('messageType')}>
          {OptionenMessageTypes}
        </FormControl>
      </FormGroup>
      <Blank/>
      <Blank/>
      <FormGroup>
        <Form.Label>Von: </Form.Label>
        <Blank/>
        <FormControl
          as={Datum}
          date={filter.datumVon}
          maxDate={moment(filter.datumBis, 'YYYY-MM-DD').format('DD.MM.YYYY')}
          setDate={handleFilterChange('datumVon')}
        />
      </FormGroup>
      <Blank/>
      <Blank/>
      <FormGroup>
        <Form.Label>Bis: </Form.Label>
        <Blank/>
        <FormControl
          as={Datum}
          date={filter.datumBis}
          maxDate={today}
          setDate={handleFilterChange('datumBis')}
        />
      </FormGroup>
      {filter.messageType && filter.datumVon && filter.datumBis && (
        <>
          <Blank/>
          <Blank/>
          <ButtonWithTip
            title="Nachrichten"
            description="Lade Nachrichten"
            glyph="execute"
            handleClick={() => {
              withExplanation({
                nachricht: 'Nachrichten werden geladen',
                fn: () => props.setFilterMessages(filter.umgebung, filter.messageType, filter.datumVon, filter.datumBis),
              })
            }}
          />
        </>
      )}
    </Form>
  )
}

const HeaderMessages = props => {
  return (
    <Navbar bg="light" expand="lg" key="navbar" fixed="top">
      <Navbar.Brand href="/">
        Messages
      </Navbar.Brand>
      <Navbar.Toggle aria-controls="basic-navbar-nav"/>
      <Navbar.Collapse id="basic-navbar-nav">
        <Nav className="mr-auto">
          <HeaderForm {...props} />
        </Nav>
        <Nav className="justify-content-end">
          <Navigation page="messages"/>
        </Nav>
      </Navbar.Collapse>
    </Navbar>
  )
}

export default connect(
  state => ({
    umgebung: state.umgebung,
    messageType: state.messageType,
    datumVon: state.datumVon,
    datumBis: state.datumBis,
  }),
  dispatch => ({
    setFilterMessages: (umgebung, messageType, datumVon, datumBis) => dispatch(setFilterMessages(umgebung, messageType, datumVon, datumBis))
  })
)(HeaderMessages)
