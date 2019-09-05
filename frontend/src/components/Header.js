import React, { useState, useEffect } from 'react'
import Form from 'react-bootstrap/Form'
import FormControl from 'react-bootstrap/FormControl'
import FormGroup from 'react-bootstrap/FormGroup'
import Nav from 'react-bootstrap/Nav'
import Navbar from 'react-bootstrap/Navbar'
import { Link } from 'react-router-dom'
import ButtonWithTip from '../components/ButtonWithTip'
import Blank from '../components/Blank'
import { getUmgebungen } from '../logic/api/api-dashboard'
import { withExplanation } from '../logic/notification'
import { actualise, setFilter } from '../logic/actions'
import Navigation from './Navigation'
import { connect } from 'react-redux'
import Log from '../log'
import { getDashboardRoute } from '../logic/routes'
import Separator from './Separator'
import { getDuration, TIME_FORMAT, widenTime } from '../logic/time'
import moment from 'moment'
import Datum from './datetime/Datum'
import Zeit from './datetime/Zeit'
import { equals } from 'ramda'
import AutosuggestBox from './suggestions/AutosuggestBox'
import { LOG_SEARCH_TYPES } from '../logic/store'
import { LRUProvider } from './suggestions/lruProvider'
import { getConfigurationValue } from '../logic/configuration'
import useWindowSize from './useWindowSize'

const log = Log('header')

const today = moment().format('DD.MM.YYYY')
const twoWeeksAgo = moment().subtract(14, 'days').format('DD.MM.YYYY')

const Header = props => {
  return (
    <Navbar bg="light" expand="lg" key="navbar" fixed="top">
      <Navbar.Brand href="/">
        Logs
      </Navbar.Brand>
      <Navbar.Toggle aria-controls="basic-navbar-nav"/>
      <Navbar.Collapse id="basic-navbar-nav">
        <Nav className="mr-auto">
          <HeaderForm {...props} />
        </Nav>
        <Navigation page="dashboard"/>
      </Navbar.Collapse>
    </Navbar>
  )
}

const LRUs = Object.keys(LOG_SEARCH_TYPES).reduce((acc, key) => {
  acc[LOG_SEARCH_TYPES[key]] = new LRUProvider(LOG_SEARCH_TYPES[key])
  return acc
}, {})

