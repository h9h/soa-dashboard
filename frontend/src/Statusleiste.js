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

const Statusleiste = (props) => {
  const version = process.env.REACT_APP_VERSION
  const repo = "https://github.com/h9h/soa-dashboard"
  const recipient = process.env.REACT_APP_FEEDBACK_MAIL
  const mail = `mailto://${recipient}?subject=Feedback zum ESB-Dashboard - v ${version}&body=`
  const copyright = process.env.REACT_APP_COPYRIGHT
  const jahr = moment().format('YYYY')

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
            SOA-Dashboard {jahr} v{version}  {`made with 💜 and ☕ by ${copyright}`}
          </Nav>
          <Nav className="justify-content-end">
            {rightToViewProps(props.user) ? (
              <Button onClick={doShow} variant="light">
                  <Icon glyph='dev' />
              </Button>
            ) : (
              <LinkButton href="https://facebook.github.io/create-react-app/" glyph="dev" />
            )}
            <LinkButton href={repo} glyph="github" />
            <LinkButton href={mail} text="Feedback" />
          </Nav>
        </Navbar.Collapse>
      </Navbar>
    </>
  )
}

export default connect(
  state => ({...state}),
)(Statusleiste)
