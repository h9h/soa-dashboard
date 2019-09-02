import Row from 'react-bootstrap/Row'
import Col from 'react-bootstrap/Col'
import { Centered } from '../styles'
import { renderPieChartMep, renderPieChartWelcherBus } from './pieCharts'
import { renderBarChartTiming} from './barCharts'
import React from 'react'
import { TIMINGS } from './utils'
import { SelectorCol } from './dcStyles'

const HeightSpace = ({children}) => <Col style={{height: '160', marginBottom: '15px', marginTop: '0px', marginLeft: '0px'}}>{children}</Col>

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
      <SelectorCol>
        {render(renderPieChartWelcherBus)}
      </SelectorCol>
    </Row>
    <Row>
      <SelectorCol>
        {render(renderPieChartMep)}
      </SelectorCol>
    </Row>
    <Row>
      <HeightSpace>
        {render(renderBarChartTiming(TIMINGS.GESAMT))}
      </HeightSpace>
    </Row>
    <Row>
      <HeightSpace>
        {render(renderBarChartTiming(TIMINGS.BUS))}
      </HeightSpace>
    </Row>
    <Row>
      <HeightSpace>
        {render(renderBarChartTiming(TIMINGS.PROVIDER))}
      </HeightSpace>
    </Row>
  </>
)

export default ChartsVerteilung
