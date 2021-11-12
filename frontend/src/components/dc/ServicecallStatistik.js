import React from 'react'
import Row from 'react-bootstrap/Row'
import Col from 'react-bootstrap/Col'
import * as PropTypes from 'prop-types'
import {
  renderChartBrush,
  renderLineChartAnzahlCalls,
  renderLineChartTimingCalls,
} from './lineCharts'
import { renderPlot } from './dcUtils'
import { renderRowChartListServices } from './rowCharts'
import ChartsVerteilung from './ChartsVerteilung'
import { BrushCol, MainCol, Listing } from './dcStyles'

export function ServicecallStatistik (props) {
  const render = renderPlot(props.data, props.colorscheme)

  return <div style={{ width: props.width }}>
    <Row>
      <Col xs={12} lg={9}>
        <Row>
          <BrushCol>
              {render(renderChartBrush())}
          </BrushCol>
        </Row>
        <Row>
          <Col>
            <h3>Servicecalls - Aufrufzahlen im Zeitverlauf</h3>
            <MainCol>
              {render(renderLineChartAnzahlCalls)}
            </MainCol>
          </Col>
        </Row>
        <Row>
          <Col>
            <h3>Servicecalls - Timing im Zeitverlauf</h3>
            <MainCol>
              {render(renderLineChartTimingCalls)}
            </MainCol>
          </Col>
        </Row>
      </Col>
      <Col xs={12} lg={3}>
        <ChartsVerteilung render={render}/>
      </Col>
    </Row>
    <Row>
      <Col xs={6}>
        <Row>
          <Listing>
            <h1>Teuerste Servicecalls (Zeit x Anzahl)</h1>
            {render(renderRowChartListServices('ContributionGesamtZeit'))}
          </Listing>
        </Row>
      </Col>
      <Col xs={6}>
        <Row>
          <Listing>
            <h1>Alle Servicecalls nach Aufrufzahlen</h1>
            {render(renderRowChartListServices('ANZAHLGESAMT'))}
          </Listing>
        </Row>
      </Col>
    </Row>
  </div>
}

ServicecallStatistik.propTypes = {
  data: PropTypes.shape({status: PropTypes.string}),
  colorscheme: PropTypes.any
}
