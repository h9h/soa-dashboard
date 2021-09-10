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
import { MESSAGE_TYPES_NAMES, OptionenMessageTypes } from '../logic/tableConfMessages'
import { calculateNewDates } from '../logic/time'
import Datum from './datetime/Datum'
import moment from 'moment'
import { getConfigurationValue } from '../logic/configuration'
import AutosuggestBox from './suggestions/AutosuggestBox'
import useWindowSize from './useWindowSize'
import { LOG_SEARCH_TYPES } from '../logic/store'
import { LRUProvider } from './suggestions/lruProvider'

const today = moment().format('DD.MM.YYYY')

const log = Log('headermessages')

const LRUs = Object.keys(LOG_SEARCH_TYPES).reduce((acc, key) => {
  acc[LOG_SEARCH_TYPES[key]] = new LRUProvider(LOG_SEARCH_TYPES[key])
  return acc
}, {})

export const HeaderForm = props => {
  const width = props.width || 1600

  const {umgebung, messageType, datumVon, datumBis, searchType, searchValue} = props
  const [filter, changeFilter] = useState({umgebung, messageType, datumVon, datumBis, searchType, searchValue})

  const searchTypes = [<option key={'SENDERFQN'}>{LOG_SEARCH_TYPES['SENDERFQN']}</option>] //Object.keys(LOG_SEARCH_TYPES).map(k => <option key={k}>{LOG_SEARCH_TYPES[k]}</option>)

  useEffect(() => {
    changeFilter({umgebung, messageType, datumVon, datumBis, searchType, searchValue})
  }, [umgebung, messageType, datumVon, datumBis, searchType, searchValue])

  const immediateReload = getConfigurationValue('advanced.immediateReloadOnUmgebungChanged') === 'true'

  const propagateFilter = filter => {
    withExplanation({
      nachricht: 'Nachrichten werden geladen',
      fn: () => props.setFilterMessages(filter.umgebung, filter.messageType, filter.datumVon, filter.datumBis, filter.searchType, filter.searchValue)
    })
  }

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

      if (immediateReload && (key === 'umgebung' || key === 'messageType')) {
        propagateFilter(newFilter)
      }

      return newFilter
    })
  }

  const propagateLocalFilter = () => {
    LRUs[filter.searchType].store(filter.searchValue)
    propagateFilter(filter)
  }

  return (
    <>
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
      </Form>
      <Form inline>
        <FormGroup controlId="select.messagetype">
          <Form.Label>Typ: </Form.Label>
          <Blank/>
          <FormControl as="select" value={filter.messageType}
                       onChange={handleFilterChange('messageType')}>
            {OptionenMessageTypes}
          </FormControl>
        </FormGroup>
        <Blank/>
        <Blank/>
      </Form>
      <Form inline onSubmit={e => e.preventDefault()}>
        <FormGroup controlId="datum.von">
          <Form.Label>Von: </Form.Label>
          <Blank/>
          <FormControl
            as={Datum}
            date={filter.datumVon}
            maxDate={today}
            setDate={handleFilterChange('datumVon')}
          />
        </FormGroup>
        <Blank/>
        <Blank/>
        <FormGroup controlId="datum.bis">
          <Form.Label>Bis: </Form.Label>
          <Blank/>
          <FormControl
            as={Datum}
            date={filter.datumBis}
            maxDate={today}
            setDate={handleFilterChange('datumBis')}
          />
          <Blank/>
          <Blank/>
          <Blank/>
        </FormGroup>
        <FormGroup controlId="select.suchtyp">
          <FormControl as="select" value={filter.searchType} onChange={handleFilterChange('searchType')} disabled={messageType === MESSAGE_TYPES_NAMES.REJECTED}>
            {searchTypes}
          </FormControl>
          <div style={{width: `${width > 1600 ? '600' : '145'}px`}}>
            <AutosuggestBox
              provider={LRUs[filter.searchType]}
              onChange={handleFilterChange('searchValue')}
              value={filter.searchValue || ''}
              disabled={messageType === MESSAGE_TYPES_NAMES.REJECTED}
            />
          </div>
        </FormGroup>
        {filter.messageType && filter.datumVon && filter.datumBis && (
          <>
            <ButtonWithTip
              title="Nachrichten"
              description="Lade Nachrichten"
              glyph="execute"
              handleClick={() => {
                withExplanation({
                  nachricht: 'Nachrichten werden geladen',
                  fn: () => propagateLocalFilter(),
                })
              }}
            />
          </>
        )}
      </Form>
    </>
  )
}

const HeaderMessages = props => {
  const {width} = useWindowSize()
  return (
    <Navbar bg="light" expand="lg" key="navbar" fixed="top">
      {width > 1600 && (
        <Navbar.Brand href="/">
          Messages
        </Navbar.Brand>
      )}
      <Navbar.Toggle aria-controls="basic-navbar-nav"/>
      <Navbar.Collapse id="basic-navbar-nav">
        <Nav className="mr-auto">
          <HeaderForm width={width} {...props} />
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
    searchType: state.messageSearchType,
    searchValue: state.messageSearchValue
  }),
  dispatch => ({
    setFilterMessages: (umgebung, messageType, datumVon, datumBis, searchType, searchValue) => dispatch(setFilterMessages(umgebung, messageType, datumVon, datumBis, searchType, searchValue))
  })
)(HeaderMessages)
