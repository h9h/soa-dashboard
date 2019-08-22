import React from 'react'
import Container from 'react-bootstrap/Container'
import queryString from 'query-string'
import BodyArea from './components/BodyArea'
import Log from './log'
import QueuedMessages from './components/QueuedMessages'
import { Helmet } from 'react-helmet'
import HeaderQueueMessages from './components/HeaderQueueMessages'

const log = Log('pagequeuedmessages')

const PageQueuedMessages = (props) => {
  const {match: {params: {umgebung, database, queuetable}}} = props
  const queryParams = queryString.parse(props.location.search)
  const queue = queryParams && queryParams.queue ? queryParams.queue : null
  log.trace('Mount PageQueuedMessages', { umgebung, database, queuetable, queue, queryParams })

  return (
    <>
      <Helmet>
        <title>Queue-Nachrichten</title>
      </Helmet>
      <Container fluid>
        <HeaderQueueMessages/>
        <BodyArea>
          <QueuedMessages umgebung={umgebung} database={database} queuetable={queuetable} queue={queue}/>
        </BodyArea>
      </Container>
    </>
  )
}

export default PageQueuedMessages
