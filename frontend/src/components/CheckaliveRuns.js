import React, { useState, useEffect } from 'react'
import { getCheckaliveRuns } from '../logic/api/api-dashboard'
import Log from '../log'
import { connect } from 'react-redux'
import WartenAnzeiger from './WartenAnzeiger'
import Inspector from 'react-inspector'
import { THEME } from './ServiceView/theme'

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
    cluster[year][month][day][hour].push(m.format('HH:mm:ss') + ' / ' + m._i)
  })

  return cluster
}

export const UnconnectedCheckaliveRuns = ({umgebung}) => {
  log.trace('Mounting CheckaliveRuns', umgebung)
  const result = useFetch({umgebung})

  if (result.status === 'loading') return <WartenAnzeiger />
  if (result.status === 'error') return <h2>{result.data}</h2>

  const cluster = calculateCluster(result.data)
  return (
    <>
      <div>
        <Inspector name="Runs" data={cluster} theme={THEME}/>
      </div>
    </>
  )
}

export default connect(
  state => ({
    umgebung: state.umgebung,
  })
)(UnconnectedCheckaliveRuns)

