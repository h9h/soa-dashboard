import React, { useState } from 'react'
import Navbar from 'react-bootstrap/Navbar'
import Nav from 'react-bootstrap/Nav'
import ReactJson from 'react-json-view'
import { connect } from 'react-redux'
import moment from 'moment'
import ModalDialog from './components/ModalDialog'
import Button from 'react-bootstrap/Button'
import { Icon } from './components/icons'
import { rightToViewProps } from './logic/authorization'
import LinkButton from './components/LinkButton'
import Logo from './Logo'
import Tipp from './components/Tipp'

const Impressum = ({ version }) => {
  const copyright = process.env.REACT_APP_COPYRIGHT
  const jahr = moment().format('YYYY')
  return (
    <span style={{position: 'absolute', margin: '0', top: '30%'}}>
      SOA-Dashboard {jahr} v{version} {`made with 💜 and ☕ by ${copyright}`}
    </span>
  )
}

const LogoSmall = () => <Logo style={{height: '35px', paddingRight: '50px'}}/>

const Statusleiste = (props) => {
  const version = process.env.REACT_APP_VERSION
  const recipient = process.env.REACT_APP_FEEDBACK_MAIL
  const mail = `mailto://${recipient}?subject=Feedback zum ESB-Dashboard - v ${version}&body=`
  const repo = "https://github.com/h9h/soa-dashboard"
  const bug = "https://github.com/h9h/soa-dashboard/issues/new?template=bug_report.md&title=%5BBUG%5D"
  const feature = "https://github.com/h9h/soa-dashboard/issues/new?&template=feature_request.md&title=%5BFEATURE%5D"

  const [show, setShow] = useState(false)
  const doShow = () => setShow(true)
  const handleHide = () => setShow(false)

  return (
    <>
      {rightToViewProps(props.user) && (
        <ModalDialog show={show} onHide={handleHide} title="Admin Information">
          <ReactJson src={{props: {...props}, env: {...process.env}}} name={false}/>
        </ModalDialog>
      )}
      <Navbar bg="light" expand="lg" key="footer" fixed="bottom">
        <Navbar.Toggle aria-controls="basic-navbar-nav"/>
        <Navbar.Collapse id="basic-navbar-nav">
          <Nav className="mr-auto">
            <LogoSmall />
            <Nav.Item>
              <Impressum version={version} />
            </Nav.Item>
          </Nav>
          <Nav className="justify-content-end">
            {rightToViewProps(props.user) && (
              <Button onClick={doShow} variant="light">
                <Icon glyph='dev'/>
              </Button>
            )}
            <Tipp title="Github" content="Zu den Sourcen" placement="top">
              <LinkButton href={repo} glyph="github" />
            </Tipp>
            <Tipp title="Bug" content="Lege einen Bug-Report an" placement="top">
              <LinkButton href={bug} glyph="bug" />
            </Tipp>
            <Tipp title="Feature" content="Lege ein Feature-Request an" placement="top">
              <LinkButton href={feature} glyph="feature" />
            </Tipp>
            <Tipp title="Email" content="Sonstiges Feedback" placement="top">
              <LinkButton href={mail} text="Feedback" />
            </Tipp>
          </Nav>
        </Navbar.Collapse>
      </Navbar>
    </>
  )
}

export default connect(
  state => ({...state}),
)(Statusleiste)
