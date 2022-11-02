import React from 'react'
import Container from 'react-bootstrap/Container'
import BodyArea from './components/BodyArea'
import Log from './log'
import QueuedMessages from './components/QueuedMessages'
import { Helmet } from 'react-helmet'
import HeaderQueueMessages from './components/HeaderQueueMessages'
import { useParams, useSearchParams } from 'react-router-dom'

const log = Log('pagequeuedmessages')

const PageQueuedMessages = (props) => {
  const {umgebung, database, queuetable} = useParams()
  const [searchParams] = useSearchParams()

  const queryParams = Object.fromEntries([...searchParams])
  const queue = queryParams && queryParams.queue ? queryParams.queue : null
  log.info('Mount PageQueuedMessages', { umgebung, database, queuetable, queue, queryParams })

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
