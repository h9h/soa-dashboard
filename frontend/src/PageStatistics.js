import React from 'react'
import Container from 'react-bootstrap/Container'
import HeaderStatistics from './components/HeaderStatistics'
import BodyArea from './components/BodyArea'
import Log from './log'
import InteractiveStatistics from './components/InteractiveStatistics'
import { Helmet } from 'react-helmet'

const log = Log('pagestatistics')

const PageStatistics = () => {
  log.trace('Mount PageStatistics2')

  return (
    <>
      <Helmet>
        <title>Statistik</title>
      </Helmet>
      <Container fluid>
        <HeaderStatistics/>
        <BodyArea>
          <InteractiveStatistics/>
        </BodyArea>
      </Container>
    </>
  )
}

export default PageStatistics
