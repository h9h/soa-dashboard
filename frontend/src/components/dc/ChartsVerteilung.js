import Row from 'react-bootstrap/Row'
import Col from 'react-bootstrap/Col'
import { Centered } from '../styles'
import { renderPieChartMep, renderPieChartWelcherBus } from './pieCharts'
import { renderBarChartTiming} from './barCharts'
import React from 'react'
import { TIMINGS } from './utils'

const Pie = ({children}) => <Col style={{height: '200px', marginBottom: '10px', marginTop: '10px', marginLeft: '0px'}}>{children}</Col>

const ChartsVerteilung = ({render}) => (
  <>
    <Row>
      <Col>
        <Centered>
          <h3>Verteilungen</h3>
        </Centered>
      </Col>
    </Row>
    <Row>
      <Pie>
        {render(renderPieChartWelcherBus)}
      </Pie>
    </Row>
    <Row>
      <Pie>
        {render(renderPieChartMep)}
      </Pie>
    </Row>
    <Row>
      <Pie>
        {render(renderBarChartTiming(TIMINGS.GESAMT))}
      </Pie>
    </Row>
    <Row>
      <Pie>
        {render(renderBarChartTiming(TIMINGS.BUS))}
      </Pie>
    </Row>
  </>
)

export default ChartsVerteilung
