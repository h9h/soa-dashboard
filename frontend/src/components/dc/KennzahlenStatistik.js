import React from 'react'
import Row from 'react-bootstrap/Row'
import Col from 'react-bootstrap/Col'
import * as PropTypes from 'prop-types'
import { renderPlot } from './dcUtils'
import ChartsVerteilung from './ChartsVerteilung'

export function KennzahlenStatistik (props) {
  const render = renderPlot(props.data, props.colorscheme)

  return (
    <>
      <Row>
        <Col xs={9}>
          <Row>
            <Col>
              <h3>Gesamtzeiten pro Operation</h3>
              <div style={{height: '370px'}}>
                TODO
              </div>
            </Col>
          </Row>
        </Col>
        <Col xs={3}>
          <ChartsVerteilung render={render}/>
        </Col>
      </Row>
    </>
  )
}

KennzahlenStatistik.propTypes = {
  data: PropTypes.shape({status: PropTypes.string}),
  colorscheme: PropTypes.any
}
