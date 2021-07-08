import React, { useState, useEffect } from 'react'
import Container from 'react-bootstrap/Container'
import HeaderStatistics from './components/HeaderStatistics'
import BodyArea from './components/BodyArea'
import Log from './log'
import InteractiveStatistics from './components/InteractiveStatistics'
import { Helmet } from 'react-helmet'
import useWindowSize from './components/useWindowSize'
import moment from 'moment'
import HeaderStandalone from './components/HeaderStandalone'
import { connect } from 'react-redux'
import { getStatisticsData } from './logic/api/rest-api-statistics'

const log = Log('pagestatistics')

const formatDatum = d => moment(d, 'YYYY-MM-DD').format('DD.MM.YYYY')

const PageStatistics = (props) => {
  if (props && props.match && props.match.params) {
    let {match: {params: { umgebung, datumVon, datumBis }}} = props
    if (window.location.href.endsWith('/aktuell')) {
      datumVon = moment().subtract(1, 'days').format('YYYY-MM-DD')
      datumBis = datumVon
    }
    if (datumVon && !datumBis) {
      datumBis = datumVon
    }

    if (umgebung) {
      log.trace('...mit Parametern', umgebung, datumVon, datumBis)

      const title = <div>
        Statistik auf {umgebung} vom {formatDatum(datumVon)}{datumVon !== datumBis && <span> bis {formatDatum(datumBis)}</span>}
      </div>

      return (
        <InnerPageStatistics
          header={() => <HeaderStandalone title={title}/>}
          umgebung={umgebung}
          datumVon={datumVon}
          datumBis={datumBis}
          statisticFlags={[]}
        />
      )
    }
  }

  const ConnectedInnerPageStatistics = connect(
    state => ({
      umgebung: state.umgebung,
      datumVon: state.datumStatVon,
      datumBis: state.datumStatBis,
      view: state.view,
      colorScheme: state.colorScheme,
      statisticFlags: state.statisticFlags,
    })
  )(InnerPageStatistics)


  return (
    <ConnectedInnerPageStatistics header={handleClick => <HeaderStatistics onClickExportCsv={handleClick} />}/>
  )
}

const InnerPageStatistics = (props) => {
  log.trace('Mount InnerPageStatistics')
  const { umgebung, datumVon, datumBis, statisticFlags, view = 'default', colorScheme = 'Tableau10' } = props
  const { width } = useWindowSize()

  const [data, setData] = useState({status: 'loading'})

  useEffect(() => {
    setData({status: 'loading'})
    // hole daten
    const getData = async () => {
      const { cf, dims } = await getStatisticsData(umgebung, datumVon, datumBis, statisticFlags)
      setData({ status: 'ready', cf, dims, datumVon, datumBis })
    }
    getData()
  }, [umgebung, datumVon, datumBis, statisticFlags])

  const handleClickExportCsv = () => {
    alert('exportCsv geclickt ' + data.status)
  }

  return (
    <>
      <Helmet>
        <title>Statistik {umgebung}</title>
      </Helmet>
      <Container fluid>
        {props.header(handleClickExportCsv)}
        <BodyArea>
          <InteractiveStatistics
            data={data}
            datumVon={datumVon}
            datumBis={datumBis}
            width={width}
            view={view}
            colorScheme={colorScheme}/>
        </BodyArea>
      </Container>
    </>
  )
}

export default PageStatistics
