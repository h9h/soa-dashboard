import React from 'react'
import Row from 'react-bootstrap/Row'
import Col from 'react-bootstrap/Col'
import * as PropTypes from 'prop-types'
import { renderRowChartFaultsTopN, renderRowChartServicesTopN } from './rowCharts'
import { renderPlot } from './dcUtils'
import { SelectorCol, VeryHighSelectorCol } from './dcStyles'
import { renderBarChartDomain, renderBarChartTiming } from './barCharts'
import { TIMINGS } from './utils'
import { renderSunburstChart } from './sunburstChart'
import { renderPieChartDomain, renderPieChartMep, renderPieChartWelcherBus } from './pieCharts'
import { renderLineChartAnzahlCalls, renderLineChartTimingCalls } from './lineCharts'
import { Centered } from '../styles'

const N = 50
const NFault = 10

export function AllgemeineStatistik (props) {
  const render = renderPlot(props.data, props.colorscheme)

  return <>
    <Row>
      <Col xs={4}>
        <Centered>
          <h3>Verteilung</h3>
        </Centered>
        <Row>
          <SelectorCol xs={12}>
            {render(renderLineChartAnzahlCalls)}
          </SelectorCol>
          <SelectorCol xs={12}>
            {render(renderLineChartTimingCalls)}
          </SelectorCol>
          <SelectorCol xs={12} style={{ marginLeft: '45px'}}>
            {render(renderBarChartTiming(TIMINGS.GESAMT))}
          </SelectorCol>
          <SelectorCol xs={12} style={{ marginLeft: '45px'}}>
            {render(renderBarChartTiming(TIMINGS.BUS))}
          </SelectorCol>
          <SelectorCol xs={6}>
            {render(renderPieChartMep)}
          </SelectorCol>
          <SelectorCol xs={6}>
            {render(renderPieChartWelcherBus)}
          </SelectorCol>
        </Row>
      </Col>
      <Col xs={4}>
        <Row>
          <Col xs={12} style={{height: '350px'}}>
            <Centered>
              <h3>Faults - Top {NFault}</h3>
            </Centered>
            {render(renderRowChartFaultsTopN(NFault))}
          </Col>
          <Col xs={12} style={{height: '750px'}}>
            <Centered>
              <br />
              <h3>Gesamtanzahl Calls - Top {N}</h3>
            </Centered>
            {render(renderRowChartServicesTopN(N))}
          </Col>
        </Row>
      </Col>
      <Col xs={4}>
        <Row>
          <Col xs={12}>
            <Centered>
              <h3>Domänen</h3>
            </Centered>
          </Col>
          <SelectorCol xs={12}>
            {render(renderPieChartDomain)}
          </SelectorCol>
          <VeryHighSelectorCol>
            {render(renderSunburstChart)}
          </VeryHighSelectorCol>
          <SelectorCol xs={12}>
            {render(renderBarChartDomain)}
          </SelectorCol>
        </Row>
      </Col>
    </Row>
  </>
}

AllgemeineStatistik.propTypes = {
  data: PropTypes.shape({status: PropTypes.string}),
  colorscheme: PropTypes.any
}
