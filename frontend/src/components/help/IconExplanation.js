import React from 'react'
import Row from 'react-bootstrap/Row'
import Col from 'react-bootstrap/Col'
import { Icon } from '../icons'

const IconExplanation = ({glyph, children}) => (
  <>
    <Row>
      <Col xs={12}>
        <hr />
      </Col>
    </Row>
    <Row>
      <Col xs={{span: 2, offset: 1}}><Icon glyph={glyph}/></Col>
      <Col xs={8}>{children}</Col>
    </Row>
  </>
)

export default IconExplanation
