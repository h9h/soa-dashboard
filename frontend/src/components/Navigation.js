import React, { useState, useEffect } from 'react'
import Nav from 'react-bootstrap/Nav'
import Form from 'react-bootstrap/Form'
import { Link } from 'react-router-dom'
import ButtonWithTip from './ButtonWithTip'
import { connect } from 'react-redux'
import { logout } from '../logic/actions'
import { checkAliveFile } from '../logic/api/rest-api-local'
import Log from '../log'
import Dropdown from 'react-bootstrap/Dropdown'
import { getConfigurationValue } from '../logic/configuration'

const log = Log('navigation')

const Navigation = props => {
  const [haveJobsApi, setHaveJobsApi] = useState(false)

  useEffect(() => {
    checkAliveFile(props.user).then((have) => setHaveJobsApi(have))
  }, [props.user])

  log.trace('have Jobs-API', haveJobsApi)

  return (
    <Nav className="justify-content-end">
      <NavigationForm {...props} haveJobsApi={haveJobsApi}/>
    </Nav>
  )
}

const NavElement = variant => ({to, description, title}) => (
  <Link to={`/${to}`}>
    <ButtonWithTip
      variant={variant(to)}
      title={title}
      description={description}
      glyph={to}
    />
  </Link>
)

export const NavigationForm = ({page, user, logout, haveJobsApi}) => {
  const variant = whichPage => page === whichPage ? 'link' : 'light'
  const Target = NavElement(variant)
  const Span = ({children}) => <div style={{ marginLeft: '25px' }}>{children}</div>
  const links = getConfigurationValue('links')

  return (
    <>
      <Form inline>
        <Target to="dashboard" description="Zurück zum Dashboard" title="Dashboard"/>
        <Target to="queues" description="Zu den Queues" title="Queues"/>
        <Target to="messages" description="Zu den undelivered, rejected, expired Nachrichten" title="Nachrichten"/>
        {haveJobsApi && <Target to="jobs" description="Zu den Jobs (Resend...)" title="Jobs"/>}
        <Target to="statistics" description="Zu der Service-Statistik" title="Statistik"/>
        <Target to="checkalive" description="Zu der Übersicht Checkalive" title="Healthcheck"/>
        <Dropdown alignRight onToggle={(show, e) => {
          console.log(show)
          if (e.preventDefault) e.preventDefault()
        }}>
          <Dropdown.Toggle variant="light" id="dropdown-basic">
            ...
          </Dropdown.Toggle>
          <Dropdown.Menu>
            <Dropdown.Item as={Span}><Link to="/help">Hilfe</Link></Dropdown.Item>
            <Dropdown.Item as={Span}><Link to="/profile">Einstellungen</Link></Dropdown.Item>
            {links && (
              <>
                {Object.keys(links).map(key => (
                  <Dropdown.Item key={key} as={Span}><a href={links[key]} target="blank">{key}</a></Dropdown.Item>
                ))
                }
              </>
            )}
            {user && (
              <>
                <Dropdown.Divider/>
                <Dropdown.Item onClick={logout}>abmelden</Dropdown.Item>
              </>
            )}
          </Dropdown.Menu>
        </Dropdown>
      </Form>
    </>
  )
}

export default connect(
  state => ({
    user: state.user,
  }),
  dispatch => ({
    logout: () => dispatch(logout),
  }),
)(Navigation)
