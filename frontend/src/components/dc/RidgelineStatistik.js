import React, { useState, useMemo } from 'react'
import Form from 'react-bootstrap/Form'
import Row from 'react-bootstrap/Row'
import Col from 'react-bootstrap/Col'
import { renderPlot } from './dcUtils'
import { renderRidgelinePlot } from './ridgelineCharts'
import { TIMINGS } from './utils'
import FormGroup from 'react-bootstrap/FormGroup'
import FormControl from 'react-bootstrap/FormControl'
import Blank from '../Blank'
import styled from 'styled-components'
import { renderSunburstChart } from './sunburstChart'
import { renderPieChartMep } from './pieCharts'
import { renderBarChartDomain, renderBarChartTiming } from './barCharts'
import { connect } from 'react-redux'
import { setRidgelineDimension, setRidgelineWert } from '../../logic/actions'
import { renderChartBrush } from './lineCharts'
import { SelectorCol, HighSelectorCol } from './dcStyles'

const ScrollArea = styled(Col)`
  top: 190px;
  position: fixed;
  height: calc(100% - 190px);
  overflow-y: scroll;
  background-color: #FFF;
`
const Submenu = styled(Col)`
  position: fixed;
  padding-bottom: 5px;
`
const SubForm = styled(Form)`
  background-color: #f9f9f9;
  padding: 5px
`

const WertDimensions = (
  <>
    <option key="service" value="service">Service</option>
    <option key="operation" value="operation">Serviceoperation</option>
  </>
)

const WertOptions = (
  <>
    <option key={TIMINGS.GESAMT.key} value={TIMINGS.GESAMT.key}>Antwortzeit
    </option>
    <option key={TIMINGS.BUS.key} value={TIMINGS.BUS.key}>Bus-Zeit</option>
    <option key={TIMINGS.PROVIDER.key}
            value={TIMINGS.PROVIDER.key}>Verarbeitungszeit
    </option>
    <option key='ContributionGesamtZeit' value='ContributionGesamtZeit'>Zeit-Kosten</option>
    <option key='anzahlGesamt' value='anzahlGesamt'>Anzahl Calls</option>
    <option key='anzahlFault' value='anzahlFault'>Anzahl Faults</option>
  </>
)

const UnconnectedRidgelineStatistik = (props) => {
  const [range, setRange] = useState(null)
  const render = useMemo(() => renderPlot(props.data, props.colorscheme), [props.data, props.colorscheme])

  const brush = useMemo(() => render(renderChartBrush({left: 235, right: 38}, setRange)), [render])
  const barDomain = useMemo(() => render(renderBarChartDomain), [render])
  const sunDomain = useMemo(() => render(renderSunburstChart), [render])
  const pieMep = useMemo(() => render(renderPieChartMep), [render])
  const histGesamt = useMemo(() => render(renderBarChartTiming(TIMINGS.GESAMT)), [render])
  const histBus = useMemo(() => render(renderBarChartTiming(TIMINGS.BUS)), [render])

  return (
    <div style={{ width: props.width }}>
        <Row>
          <Col xs={9}>
            <Row>
              <Submenu xs={9}>
                <SubForm  className="d-flex">
                  <Form.Label>Werte pro Service</Form.Label>
                  <Blank/>
                  <Blank/>
                  <FormGroup controlId="select.dimension">
                    <FormControl as="select" value={props.dimension}
                                 onChange={e => props.setDimension(e.target.value)}>
                      {WertDimensions}
                    </FormControl>
                  </FormGroup>
                  <Blank/>
                  <Blank/>
                  <FormGroup controlId="select.wert">
                    <FormControl as="select" value={props.wert}
                                 onChange={e => props.setWert(e.target.value)}>
                      {WertOptions}
                    </FormControl>
                  </FormGroup>
                </SubForm>
                {brush}
              </Submenu>
            </Row>
            <Row>
              <ScrollArea xs={9}>
                {render(renderRidgelinePlot(props.dimension, props.wert, range))}
              </ScrollArea>
            </Row>
          </Col>
          <Col xs={3}>
            <Row>
              <HighSelectorCol>
                {barDomain}
              </HighSelectorCol>
            </Row>
            <Row>
              <HighSelectorCol>
                {sunDomain}
              </HighSelectorCol>
            </Row>
            <Row>
              <SelectorCol>
                {pieMep}
              </SelectorCol>
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
    </div>
  )
}

export const RidgelineStatistik = connect(
  state => ({
    dimension: state.ridgelineDimension,
    wert: state.ridgelineWert
  }),
  dispatch => ({
    setDimension: dimension => dispatch(setRidgelineDimension(dimension)),
    setWert: wert => dispatch(setRidgelineWert(wert)),
  })
)(UnconnectedRidgelineStatistik)
