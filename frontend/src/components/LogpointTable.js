import React, { useState, useEffect, useMemo, useCallback } from 'react'
import Row from 'react-bootstrap/Row'
import Col from 'react-bootstrap/Col'
import { getLogpoints } from '../logic/api/api-dashboard'
import Log from '../log'
import { Modal, useModal } from './LogpointModals'
import { getColumns } from '../logic/tableConfLog'
import { useTable, useGroupBy, useExpanded } from 'react-table'
import WartenAnzeiger from './WartenAnzeiger'
import BaseTable, { RawTable } from './table/BaseTable'
import { useBlockLayout } from 'react-table/src/plugin-hooks/useBlockLayout'
import { getStatistik } from '../logic/logpunktstatistik'
import { LOG_SEARCH_TYPES } from '../logic/store'
import LogpointDistribution from './LogpointDistribution'

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

const showModal = () => {}

const LogpointTable = ({umgebung, datum, von, bis, searchType, searchValue}) => {
  const [mounted] = useState(Date.now)
  const result = useFetch({umgebung, datum, von, bis, searchType, searchValue})

  const {statistik, isEmpty} = useMemo(() => getStatistik(result.data, 'Timestamp'), [result.data])
  const oneMessageOnly = searchValue && (searchType === LOG_SEARCH_TYPES.MESSAGEID || searchType === LOG_SEARCH_TYPES.REFERENCE)

  const distribution = useMemo(() => (oneMessageOnly ? (
      <span />
    ) : (
      <LogpointDistribution isEmpty={isEmpty} statistik={statistik} setBis={() => { /* TODO setBis */ }}/>
    )),
    [oneMessageOnly, isEmpty, statistik]
  )

  //const [modal, showModal, hideModal] = useModal()
  //const modalComponent = useMemo(() => <Modal umgebung={umgebung} {...modal} onHide={hideModal}/>, [hideModal, modal, umgebung])

  log.trace('setColumns', result.keys)
  const columns = useMemo(() => result.keys ? getColumns(showModal, result.keys) : [], [result.keys, showModal])
  log.info('Columns', columns)

  const tableInstance = useTable({
      columns,
      data: result.data || []
    },
    useBlockLayout,
    // useGroupBy,
    /* useExpanded */
  )

  return (
    <>
    {result.status === 'loading' ? (
      <WartenAnzeiger />
      ) : (
      <>
        Mounted: {mounted}
        <br />
        {distribution}
        <BaseTable table={tableInstance} />
      </>
      )
    }
    </>
  )
}

export default LogpointTable
