import React from 'react'
import Container from 'react-bootstrap/Container'
import queryString from 'query-string'
import BodyArea from './components/BodyArea'
import Log from './log'
import Queuetables from './components/Queuetables'
import { Helmet } from 'react-helmet'

const log = Log('pagequeues')

const PageQueuetables = (props) => {
  const {match: {params: {umgebung, database, queuetable}}} = props
  const values = queryString.parse(props.location.search)
  const queue = values && values.queue ? values.queue : null
  log.trace('Mount PageQueuetables', umgebung, database, queuetable, queue)

  return (
    <>
      <Helmet>
        <title>SAO-D-Q-Table</title>
      </Helmet>
      <Container fluid>
        <BodyArea>
          <Queuetables umgebung={umgebung} database={database} queuetable={queuetable} queue={queue}/>
        </BodyArea>
      </Container>
    </>
  )
}

export default PageQueuetables
