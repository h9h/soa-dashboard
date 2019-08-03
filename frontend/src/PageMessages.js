import React from 'react'
import Container from 'react-bootstrap/Container'
import HeaderMessages from './components/HeaderMessages'
import BodyArea from './components/BodyArea'
import Log from './log'
import Messages from './components/Messages'
import { Helmet } from 'react-helmet'

const log = Log('pagemessages')

const PageMessages = () => {
  log.trace('Mount PageMessages')

  return (
    <>
      <Helmet>
        <title>Messages</title>
      </Helmet>
      <Container fluid>
        <HeaderMessages/>
        <BodyArea>
          <Messages/>
        </BodyArea>
      </Container>
    </>
  )
}

export default PageMessages
