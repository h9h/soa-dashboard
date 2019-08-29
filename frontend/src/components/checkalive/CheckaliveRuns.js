import React, { useState, useEffect } from 'react'
import { getCheckaliveRuns } from '../../logic/api/api-dashboard'
import Log from '../../log'
import { connect } from 'react-redux'
import WartenAnzeiger from '../WartenAnzeiger'
import Inspector from 'react-inspector'
import { THEME } from '../ServiceView/theme'
import moment from 'moment'
import Row from 'react-bootstrap/Row'
import Col from 'react-bootstrap/Col'
import Checkalive from './Checkalive'

const log = Log('checkaliveruns')

const useFetch = ({umgebung}) => {
  const [result, setResult] = useState({
    status: 'loading'
  })

  useEffect(() => {
    setResult({status: 'loading'})
    log.trace('useEffect on filter', umgebung)
    const fetchData = async () => {
      const data = await getCheckaliveRuns(umgebung)

      if (data.success) {
        setResult({ status: 'ready', data: data.result })
      } else {
        setResult({ status: 'error', data: data.result })
      }
    }

    fetchData()
  }, [umgebung])

  return result
}

const calculateCluster = moments => {
  const cluster = {}

  moments.forEach(m => {
    const year = m.format('YYYY')
    if (!cluster[year]) cluster[year] = {}

    const month = m.format('MMMM')
    if (!cluster[year][month]) cluster[year][month] = {}

    const day = m.format('DD')
    if (!cluster[year][month][day]) cluster[year][month][day] = []

    const hour = m.format('HH')
    if (!cluster[year][month][day][hour]) cluster[year][month][day][hour] = []
    cluster[year][month][day][hour].push(m._i)
  })

  return cluster
}

const nodeRenderer = fn => ({root, depth, name, data}) => {
  if (depth === 5) return (
    <span
      style={{ cursor: 'pointer' }}
      onClick={() => {
      fn(data.replace(/[+]/, '%2B'))
    }}>{moment(data).format('HH:mm:ssZ')}</span>
  )
  if (depth > 5) return ''
  return <span>{name}</span>
}

export const UnconnectedCheckaliveRuns = ({umgebung}) => {
  log.trace('Mounting CheckaliveRuns', umgebung)
  const result = useFetch({umgebung})
  const [run, setRun] = useState(null)

  if (result.status === 'loading') return <WartenAnzeiger />
  if (result.status === 'error') return <h2>{result.data}</h2>

  const cluster = calculateCluster(result.data)
  return (
    <Row>
      <Col xs={2}>
        <Inspector
          name="Checkalive Runs nach Datum"
          data={cluster}
          theme={THEME}
          nodeRenderer={nodeRenderer(setRun)}
          expandLevel={2}
        />
      </Col>
      <Col xs={10}>
        {run && (
          <Checkalive umgebung={umgebung} run={run} />
        )}
      </Col>
    </Row>
  )
}

export default connect(
  state => ({
    umgebung: state.umgebung,
  })
)(UnconnectedCheckaliveRuns)

