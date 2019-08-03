import React from 'react'
import Container from 'react-bootstrap/Container'
import HeaderQueues from './components/HeaderQueues'
import BodyArea from './components/BodyArea'
import Log from './log'
import Queues from './components/Queues'
import { Helmet } from 'react-helmet'

const log = Log('pagequeues')

const PageQueues = () => {
  log.trace('Mount PageQueues')

  return (
    <>
      <Helmet>
        <title>Queues</title>
      </Helmet>
      <Container fluid>
        <HeaderQueues/>
        <BodyArea>
          <Queues/>
        </BodyArea>
      </Container>
    </>
  )
}

export default PageQueues
