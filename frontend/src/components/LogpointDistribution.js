import React, { useState, useEffect } from 'react'
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
import useWindowSize from './useWindowSize'

const PlayButton = ({title, description, glyph, setFilter, newTime}) => {
  const [disabled, setDisabled] = useState(true)

  useEffect(() => {
    let interval = setInterval(() => {
      const now = moment()
      if (now.valueOf() > newTime.valueOf()) {
        clearInterval(interval)
        interval = null
        setDisabled(false)
      }
    }, 1000)
    return () => interval && clearInterval(interval)
  }, [newTime, setFilter])

  return <ButtonWithTip
    title={title}
    description={description}
    glyph={glyph}
    variant="light"
    size="sm"
    disabled={disabled}
    handleClick={() => setFilter(newTime.format('HH:mm:ss'))}
  />
}

const LogpointDistribution = React.memo(({isEmpty, statistik, setBis}) => {
  const { width } = useWindowSize()
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
  const {anzahl, unit} = getConfigurationValue('time.duration')
  const timeFastBackwards = moment(minDate).subtract(anzahl, unit)
  const timeBackwards = moment(minDate)
  const timeForwards = moment(maxDate).add(maxDate.diff(minDate, 'seconds'), 'seconds')
  const timeFastForwards = moment(maxDate).add(anzahl, unit)

  const nrColsControls = width < 1400 ? 2 : 1

  return (
    <Row style={{marginTop: '0', marginLeft: '0', paddingBottom: "5px" }}>
      <Col xs={nrColsControls} style={{border: '1px solid black', padding: '2px 5px 0px 5px'}}>
        <Row>
          <Col style={{
            textAlign: 'center',
            paddingBottom: '5px',
            paddingTop: '5px',
            backgroundColor: '#f8f9fa',
            margin: '0 10px 0 11px',
            fontWeight: "bolder"
          }}>
            Range(Logs)
          </Col>
        </Row>
        <Row style={{ paddingTop: "5px" }}>
          <Col xs={4}>
            Von:
          </Col>
          <Col xs={8}>
            {minDate.format('HH:mm:ss')}
          </Col>
        </Row>
        <Row style={{paddingBottom: '5px'}}>
          <Col xs={4}>
            Bis:
          </Col>
          <Col xs={8}>
            {maxDate.format('HH:mm:ss')}
          </Col>
        </Row>
        <Row style={{ marginBottom: "0" }}>
          <Col style={{
            backgroundColor: '#f8f9fa',
            margin: '0 10px 0 11px',
            padding: "0"
          }}>
            <Form className='d-flex'>
              <PlayButton
                title='Zurück 10m'
                description={`gehe zu ${timeFastBackwards.format('HH:mm:ss')}`}
                glyph='fast-backwards'
                setFilter={doSetBis}
                newTime={timeFastBackwards}
              />
              <PlayButton
                title='Zurück'
                description='schiebe Intervall zurück'
                glyph='backwards'
                setFilter={doSetBis}
                newTime={timeBackwards}
              />
              <PlayButton
                title='Vorwärts'
                description='schiebe Intervall vor'
                glyph='forwards'
                setFilter={doSetBis}
                newTime={timeForwards}
              />
              <PlayButton
                title='Vorwärts 10m'
                description={`gehe zu ${timeFastForwards.format('HH:mm:ss')}`}
                glyph='fast-forwards'
                setFilter={doSetBis}
                newTime={timeFastForwards}
              />
            </Form>
          </Col>
        </Row>
      </Col>
      <Col xs={12 - nrColsControls} style={{height: `${barchartHeight}px`}}>
        <DataContext dimensions={dimensions} renderChart={renderBarChartLogpoints} setBis={doSetBis}/>
      </Col>
    </Row>
  )
})

LogpointDistribution.whyDidYouRender = true
export default LogpointDistribution
