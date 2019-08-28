import React from 'react'
import Container from 'react-bootstrap/Container'
import HeaderStatistics from './components/HeaderStatistics'
import BodyArea from './components/BodyArea'
import Log from './log'
import InteractiveStatistics from './components/InteractiveStatistics'
import { Helmet } from 'react-helmet'
import useWindowSize from './components/useWindowSize'

const log = Log('pagestatistics')

const PageStatistics = () => {
  log.trace('Mount PageStatistics')
  const { width } = useWindowSize()

  return (
    <>
      <Helmet>
        <title>Statistik</title>
      </Helmet>
      <Container fluid>
        <HeaderStatistics/>
        <BodyArea>
          <InteractiveStatistics width={width}/>
        </BodyArea>
      </Container>
    </>
  )
}

export default PageStatistics
