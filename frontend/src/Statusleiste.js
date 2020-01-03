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
import {LogoUnsized} from './Logo'
import Tipp from './components/Tipp'
import Form from 'react-bootstrap/Form'
import FormControl from 'react-bootstrap/FormControl'
import useWindowSize from './components/useWindowSize'

const Impressum = ({version, width}) => {
  if (width < 1600) {
    return (
      <span style={{position: 'absolute', margin: '0', top: '30%'}}>
      v{version}
    </span>
    )
  }

  const copyright = process.env.REACT_APP_COPYRIGHT
  const jahr = moment().format('YYYY')

  return (
    <span style={{position: 'absolute', margin: '0', top: '30%'}}>
      SOA-Dashboard {jahr} v{version} {copyright}
    </span>
  )
}

const LogoSmall = () => <LogoUnsized style={{height: '35px', paddingRight: '50px'}}/>

const Statusleiste = (props) => {
  const {width} = useWindowSize()
  const version = process.env.REACT_APP_VERSION
  const recipient = process.env.REACT_APP_FEEDBACK_MAIL
  const mail = `mailto:${recipient}?subject=Feedback zum ESB-Dashboard - v ${version}&body=`
  const repo = 'https://github.com/h9h/soa-dashboard'
  const bug = 'https://github.com/h9h/soa-dashboard/issues/new?template=bug_report.md&title=%5BBUG%5D'
  const feature = 'https://github.com/h9h/soa-dashboard/issues/new?&template=feature_request.md&title=%5BFEATURE%5D'

  const [show, setShow] = useState(false)
  const doShow = () => setShow(true)
  const handleHide = () => setShow(false)

  const infoItems = props.infos.slice(0,10).map((info, i) => <option key={i}>{info.length > 100 ? `...${info.substring(info.length - 100)}` : info}</option>)

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
            <LogoSmall/>
            <Nav.Item>
              <Impressum version={version} width={width}/>
            </Nav.Item>
          </Nav>
          <Form inline>
            <FormControl className="smallfont" as="select" value={props.infos[0]} readOnly>
              {infoItems}
            </FormControl>
          </Form>
          <Nav className="justify-content-end">
            {rightToViewProps(props.user) && (
              <Form inline>
                <Button onClick={doShow} variant="light">
                  <Icon glyph='dev'/>
                </Button>
              </Form>
            )}
            <Tipp title="Github" content="Zu den Sourcen" placement="top">
              <LinkButton href={repo} glyph="github"/>
            </Tipp>
            <Tipp title="Bug" content="Lege einen Bug-Report an" placement="top">
              <LinkButton href={bug} glyph="bug"/>
            </Tipp>
            <Tipp title="Feature" content="Lege ein Feature-Request an" placement="top">
              <LinkButton href={feature} glyph="feature"/>
            </Tipp>
            <Tipp title="Email" content="Sonstiges Feedback" placement="top">
              <LinkButton href={mail} text="Feedback"/>
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
