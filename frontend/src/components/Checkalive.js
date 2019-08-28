import React, { useState, useEffect } from 'react'
import { getCheckaliveRun } from '../logic/api/api-dashboard'
import Log from '../log'
import WartenAnzeiger from './WartenAnzeiger'

const log = Log('checkalive')

const useFetch = ({umgebung, run}) => {
  const [result, setResult] = useState({
    status: 'loading'
  })

  useEffect(() => {
    setResult({status: 'loading'})
    log.trace('useEffect on filter', umgebung, run)
    const fetchData = async () => {
      const data = await getCheckaliveRun(umgebung, run)

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
  const result = useFetch({ umgebung, run })

  if (result.status === 'loading') return <WartenAnzeiger />
  if (result.status === 'error') return <h2>{result.data}</h2>

  return (
    <div>
      <div>{umgebung}</div>
      <div>{run}</div>
      <div>{JSON.stringify(result)}</div>
    </div>
  )
}

export default Checkalive
