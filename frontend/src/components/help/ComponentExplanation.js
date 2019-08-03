import React from 'react'
import Row from 'react-bootstrap/Row'
import Col from 'react-bootstrap/Col'

const ComponentExplanation = ({component, children}) => (
  <>
    <Row>
      <Col xs={12}>
        <hr />
      </Col>
    </Row>
    <Row>
      <Col xs={{span: 2, offset: 1}}>{component}</Col>
      <Col xs={8}>{children}</Col>
    </Row>
  </>
)

export default ComponentExplanation
