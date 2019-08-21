import React, { useState, useEffect } from 'react'
import Button from 'react-bootstrap/Button'
import FormGroup from 'react-bootstrap/FormGroup'
import Form from 'react-bootstrap/Form'
import Container from 'react-bootstrap/Container'
import Row from 'react-bootstrap/Row'
import Col from 'react-bootstrap/Col'
import { Helmet } from 'react-helmet'
import { Centered, Red } from './components/styles'
import { connect } from 'react-redux'
import { loggedIn } from './logic/actions'
import { Icon } from './components/icons'
import WartenAnzeiger from './components/WartenAnzeiger'
import { checkAvailability, checkLogin, checkVersion } from './logic/authorization'
import { all, identity } from 'ramda'
import Blank from './components/Blank'
import { withNotification } from './logic/notification'
import Logo from './Logo'

import Log from './log'
const log = Log('pagelogin')

const HelpAuthenticator = ({show}) => {
  if (!show) return null

  return (
    <>
      <h3><Red><Icon glyph="stop"/></Red> Bitte beachten:</h3>
      <p>Es konnte keine Verbindung zum Authentifizierungs-Backend hergestellt werden.</p>
      <p>Eine Anmeldung ist daher hier nicht möglich.</p>
      {window.location.protocol === 'https:' && (
        <>
          <hr/>
          <p>Probieren Sie, ob die Anmeldung über http:// möglich ist</p>
        </>
      )}
    </>
  )
}

const PageLogin = props => {
  log.trace('PageLogin')
  const [appIsCurrent, setAppIsCurrent] = useState(false)
  const [authReady, setAuthReady] = useState(false)
  const [userId, setUserId] = useState('')
  const [password, setPassword] = useState('')
  const [waitingForAuthentication, setWaitingForAuthentication] = useState(false)

  useEffect(() => {
    const check = async () => {
      const isCurrent = await checkVersion()
      setAppIsCurrent(isCurrent)
    }
    check()
  }, [])

  useEffect(() => {
    const check = async () => {
      log.info('Checking, if Authenticator ready')
      const result = await checkAvailability()
      log.trace('checkAlive', result)
      setAuthReady(result)
    }
    check()
  }, []) // no "[]" means ==> check on every render. Makes sense, if user can start backend herself. Else [] ==> just once

  if (!appIsCurrent) {
    return (
      <Centered>
        <h2>Es steht eine neue Version der Applikation zur Verfügung</h2>
        <br />
        <h3>Bitte aktualisieren Sie die Seite</h3>
      </Centered>
    )
  }

  const validateForm = () => {
    return all(identity)(
      [
        userId.length > 4,
        password.length > 6,
        authReady
      ]
    )
  }

  const handleChange = fn => event => {
    fn(event.target.value)
  }

  const handleSubmit = event => {
    event.preventDefault()
    setWaitingForAuthentication(true)

    checkLogin(userId, password).then(user => {
      // falls token: eingeloggt
      if (user) {
        log.trace('propagate user into state')
        withNotification({
          nachricht: `Willkommen beim Dashboard, ${user.idm.givenName} ${user.idm.sn}!`,
          fn: () => props.loggedIn(user),
          autoClose: 5000
        })
      } else {
        // ansonsten clear password, neuer Versuch
        log.trace('log-in failed')
        withNotification({
          nachricht: 'Authentifizierung fehlgeschlagen',
          fn: () => {
            setPassword('')
            setWaitingForAuthentication(false)
          }
        })
      }
    })
  }

  if (waitingForAuthentication) {
    return <WartenAnzeiger nachricht="Authentifizierung läuft..."/>
  }

  const enabled = validateForm()

  return (
    <>
      <Helmet>
        <title>Login</title>
      </Helmet>
      <Container>
        <Row>
          <Col xs={{ offset: 4, span: 4 }}>
            <Centered>
              <br/>
              <Centered>
                <Logo />
                <hr />
                <h1 style={{ marginTop: '50px', fontWeight: 'bold' }}>ESB Dashboard</h1>
              </Centered>
              <br/>
            </Centered>
          </Col>
        </Row>
        <Row>
          <Col xs={4}>
            <HelpAuthenticator show={!authReady}/>
          </Col>
          <Col xs={4}>
            <Form onSubmit={handleSubmit}>
              <FormGroup controlId="userId">
                <Form.Label>User ID</Form.Label>
                <Form.Control
                  autoFocus
                  type="text"
                  value={userId}
                  onChange={handleChange(setUserId)}
                  autoComplete="username"
                />
              </FormGroup>
              <FormGroup controlId="password">
                <Form.Label>Passwort</Form.Label>
                <Form.Control
                  value={password}
                  onChange={handleChange(setPassword)}
                  type="password"
                  autoComplete="password"
                />
              </FormGroup>
              <Blank/>
              <Button
                block
                disabled={!enabled}
                variant={enabled ? 'primary' : 'outline-secondary'}
                type="submit"
                onKeyPress={event => {
                  if (event.key === 'Enter') {
                    handleSubmit(event)
                  }
                }}
              >
                <Icon glyph="login"/> Anmelden
              </Button>
            </Form>
          </Col>
        </Row>
      </Container>
    </>
  )
}

export default connect(
  state => ({
    userId: state.userId,
  }),
  dispatch => ({
    loggedIn: (user) => dispatch(loggedIn(user)),
  })
)(PageLogin)
