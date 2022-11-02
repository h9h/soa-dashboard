import React, { useState, useEffect } from 'react'
import BodyArea from './components/BodyArea'
import Servicecall from './components/Servicecall'
import { getLogpoints } from './logic/api/api-dashboard'
import WartenAnzeiger from './components/WartenAnzeiger'
import Row from 'react-bootstrap/Row'
import Col from 'react-bootstrap/Col'
import Container from 'react-bootstrap/Container'
import HeaderServicecall from './components/HeaderServicecall'
import { Helmet } from 'react-helmet'
import { Centered } from './components/styles'
import moment from 'moment'
import Log from './log'
import { LOG_SEARCH_TYPES } from './logic/store'
import { useParams } from 'react-router-dom'

const log = Log('pageservicecall')

const PageServicecall = props => {
  const {umgebung, datum, von, bis, messageId} = useParams()
  log.trace('mount PageServicecall', umgebung, datum, von, bis, messageId)

  const [logs, setLogs] = useState({status: 'loading'})

  useEffect(() => {
    log.trace('useEffect - hole Daten', umgebung, messageId)
    getLogpoints({umgebung, datum, von, bis, searchType: LOG_SEARCH_TYPES.MESSAGEID, searchValue: messageId}, setLogs)
  }, [umgebung, datum, von, bis, messageId])

  if (logs.status === 'loading') return (
    <WartenAnzeiger/>
  )

  if (logs.status === 'ready') {
    log.trace('status === ready')
    if (!logs.data) {
      log.trace('ready but no data')
      return (
        <WartenAnzeiger/>
      )
    }

    const body = logs.data.length === 0 ? (
      <Row>
        <Col>
          <h2>
            <Centered>Keine Daten</Centered>
          </h2>
        </Col>
      </Row>
    ) : (
      <>
        <Row>
          <Col>
            <h4>Serviceoperation: {logs.data[0].ServiceOperation[0]} - {logs.data[0].ServiceOperation[1]}</h4>
          </Col>
        </Row>
        <Row>
          <Col xs={12}>
            <Servicecall umgebung={umgebung} logpoints={logs.data} standalone={true}/>
          </Col>
        </Row>
      </>
    )

    const ts = logs.data.length === 0 ? moment() : logs.data[0].Timestamp

    return (
      <>
        <Helmet>
          <title>{messageId}</title>
        </Helmet>
        <Container fluid>
          <HeaderServicecall messageId={messageId} umgebung={umgebung} timestamp={ts}/>
          <BodyArea>
            {body}
          </BodyArea>
        </Container>
      </>
    )
  }

  return <h2>{logs.status}</h2>
}

export default PageServicecall
