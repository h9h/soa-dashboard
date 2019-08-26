import React from 'react'
import moment from 'moment'
import Row from 'react-bootstrap/Row'
import Col from 'react-bootstrap/Col'
import crossfilter from 'crossfilter2'
import DataContext from './dc/DataContext'
import { renderBarChartLogpoints } from './dc/barCharts'
import { withNotification } from '../logic/notification'
import { getConfigurationValue } from '../logic/configuration'

const LogpointDistribution = React.memo(({ isEmpty, statistik, setBis }) => {
  if (isEmpty) return null

  const barchartHeight = parseInt(getConfigurationValue('presentation.distribution.heightInPx'), 10)
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
