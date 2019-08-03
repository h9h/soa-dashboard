import React, {useState, useEffect} from 'react'
import Nav from 'react-bootstrap/Nav'
import Form from 'react-bootstrap/Form'
import { Link } from 'react-router-dom'
import ButtonWithTip from './ButtonWithTip'
import Separator from './Separator'
import { connect } from 'react-redux'
import { logout } from '../logic/actions'
import { checkAliveFile } from '../logic/api/rest-api-local'
import Log from '../log'

const log = Log('navigation')

const Navigation = props => {
  const [haveJobsApi, setHaveJobsApi] = useState(false)

  useEffect(() => {
    checkAliveFile(props.user).then((have) => setHaveJobsApi(have))
  }, [props.user])

  log.trace('have Jobs-API', haveJobsApi)

  return (
    <Nav className="justify-content-end">
      <NavigationForm {...props} haveJobsApi={haveJobsApi} />
    </Nav>
  )
}

const NavElement = variant => ({ to, description, title}) => (
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

  return (
    <>
      <Form inline>
        <Target to="dashboard" description="Zurück zum Dashboard" title="Dashboard"/>
        <Target to="queues" description="Zu den Queues" title="Queues"/>
        <Target to="messages" description="Zu den undelivered, rejected, expired Nachrichten" title="Nachrichten"/>
        { haveJobsApi && <Target to="jobs" description="Zu den Jobs (Resend...)" title="Jobs"/> }
        <Target to="statistics" description="Zu der Service-Statistik" title="Statistik"/>
        <Separator/>
        <Target to="help" description="Hinweise zur Benutzung des Dashboards" title="Hilfe"/>
        <Target to="profile" description="Hier können Sie die Anwendung Ihren Wünschen anpasseen" title="Einstellungen"/>
        {user && (
          <>
            <Separator/>
            <ButtonWithTip
              title="Logout"
              description="Abmeldung vom ESB Dashboard"
              glyph="logout"
              handleClick={logout}
            />
          </>
        )}
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
