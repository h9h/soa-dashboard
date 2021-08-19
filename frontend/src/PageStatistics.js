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

const StaticPageStatistics = (props) => {
  const [view, setView] = useState('default')

  let {match: {params: { umgebung, datumVon, datumBis }}} = props
  if (window.location.href.endsWith('/aktuell')) {
    // Wenn Montag gehe auf Freitag zurück, sonst Vortag
    const today = moment()
    const goBackDays = today.day() === 1 ? 3 : 1
    datumVon = moment().subtract(goBackDays, 'days').format('YYYY-MM-DD')
    datumBis = datumVon
  }
  if (datumVon && !datumBis) {
    datumBis = datumVon
  }

  log.trace('...mit Parametern', umgebung, datumVon, datumBis)

  const title = <div>
    Statistik auf {umgebung} vom {formatDatum(datumVon)}{datumVon !== datumBis &&
  <span> bis {formatDatum(datumBis)}</span>}
  </div>

  return (
    <InnerPageStatistics
      header={() => <HeaderStandalone title={title} view={view} setView={setView}/>}
      umgebung={umgebung}
      datumVon={datumVon}
      datumBis={datumBis}
      statisticFlags={[]}
      view={view}
    />
  )
}

const PageStatistics = (props) => {
  if (props && props.match && props.match.params && props.match.params.umgebung) {
    return <StaticPageStatistics {...props} />
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
    <ConnectedInnerPageStatistics />
  )
}

const InnerPageStatistics = (props) => {
  log.trace('Mount InnerPageStatistics')
  const { header, umgebung, datumVon, datumBis, statisticFlags, view = 'default', colorScheme = 'Tableau10' } = props
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

  const HeaderElement = header || (() => <HeaderStatistics />)

  return (
    <>
      <Helmet>
        <title>Statistik {umgebung}</title>
      </Helmet>
      <Container fluid>
        <HeaderElement />
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
