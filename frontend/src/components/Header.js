import React, { useState, useEffect } from 'react'
import Form from 'react-bootstrap/Form'
import FormControl from 'react-bootstrap/FormControl'
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
import { getDurationUnitText, getDuration, TIME_FORMAT, widenTime, getDurations } from '../logic/time'
import moment from 'moment'
import Datum from './datetime/Datum'
import Zeit from './datetime/Zeit'
import { equals } from 'ramda'
import AutosuggestBox from './suggestions/AutosuggestBox'
import { LOG_SEARCH_TYPES } from '../logic/store'
import { LRUProvider } from './suggestions/lruProvider'
import { getConfigurationValue } from '../logic/configuration'
import useWindowSize from './useWindowSize'
import { FormCheck } from 'react-bootstrap'
import Tipp from './Tipp'

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
        <Nav className="me-auto">
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
  const {width: windowWidth} = useWindowSize()
  const width = rest.width || windowWidth

  // setzte lokale Daten auf Props beim ersten Render
  const {umgebung, datum, duration, bis, searchType, searchValue, onlyFaults} = rest
  const [localFilter, setLocalFilter] = useState({umgebung, datum, duration, bis, searchType, searchValue, onlyFaults})

  // sorge dafür, dass die lokalen Daten die Props auch bei Änderungen wiederspiegeln
  useEffect(() => {
    setLocalFilter(filter => {
      if (equals(filter, {umgebung, datum, duration, bis, searchType, searchValue, onlyFaults})) return filter
      log.trace('aktualisiere Parameter', { umgebung, datum, duration, bis, searchType, searchValue, onlyFaults })
      return {umgebung, datum, duration, bis, searchType, searchValue, onlyFaults}
    })
  }, [umgebung, datum, duration, bis, searchType, searchValue, onlyFaults])

  log.trace('filter', localFilter)
  const immediateReload = getConfigurationValue('advanced.immediateReloadOnUmgebungChanged') === 'true'

  const handleFilterChange = key => event => {
    const value = event.target ? event.target.value : event
    log.trace('change filter', key, value)

    setLocalFilter(filter => {
      if (key === 'onlyFaults') return {...filter, onlyFaults: event.target.checked}

      const searchValue = key === 'searchType' ? '' : filter.searchValue // setze Suchwert zurück, wenn Suchtyp geändert wird
      const newFilter = key === 'duration.anzahl'
        ? {
        ...filter,
          duration: {
            unit: filter.duration.unit,
            anzahl: value
          }
        }
        : {
          ...filter,
          searchValue,
          [key]: value.replace(/"/g, '') // strippe " aus Suchwert (eigentlich immer, aber da spielt es eine Rolle) damit kopierter Wert (mit ") einfach eingesetzt werden kann
      }

      if (immediateReload && key === 'umgebung') {
        propagateFilter(newFilter)
      }
      return newFilter
    })
  }

  const propagateFilter = filter => {
    withExplanation({
      nachricht: 'Selektiere Daten',
      fn: () => setFilter(filter.umgebung, filter.datum, filter.duration, filter.bis, filter.searchType, filter.searchValue, filter.onlyFaults)
    })
  }

  const getRoute = filter => {
    let {von, bis} = getDuration(filter.duration)(moment(filter.bis, TIME_FORMAT))

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

  const durations = getDurations(localFilter.duration.unit).map(anzahl => <option key={anzahl}>{anzahl}</option>)

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

  const durationUnitText = getDurationUnitText(localFilter.duration.unit)

  return (
    <>
      <Form className='d-flex'>
        <ButtonWithTip
          glyph="actualise"
          title="Aktualisiere Selektion"
          description="Aktualisiere auf das aktuelle Datum und Uhrzeit und selektiere Logpunkte"
          handleClick={aktualisiere}
        />
          <Form.Select value={localFilter.umgebung} onChange={handleFilterChange('umgebung')}>
            {umgebungen}
          </Form.Select>
        <Blank/>
        <Blank/>
        <Blank/>
          <FormControl
            as={Datum}
            date={localFilter.datum}
            maxDate={today}
            minDate={twoWeeksAgo}
            setDate={handleFilterChange('datum')}
          />
          <Blank/>
        <Blank/>
          <Form.Select
            value={localFilter.duration.anzahl}
            onChange={handleFilterChange('duration.anzahl')}
            style={{ width: "100px" }}
          >
            {durations}
          </Form.Select>
        <Blank/>
          <Navbar.Text style={{ width: "fit-content", whiteSpace: "nowrap" }}>
            {durationUnitText} bis:
          </Navbar.Text>
          <Blank/>
          <FormControl
            as={Zeit}
            date={localFilter.bis}
            setDate={handleFilterChange('bis')}
          />
          <Blank/>
          <Blank/>
          <Blank/>
        <Navbar.Text style={{ width: "fit-content", whiteSpace: "nowrap" }}>
          <Tipp title="Nur Faults" content="Selektiere nur Calls mit Fault-Logpunkten">
            <FormCheck
              type="checkbox"
              checked={localFilter.onlyFaults}
              onChange={handleFilterChange('onlyFaults')}
              label={"nur Faults"}
            />
          </Tipp>
        </Navbar.Text>
          <Blank/>
          <Blank/>
          <Blank/>
          <Form.Select value={localFilter.searchType} onChange={handleFilterChange('searchType')}>
            {searchTypes}
          </Form.Select>
          <div style={{width: `${width > 1600 ? '500' : '260'}px`}}>
            <AutosuggestBox
              provider={LRUs[localFilter.searchType]}
              onChange={handleFilterChange('searchValue')}
              value={localFilter.searchValue}
            />
          </div>
        <ButtonWithTip
          title="Selektiere Log-Punkte"
          description={`Selektiert die Logpunkte entsprechend den Filter-Kriterien. 
        Es wird nur eine limitierte Anzahl an Logpunkten zurückgegeben.
        
        Da zu einem Servicecall in der Regel mehrere Logpunkte existieren, ist die Anzahl der Servicecalls entsprechend geringer.
        `}
          glyph="execute"
          handleClick={propagateLocalFilter}
        />
        <Navbar.Text style={{ width: "fit-content", whiteSpace: "nowrap" }}>
        <Separator/>
        </Navbar.Text>
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
    duration: state.duration,
    von: state.von,
    bis: state.bis,
    searchType: state.logSearchType,
    searchValue: state.logSearchValue,
    onlyFaults: state.onlyFaults
  }),
  dispatch => ({
    actualise: () => dispatch(actualise),
    setFilter: (umgebung, datum, duration, bis, searchType, searchValue, onlyFaults) => dispatch(setFilter(umgebung, datum, duration, bis, searchType, searchValue, onlyFaults))
  })
)(Header)
