import React, { useMemo } from 'react'
import Row from 'react-bootstrap/Row'
import Col from 'react-bootstrap/Col'
import * as PropTypes from 'prop-types'
import { Centered } from '../styles'
import { renderChartBrush, renderLineChartAnzahlCalls, renderLineChartTimingCalls, } from './lineCharts'
import { renderPlot } from './dcUtils'
import { renderSunburstChart } from './sunburstChart'
import { renderRowChartListServices } from './rowCharts'
import { renderBarChartDomain } from './barCharts'
import { BrushCol, Listing, MainCol, SelectorCol, HighSelectorCol } from './dcStyles'
import ChartsVerteilung from './ChartsVerteilung'

export function AufrufStatistik (props) {
  const render = useMemo(() => renderPlot(props.data, props.colorscheme), [props.data, props.colorscheme])

  const brush = render(renderChartBrush())
  const lineAnzahl = render(renderLineChartAnzahlCalls)
  const lineTiming = render(renderLineChartTimingCalls)
  const rowService = render(renderRowChartListServices)

  const sunDomain = render(renderSunburstChart)
  const barDomain = render(renderBarChartDomain)

  return <div style={{ width: props.width }}>
    <Row>
      <Col xs={12} lg={9}>
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
      <Col xs={12} lg={3}>
        <Row>
          <Col>
            <Centered>
              <h3>Domänen</h3>
            </Centered>
          </Col>
        </Row>
        <Row>
          <SelectorCol>
            {barDomain}
          </SelectorCol>
        </Row>
        <Row>
          <HighSelectorCol>
            {sunDomain}
          </HighSelectorCol>
        </Row>
        <ChartsVerteilung render={render}/>
      </Col>
    </Row>
  </div>
}

AufrufStatistik.propTypes = {
  data: PropTypes.shape({status: PropTypes.string}),
  colorscheme: PropTypes.any
}
