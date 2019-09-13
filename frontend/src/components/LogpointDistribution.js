import React from 'react'
import moment from 'moment'
import Row from 'react-bootstrap/Row'
import Col from 'react-bootstrap/Col'
import crossfilter from 'crossfilter2'
import DataContext from './dc/DataContext'
import { renderBarChartLogpoints } from './dc/barCharts'
import { withNotification } from '../logic/notification'
import { getConfigurationValue } from '../logic/configuration'
import ButtonWithTip from './ButtonWithTip'
import Form from 'react-bootstrap/Form'
import Blank from './Blank'

const LogpointDistribution = React.memo(({isEmpty, statistik, setBis}) => {
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

  const minDate = moment(dimensions.time.bottom(1)[0].time, 'YYYY-MM-DDTHH:mm:ss')
  const maxDate = moment(dimensions.time.top(1)[0].time, 'YYYY-MM-DDTHH:mm:ss')
  const diffToNow = moment().diff(maxDate, 'minutes')

  const setFilterBis = (duration) => () => {
    const bis = (duration === 0 ? moment(minDate) : moment(duration < 0 ? minDate : maxDate).add(duration, 'minutes')).format('HH:mm:ss')
    doSetBis(bis)
  }

  return (
    <Row style={{ paddingBottom: '5px' }}>
      <Col xs={1} style={{ backgroundColor: '#f8f9fa' }}>
        <Row>
          <Col>
            Logpunkte
          </Col>
        </Row>
        <Row>
          <Col xs={3}>
            von:
          </Col>
          <Col xs={9}>
            {minDate.format('HH:mm:ss')}
          </Col>
        </Row>
        <Row>
          <Col xs={3}>
            bis:
          </Col>
          <Col xs={9}>
            {maxDate.format('HH:mm:ss')}
          </Col>
        </Row>
        <Row>
          <Col>
            <Form inline>
              <ButtonWithTip
                title='Zurück 1h'
                description='gehe eine Stunde zurück'
                glyph='fast-backwards'
                variant="light"
                size="sm"
                handleClick={setFilterBis(-60)}
              />
              <Blank/>
              <ButtonWithTip
                title='Zurück'
                description='gehe zurück in der Zeit (vor "von")'
                glyph='backwards'
                variant="light"
                size="sm"
                handleClick={setFilterBis(0)}
              />
              <Blank/>
              <Blank/>
              <ButtonWithTip
                title='Vorwärts'
                description='gehe vor in der Zeit (nach "bis")'
                glyph='forwards'
                variant="light"
                size="sm"
                disabled={diffToNow < 2}
                handleClick={setFilterBis(1)}
              />
              <Blank/>
              <ButtonWithTip
                title='Vorwärts 1h'
                description='gehe eine Stunde vor'
                glyph='fast-forwards'
                variant="light"
                size="sm"
                disabled={diffToNow < 60}
                handleClick={setFilterBis(60)}
              />
            </Form>
          </Col>
        </Row>
      </Col>
      <Col xs={11} style={{height: `${barchartHeight}px`}}>
        <DataContext dimensions={dimensions} renderChart={renderBarChartLogpoints} setBis={doSetBis}/>
      </Col>
    </Row>
  )
})

LogpointDistribution.whyDidYouRender = true
export default LogpointDistribution
