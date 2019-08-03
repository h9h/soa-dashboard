import React from 'react'
import moment from 'moment'
import Row from 'react-bootstrap/Row'
import Col from 'react-bootstrap/Col'
import { getConfiguration } from '../configuration'
import crossfilter from 'crossfilter2'
import DataContext from './dc/DataContext'
import { renderBarChartLogpoints } from './dc/barCharts'
import { withNotification } from '../logic/notification'

const LogpointDistribution = React.memo(({ statistik, setBis }) => {
  const configuration = getConfiguration()
  const barchartHeight = parseInt(configuration.presentation.distribution.heightInPx, 10)
  if (barchartHeight < 20) return null

  const ndx = crossfilter(statistik)
  const dimensions = {
    time: ndx.dimension(d => moment(d.time, 'YYYY-MM-DDTHH:mm:ss').toDate()),
  }

  const doSetBis = (bis) => {
    if (!bis) return

    withNotification({
      nachricht: `Logpunkte bis ${bis} werden selektiert`,
      fn: () => setBis(bis),
    })
  }

  return (
    <Row>
      <Col style={{ height: `${barchartHeight}px` }}>
        <DataContext dimensions={dimensions} renderChart={renderBarChartLogpoints} setBis={doSetBis}/>
      </Col>
    </Row>
  )
})

LogpointDistribution.whyDidYouRender = true
export default LogpointDistribution
