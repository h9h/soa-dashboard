import React, { useMemo } from 'react'
import Row from 'react-bootstrap/Row'
import Col from 'react-bootstrap/Col'
import * as PropTypes from 'prop-types'
import { Centered } from '../styles'
import { renderChartBrush, renderLineChartAnzahlCalls, renderLineChartTimingCalls, } from './lineCharts'
import { renderPlot } from './dcUtils'
import { renderPieChartDomain } from './pieCharts'
import { renderSunburstChart } from './sunburstChart'
import { renderRowChartListServices } from './rowCharts'
import { renderBarChartTiming } from './barCharts'
import { TIMINGS } from './utils'
import { BrushCol, Listing, MainCol, SelectorCol, HighSelectorCol } from './dcStyles'

export function AufrufStatistik (props) {
  const render = useMemo(() => renderPlot(props.data, props.colorscheme), [props.data, props.colorscheme])

  const brush = useMemo(() => render(renderChartBrush()), [render])
  const lineAnzahl = useMemo(() => render(renderLineChartAnzahlCalls), [render])
  const lineTiming = useMemo(() => render(renderLineChartTimingCalls), [render])
  const rowService = useMemo(() => render(renderRowChartListServices), [render])

  const pieDomain = useMemo(() => render(renderPieChartDomain), [render])
  const sunDomain = useMemo(() => render(renderSunburstChart), [render])
  const histGesamt = useMemo(() => render(renderBarChartTiming(TIMINGS.GESAMT)), [render])
  const histBus = useMemo(() => render(renderBarChartTiming(TIMINGS.BUS)), [render])

  return <>
    <Row>
      <Col xs={9}>
        <Row>
          <BrushCol>
            {brush}
          </BrushCol>
        </Row>
        <Row>
          <Col>
            <h3>Servicecalls - Aufrufzahlen im Zeitverlauf</h3>
            <MainCol>
              {lineAnzahl}
            </MainCol>
          </Col>
        </Row>
        <Row>
          <Col>
            <h3>Servicecalls - Timing im Zeitverlauf</h3>
            <MainCol>
              {lineTiming}
            </MainCol>
          </Col>
        </Row>
        <Row>
          <Listing>
            {rowService}
          </Listing>
        </Row>
      </Col>
      <Col xs={3}>
        <Row>
          <Col>
            <Centered>
              <h3>Domänen</h3>
            </Centered>
          </Col>
        </Row>
        <Row>
          <SelectorCol>
            {pieDomain}
          </SelectorCol>
        </Row>
        <Row>
          <HighSelectorCol>
            {sunDomain}
          </HighSelectorCol>
        </Row>
        <Row>
          <SelectorCol>
            {histGesamt}
          </SelectorCol>
        </Row>
        <Row>
          <SelectorCol>
            {histBus}
          </SelectorCol>
        </Row>
      </Col>
    </Row>
  </>
}

AufrufStatistik.propTypes = {
  data: PropTypes.shape({status: PropTypes.string}),
  colorscheme: PropTypes.any
}