export const HeaderForm = ({setFilter, actualise, ...rest}) => {
  log.trace('Mount Headerform', rest)
  const {windowWidth} = useWindowSize()
  const width = rest.width || windowWidth

  // setzte lokale Daten auf Props beim ersten Render
  const {umgebung, datum, bis, searchType, searchValue} = rest
  const [localFilter, setLocalFilter] = useState({umgebung, datum, bis, searchType, searchValue})

  // sorge dafür, dass die lokalen Daten die Props auch bei Änderungen wiederspiegeln
  useEffect(() => {
    setLocalFilter(filter => {
      if (equals(filter, {umgebung, datum, bis, searchType, searchValue})) return filter
      log.trace('aktualisiere Parameter', umgebung, datum, bis, searchType, searchValue)
      return {umgebung, datum, bis, searchType, searchValue}
    })
  }, [umgebung, datum, bis, searchType, searchValue])

  log.trace('filter', localFilter)

  const handleFilterChange = key => event => {
    const value = event.target ? event.target.value : event
    log.trace('change filter', key, value)

    setLocalFilter(filter => {
      const searchValue = key === 'searchType' ? '' : filter.searchValue // setze Suchwert zurück, wenn Suchtyp geändert wird
      const newFilter = {
        ...filter,
        searchValue,
        [key]: value.replace(/"/g, '') // strippe " aus Suchwert (eigentlich immer, aber da spielt es eine Rolle) damit kopierter Wert (mit ") einfach eingesetzt werden kann
      }

      if (key === 'umgebung') {
        propagateFilter(newFilter)
      }
      return newFilter
    })
  }

  const propagateFilter = filter => {
    withExplanation({
      nachricht: 'Selektiere Daten',
      fn: () => setFilter(filter.umgebung, filter.datum, filter.bis, filter.searchType, filter.searchValue)
    })
  }

  const getRoute = filter => {
    let {von, bis} = getDuration(getConfigurationValue('time.duration'))(moment(filter.bis, TIME_FORMAT))

    if (filter.searchValue) {
      const {von: vonNeu, bis: bisNeu} = widenTime(getConfigurationValue('filter.widenFilter'))(von, bis)
      return getDashboardRoute(filter.umgebung, filter.datum, vonNeu, bisNeu)(filter.searchType, encodeURIComponent(filter.searchValue))
    } else {
      return getDashboardRoute(filter.umgebung, filter.datum, von, bis)(null, null)
    }
  }

  const aktualisiere = () => {
    withExplanation({
      nachricht: 'Daten werden aktualisiert',
      fn: actualise
    })
  }
  const umgebungen = getUmgebungen(getConfigurationValue('umgebungen')).map(umgebung => <option
    key={umgebung}>{umgebung}</option>)
  const searchTypes = Object.keys(LOG_SEARCH_TYPES).map(k => <option key={k}>{LOG_SEARCH_TYPES[k]}</option>)
  const propagateLocalFilter = () => {
    LRUs[localFilter.searchType].store(localFilter.searchValue)
    propagateFilter(localFilter)
  }

  const gotoSnapshot = () => {
    if (umgebung && datum && bis) {
      LRUs[localFilter.searchType].store(localFilter.searchValue)
      document.getElementById('snapshot').click()
    }
  }

  return (
    <>
      <Form inline>
        <ButtonWithTip
          glyph="actualise"
          title="Aktualisiere Selektion"
          description="Aktualisiere auf das aktuelle Datum und Uhrzeit und selektiere Logpunkte"
          handleClick={aktualisiere}
        />
      </Form>
      <Form inline>
        <FormGroup controlId="select.umgebung">
          <FormControl as="select" value={localFilter.umgebung} onChange={handleFilterChange('umgebung')}>
            {umgebungen}
          </FormControl>
        </FormGroup>
        <Blank/>
        <Blank/>
        <Blank/>
      </Form>
      <Form inline>
        <FormGroup controlId="select.datum">
          <FormControl
            as={Datum}
            date={localFilter.datum}
            maxDate={today}
            minDate={twoWeeksAgo}
            setDate={handleFilterChange('datum')}
          />
          <Blank/>
        </FormGroup>
        <Blank/>
        <FormGroup controlId="select.bis">
          Bis:
          <Blank/>
          <FormControl
            as={Zeit}
            date={localFilter.bis}
            setDate={handleFilterChange('bis')}
          />
          <Blank/>
          <Blank/>
          <Blank/>
        </FormGroup>
      </Form>
      <Form inline>
        <FormGroup controlId="select.suchtyp">
          <FormControl as="select" value={localFilter.searchType} onChange={handleFilterChange('searchType')}>
            {searchTypes}
          </FormControl>
          <div style={{width: `${width > 1600 ? '600' : '260'}px`}}>
            <AutosuggestBox
              provider={LRUs[localFilter.searchType]}
              onChange={handleFilterChange('searchValue')}
              value={localFilter.searchValue}
            />
          </div>
        </FormGroup>
        <ButtonWithTip
          title="Selektiere Log-Punkte"
          description={`Selektiert die Logpunkte entsprechend den Filter-Kriterien. 
        Es wird nur eine limitierte Anzahl an Logpunkten zurückgegeben.
        
        Da zu einem Servicecall in der Regel mehrere Logpunkte existieren, ist die Anzahl der Servicecalls entsprechend geringer.
        `}
          glyph="execute"
          handleClick={propagateLocalFilter}
        />
        <Separator/>
        <Link id="snapshot" to={getRoute(localFilter)} target="_blank"/>
        <ButtonWithTip
          glyph="snapshot"
          title="Snapshot"
          description="Öffne die aktuelle Selektion unter einer dedizierten URL in einem neuen Tab"
          handleClick={gotoSnapshot}
        />
        <Blank/>
      </Form>
    </>
  )
}

export default connect(
  state => ({
    umgebung: state.umgebung,
    datum: state.datum,
    von: state.von,
    bis: state.bis,
    searchType: state.logSearchType,
    searchValue: state.logSearchValue
  }),
  dispatch => ({
    actualise: () => dispatch(actualise),
    setFilter: (umgebung, datum, bis, searchType, searchValue) => dispatch(setFilter(umgebung, datum, bis, searchType, searchValue))
  })
)(Header)
