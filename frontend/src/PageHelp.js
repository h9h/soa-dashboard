import React from 'react'
import HeaderHelp from './components/HeaderHelp'
import BodyArea from './components/BodyArea'
import Hilfe from './components/help'
import { Helmet } from 'react-helmet'
import Row from 'react-bootstrap/Row'
import Col from 'react-bootstrap/Col'

const PageHelp = () => {
  return (
    <>
      <Helmet>
        <title>Hilfe</title>
      </Helmet>
      <HeaderHelp/>
      <BodyArea>
        <Row>
          <Col xs={{span: 10, offset: 1}}>
            <Hilfe />
          </Col>
        </Row>
      </BodyArea>
    </>
  )
}

export default PageHelp
