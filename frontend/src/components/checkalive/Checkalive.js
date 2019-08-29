import React, { useEffect, useState } from 'react'
import { getCheckaliveRun } from '../../logic/api/api-dashboard'
import Log from '../../log'
import WartenAnzeiger from '../WartenAnzeiger'
import Row from 'react-bootstrap/Row'
import Col from 'react-bootstrap/Col'
import CheckaliveSummary from './CheckaliveSummary'
import CheckaliveTable from './CheckaliveTable'
import { keysAndRowToObject } from '../../logic/utils'

const log = Log('checkalive')

const useFetch = ({umgebung, run}) => {
  const [result, setResult] = useState({
    status: 'loading'
  })

  useEffect(() => {
    setResult({status: 'loading'})
    log.trace('useEffect on filter', umgebung, run)
    const fetchData = async () => {
      const data = await getCheckaliveRun(umgebung, run._i.replace(/[+]/, '%2B'))

      if (data.success) {
        setResult({ status: 'ready', data: data.result })
      } else {
        setResult({ status: 'error', data: data.result })
      }
    }

    fetchData()
  }, [umgebung, run])

  return result
}

const Checkalive = ({ umgebung, run }) => {
  log.trace('Mount Checkalive', umgebung, run)
  const { status, data } = useFetch({ umgebung, run })

  if (status === 'loading') return <WartenAnzeiger />
  if (status === 'error') return <h2>{data}</h2>

  const { header, rows } = data
  const keys = header.map(h => Object.keys(h)[0])
  const caData = rows.map(r => {
    return keysAndRowToObject(keys, r)
  })

  return (
    <Row>
      <Col xs={12}>
        <h3>{caData[0].RUN}</h3>
      </Col>
      <Col xs={12}>
        <CheckaliveSummary data={caData}/>
      </Col>
      <Col xs={12}>
        <CheckaliveTable data={caData}/>
      </Col>
    </Row>
  )
}

export default Checkalive
