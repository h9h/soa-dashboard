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
import dc from 'dc'
import { getConfigurationValue } from '../logic/configuration'

const log = Log('headerstatistics')

const HeaderStatistics = props => {
  const {umgebung, datumVon, datumBis, view, colorScheme} = props
  const [filter, changeFilter] = useState({umgebung, datumVon, datumBis})

  useEffect(() => {
    changeFilter({umgebung, datumVon, datumBis})
  }, [umgebung, datumVon, datumBis])

  const refresh = newFilter => {
    withNotification({
      nachricht: `Statistik wird für Umgebung ${newFilter.umgebung} geladen`,
      fn: () => props.setFilterStatistics(newFilter.umgebung, newFilter.datumVon, newFilter.datumBis)
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

      if (key === 'umgebung') {
        refresh(newFilter)
      }

      return newFilter
    })
  }

  return (
    <Navbar bg="light" expand="lg" key="navbar" fixed="top">
      <Navbar.Brand href="/">
        Statistik
      </Navbar.Brand>
      <Navbar.Toggle aria-controls="basic-navbar-nav"/>
      <Navbar.Collapse id="basic-navbar-nav">
        <Nav className="mr-auto">
          <Form inline>
            <SelectReportview views={VIEWS} value={view} onChange={props.setView} ohneTitel={true}/>
            <Blank/>
            <Blank/>
          </Form>
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
            <FormGroup controlId="datum.von">
              <Form.Label>Von: </Form.Label>
              <Blank/>
              <FormControl
                as={Datum}
                date={filter.datumVon}
                minDate={moment(filter.datumBis, 'YYYY-MM-DD').subtract(21, 'days').format('DD.MM.YYYY')}
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
          <Form inline>
            <ButtonWithTip
              title="Charts"
              description="Setze Charts zurück, lösche alle Filter"
              text="Reset"
              glyph="clearFilters"
              handleClick={() => {
                dc.filterAll()
                dc.renderAll()
              }}
            />
          </Form>
        </Nav>
        <Nav className="justify-content-end">
          <Form inline>
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
    view: state.view,
    colorScheme: state.colorScheme,
  }),
  dispatch => ({
    setFilterStatistics: (umgebung, datumVon, datumBis) => dispatch(setFilterStatistics(umgebung, datumVon, datumBis)),
    setView: view => dispatch(setView(view)),
    setColorScheme: colorScheme => dispatch(setColorScheme(colorScheme)),
  })
)(HeaderStatistics)
