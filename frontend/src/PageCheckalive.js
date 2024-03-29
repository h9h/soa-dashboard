import React from 'react'
import Container from 'react-bootstrap/Container'
import HeaderCheckalive from './components/HeaderCheckalive'
import BodyArea from './components/BodyArea'
import Log from './log'
import { Helmet } from 'react-helmet'
import HeaderStandalone from './components/HeaderStandalone'
import CheckaliveRuns, { UnconnectedCheckaliveRuns } from './components/checkalive/CheckaliveRuns'
import { useParams } from 'react-router-dom'

const log = Log('pagecheckalive')

const PageCheckalive = (props) => {
  log.trace('Mount PageCheckalive')

  let header
  let body

  const {umgebung} = useParams()

  if (umgebung) {
    log.trace('...mit Parametern', umgebung)
    const title = <div>Checkalive-Runs auf {umgebung}</div>
    header = <HeaderStandalone title={title}/>
    body = <UnconnectedCheckaliveRuns umgebung={umgebung} />
  } else {
    header = <HeaderCheckalive/>
    body = <CheckaliveRuns/>
  }

  return (
    <>
      <Helmet>
        <title>Checkalive</title>
      </Helmet>
      <Container fluid>
        {header}
        <BodyArea>
          {body}
        </BodyArea>
      </Container>
    </>
  )
}

export default PageCheckalive
