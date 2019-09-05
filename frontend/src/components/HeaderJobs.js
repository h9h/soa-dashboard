import React, { useEffect, useState } from 'react'
import Form from 'react-bootstrap/Form'
import FormControl from 'react-bootstrap/FormControl'
import FormGroup from 'react-bootstrap/FormGroup'
import Nav from 'react-bootstrap/Nav'
import Navbar from 'react-bootstrap/Navbar'
import { withNotification } from '../logic/notification'
import Log from '../log'
import Navigation from './Navigation'
import { connect } from 'react-redux'
import { setJobname } from '../logic/actions'
import { getJobs } from '../logic/api/rest-api-local'

const log = Log('headerjobs')

const OptionenJobs = ({jobs}) => {
  const optionValues = ['', ...jobs].map(j => ({ key: j, name: j === '' ? 'kein Job ausgewählt' : j.substring(0, j.length-9) }))
  log.trace('Jobs', optionValues)

  return (
    <>
      {optionValues.map(({key, name}) => (
        <option key={key} value={key}>{name}</option>
      ))}
    </>
  )
}

const HeaderJobs = props => {
  log.trace('Mount HeaderJobs', props)
  const [jobs, setJobs] = useState([])

  useEffect(() => {
    const cb = result => {
      if (result.status === 'ready') {
        log.trace('Jobs', { ...result })
        setJobs(result.data.jobs)
      }
    }
    getJobs(cb)
  }, [])

  const handleJobname = event => {
    const value = event.target ? event.target.value : event
    log.trace('new jobname', value)

    withNotification({
      nachricht: 'Job wird geladen',
      fn: () => props.setJobname(value)
    })
  }

  return (
    <Navbar bg="light" expand="lg" key="navbar" fixed="top">
      <Navbar.Brand href="/">
        Jobs
      </Navbar.Brand>
      <Navbar.Toggle aria-controls="basic-navbar-nav"/>
      <Navbar.Collapse id="basic-navbar-nav">
        <Nav className="mr-auto">
          <Form inline>
            { jobs && (
              <FormGroup controlId="select.jobname">
                <FormControl as="select"
                             value={props.jobname}
                             onChange={handleJobname}
                             style={{width: '600px'}}
                >
                  <OptionenJobs jobs={jobs} />
                </FormControl>
              </FormGroup>
            )}
          </Form>
        </Nav>
        <Nav className="justify-content-end">
          <Navigation page="jobs"/>
        </Nav>
      </Navbar.Collapse>
    </Navbar>
  )
}

export default connect(
  state => ({
    jobname: state.jobname,
  }),
  dispatch => ({
    setJobname: (jobname) => dispatch(setJobname(jobname))
  })
)(HeaderJobs)
