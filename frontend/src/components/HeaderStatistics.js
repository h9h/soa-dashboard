import React, { useState, useEffect } from 'react'
import Form from 'react-bootstrap/Form'
import FormControl from 'react-bootstrap/FormControl'
import FormGroup from 'react-bootstrap/FormGroup'
import Nav from 'react-bootstrap/Nav'
import Navbar from 'react-bootstrap/Navbar'
import ButtonWithTip from '../components/ButtonWithTip'
import Blank from '../components/Blank'
import { getUmgebungen } from '../logic/api/api-dashboard'
import { withNotification } from '../logic/notification'
import Log from '../log'
import Navigation from './Navigation'
import { connect } from 'react-redux'
import { setFilterStatistics, setView, setColorScheme } from '../logic/actions'
import { calculateNewDates } from '../logic/time'
import Datum from './datetime/Datum'
import moment from 'moment'
import SelectReportview from './SelectReportview'
import { VIEWS } from '../logic/statistics'
import SelectColorScheme from './dc/SelectColorScheme'
import {filterAll, renderAll} from 'dc'
import { getConfigurationValue } from '../logic/configuration'
import ButtonToolbar from 'react-bootstrap/ButtonToolbar'
import ToggleButtonGroup from 'react-bootstrap/ToggleButtonGroup'
import ToggleButton from 'react-bootstrap/ToggleButton'
import Tipp from './Tipp'
import { Icon } from './icons'
import { symmetricDifference } from 'ramda'
import useWindowSize from './useWindowSize'

const log = Log('headerstatistics')

const HeaderStatistics = props => {
  const {width} = useWindowSize()

  const {umgebung, datumVon, datumBis, statisticFlags, view, colorScheme} = props
  const [filter, changeFilter] = useState({umgebung, datumVon, datumBis, statisticFlags})

  useEffect(() => {
    changeFilter({umgebung, datumVon, datumBis, statisticFlags})
  }, [umgebung, datumVon, datumBis, statisticFlags])

  const refresh = newFilter => {
    withNotification({
      nachricht: `Statistik wird für Umgebung ${newFilter.umgebung} geladen`,
      fn: () => props.setFilterStatistics(newFilter.umgebung, newFilter.datumVon, newFilter.datumBis, newFilter.statisticFlags)
    })
  }

  const immediateReload = getConfigurationValue('advanced.immediateReloadOnUmgebungChanged') === 'true'

  const handleFilterChange = key => event => {
    const value = event.target ? event.target.value : event
    log.trace('filter change', key, value)

    changeFilter(filter => {
      let newFilter
      if (key === 'flag') {
        const flagValue = value.length > 0 ? symmetricDifference(filter.statisticFlags, value) : []
        newFilter = {
          ...filter,
          statisticFlags: flagValue
        }
      } else if (key === 'datumVon' || key === 'datumBis') {
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

      if ((immediateReload && key === 'umgebung') || key === 'flag') {
        refresh(newFilter)
      }

      return newFilter
    })
  }

  return (
    <Navbar bg="light" expand="lg" key="navbar" fixed="top">
      {width > 1600 && (
        <Navbar.Brand href="/">
          Statistik
        </Navbar.Brand>
      )}
      <Navbar.Toggle aria-controls="basic-navbar-nav"/>
      <Navbar.Collapse id="basic-navbar-nav">
        <Nav className="me-auto">
          <Form  className="d-flex">
            <SelectReportview views={VIEWS} value={view} onChange={props.setView} ohneTitel={true}/>
            <Blank/>
            <Blank/>
          </Form>
          <Form  className="d-flex">
            <FormGroup controlId="select.umgebung">
              <Form.Select value={filter.umgebung}
                           onChange={handleFilterChange('umgebung')}>
                {getUmgebungen(getConfigurationValue('umgebungen'))
                  .map(umgebung => <option key={umgebung}>{umgebung}</option>)}
              </Form.Select>
            </FormGroup>
            <Blank/>
            <Blank/>
          </Form>
          <Form  className="d-flex">
            <FormGroup controlId="datum.von">
              <Form.Label>Von: </Form.Label>
              <Blank/>
              <FormControl
                as={Datum}
                date={filter.datumVon}
                minDate={moment(filter.datumBis, 'YYYY-MM-DD').subtract(90, 'days').format('DD.MM.YYYY')}
                maxDate={moment().subtract(1, 'days').format('DD.MM.YYYY')}
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
                maxDate={moment().subtract(1, 'days').format('DD.MM.YYYY')}
                setDate={handleFilterChange('datumBis')}
              />
            </FormGroup>
            {filter.datumVon && filter.datumBis && (
              <>
                <Blank/>
                <FormGroup>
                  <ButtonToolbar>
                    <ToggleButtonGroup
                      type="checkbox"
                      name="properties"
                      value={filter.statisticFlags}
                      onChange={handleFilterChange('flag')}
                    >
                      <ToggleButton
                        value="daylight"
                        variant="light"
                      >
                        <Tipp
                          title="Nur Tagsüber"
                          content="Zeige nur Zeiten zwischen 06:00 und 20:00"
                        >
                          <Icon glyph="daylight"/>
                        </Tipp>
                      </ToggleButton>
                      <ToggleButton
                        value="night"
                        variant="light"
                      >
                        <Tipp
                          title="Nur Nachts"
                          content="Zeige nur Zeiten zwischen 20:00 und 05:00"
                        >
                          <Icon glyph="night"/>
                        </Tipp>
                      </ToggleButton>
                    </ToggleButtonGroup>
                  </ButtonToolbar>
                </FormGroup>
                <ButtonWithTip
                  title="Statistik"
                  description="Lade Statistik"
                  glyph="execute"
                  handleClick={() => refresh(filter)}
                />
              </>
            )}
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
        <Nav className="justify-content-end">
          <Form  className="d-flex">
            <SelectColorScheme scheme={colorScheme} onChange={props.setColorScheme} ohneTitel={true}/>
          </Form>
          <Blank/>
          <Blank/>
          <Navigation page="statistics"/>
        </Nav>
      </Navbar.Collapse>
    </Navbar>
  )
}

export default connect(
  state => ({
    umgebung: state.umgebung,
    datumVon: state.datumStatVon,
    datumBis: state.datumStatBis,
    statisticFlags: state.statisticFlags,
    view: state.view,
    colorScheme: state.colorScheme,
  }),
  dispatch => ({
    setFilterStatistics: (umgebung, datumVon, datumBis, statisticFlags) => dispatch(setFilterStatistics(umgebung, datumVon, datumBis, statisticFlags)),
    setView: view => dispatch(setView(view)),
    setColorScheme: colorScheme => dispatch(setColorScheme(colorScheme)),
  })
)(HeaderStatistics)
