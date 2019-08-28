import React from 'react'
import Container from 'react-bootstrap/Container'
import HeaderCheckalive from './components/HeaderCheckalive'
import BodyArea from './components/BodyArea'
import Log from './log'
import { Helmet } from 'react-helmet'

const log = Log('pagecheckalive')

const PageStatistics = () => {
  log.trace('Mount PageCheckalive')

  return (
    <>
      <Helmet>
        <title>Checkalive</title>
      </Helmet>
      <Container fluid>
        <HeaderCheckalive/>
        <BodyArea>
          Checkalive in Kürze
        </BodyArea>
      </Container>
    </>
  )
}

export default PageStatistics
