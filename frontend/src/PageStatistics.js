import React from 'react'
import Container from 'react-bootstrap/Container'
import HeaderStatistics from './components/HeaderStatistics'
import BodyArea from './components/BodyArea'
import Log from './log'
import InteractiveStatistics, { UnconnectedInteractiveStatistics } from './components/InteractiveStatistics'
import { Helmet } from 'react-helmet'
import useWindowSize from './components/useWindowSize'
import moment from 'moment'
import HeaderStandalone from './components/HeaderStandalone'

const log = Log('pagestatistics')

const formatDatum = d => moment(d, 'YYYY-MM-DD').format('DD.MM.YYYY')

const PageStatistics = (props) => {
  log.trace('Mount PageStatistics')
  const { width } = useWindowSize()

  if (props && props.match && props.match.params) {
    let {match: {params: { umgebung, datumVon, datumBis }}} = props
    if (window.location.href.endsWith('/aktuell')) {
      datumVon = moment().subtract(1, 'days').format('YYYY-MM-DD')
      datumBis = datumVon
    }

    if (umgebung) {
      log.trace('...mit Parametern', umgebung, datumVon, datumBis)

      const title = <div>
        Statistik auf {umgebung} vom {formatDatum(datumVon)}{datumVon !== datumBis && <span> bis {formatDatum(datumBis)}</span>}
      </div>

      return (
        <>
          <Helmet>
            <title>Statistik {umgebung}</title>
          </Helmet>
          <Container fluid>
            <HeaderStandalone title={title}/>
            <BodyArea>
              <UnconnectedInteractiveStatistics umgebung={umgebung} datumVon={datumVon} datumBis={datumBis} width={width}/>
            </BodyArea>
          </Container>
        </>
      )
    }
  }

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
