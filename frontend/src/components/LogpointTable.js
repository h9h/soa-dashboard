import React, { useState, useEffect } from 'react'
import Row from 'react-bootstrap/Row'
import Col from 'react-bootstrap/Col'
import { getLogpoints } from '../logic/api/api-dashboard'
import Log from '../log'

const log = Log('logpointtable')

const useFetch = ({umgebung, datum, von, bis, searchType, searchValue}) => {
  const [result, setResult] = useState({
    status: 'loading'
  })

  useEffect(() => {
    setResult({status: 'loading'})
    log.trace('useEffect on filter', umgebung, datum, von, bis, searchType, searchValue)
    getLogpoints({umgebung, datum, von, bis, searchType, searchValue}, setResult)
  }, [umgebung, datum, von, bis, searchType, searchValue])

  return result
}

const LogpointTable = ({umgebung, datum, von, bis, searchType, searchValue}) => {
  const [mounted] = useState(Date.now)
  const result = useFetch({umgebung, datum, von, bis, searchType, searchValue})

  return (
    <Row>
      <Col>
        Mounted: {mounted}
        <br />
        Props: {JSON.stringify(result)}
      </Col>
    </Row>
  )
}

export default LogpointTable
