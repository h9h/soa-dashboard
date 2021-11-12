import React from 'react'
import Row from 'react-bootstrap/Row'
import Col from 'react-bootstrap/Col'
import * as PropTypes from 'prop-types'
import { renderRowChartServicesTopN } from './rowCharts'
import { renderPlot } from './dcUtils'
import { HighSelectorCol, SelectorCol, VeryHighSelectorCol } from './dcStyles'
import { renderBarChartDomain, renderBarChartTiming } from './barCharts'
import { TIMINGS } from './utils'
import { renderSunburstChart } from './sunburstChart'
import { renderPieChartMep, renderPieChartWelcherBus } from './pieCharts'
import { renderLineChartAnzahlCalls, renderLineChartTimingCalls } from './lineCharts'
import { Centered } from '../styles'
import { getConfigurationValue } from '../../logic/configuration'

export function AllgemeineStatistik (props) {
  const render = renderPlot(props.data, props.colorscheme)
  const N = parseInt(getConfigurationValue('statistics.nrOfCalls'), 10)
  const NFault = parseInt(getConfigurationValue('statistics.nrOfFaults'), 10)
  const NExpensive = parseInt(getConfigurationValue('statistics.nrOfExpensive'), 10)

  return <div style={{ width: props.width }}>
    <Row>
      <Col xs={12}>

      </Col>
    </Row>
    <Row>
      <Col xs={12} lg={4}>
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
      <Col xs={12} lg={4}>
        <Row>
          <Col xs={12} style={{height: (NFault * 25 + 50) + 'px'}}>
            <Centered>
              <h3>Faults - Top {NFault}</h3>
            </Centered>
            {render(renderRowChartServicesTopN('ANZAHLFAULT', NFault))}
          </Col>
          <Col xs={12} style={{height: (NExpensive * 25 + 120) + 'px'}}>
            <Centered>
              <br />
              <h3>Zeit-teuerste Calls - Top {NExpensive}</h3>
            </Centered>
            {render(renderRowChartServicesTopN('ContributionGesamtZeit', NExpensive))}
          </Col>
          <Col xs={12} style={{height: (N * 25 + 120) + 'px'}}>
            <Centered>
              <br />
              <h3>Gesamtanzahl Calls - Top {N}</h3>
            </Centered>
            {render(renderRowChartServicesTopN('ANZAHLGESAMT', N))}
          </Col>
        </Row>
      </Col>
      <Col xs={12} lg={4}>
        <Row>
          <Col xs={12}>
            <Centered>
              <h3>Domänen</h3>
            </Centered>
          </Col>
          <HighSelectorCol xs={12}>
            {render(renderBarChartDomain)}
          </HighSelectorCol>
          <VeryHighSelectorCol>
            {render(renderSunburstChart)}
          </VeryHighSelectorCol>
        </Row>
      </Col>
    </Row>
  </div>
}

AllgemeineStatistik.propTypes = {
  data: PropTypes.shape({status: PropTypes.string}),
  colorscheme: PropTypes.any
}
