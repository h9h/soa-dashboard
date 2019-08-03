import React, { useState, useEffect } from 'react'
import Row from 'react-bootstrap/Row'
import Col from 'react-bootstrap/Col'
import ReactTable from 'react-table'
import ReactJson from 'react-json-view'
import { sort, mergeDeepRight } from 'ramda'
import { getColumns } from '../logic/tableConfLog'
import ServiceModal from './ServiceModal'
import { getLogpoints } from '../logic/api/api-dashboard'
import ServicecallModal from './ServicecallModal'
import LogpointDistribution from './LogpointDistribution'
import WartenAnzeiger from './WartenAnzeiger'
import { useConfiguration } from '../configuration'
import Log from '../log'
import { getStatistik } from '../logic/logpunktstatistik'
import { connect } from 'react-redux'
import { setLogSearchParameters, setBis } from '../logic/actions'
import { withRouter } from 'react-router-dom'
import { getDashboardRoute } from '../logic/routes'
import { LOG_SEARCH_TYPES } from '../logic/store'

const log = Log('logtable')

const getDefaultFilterMethod = (filter, row) => {
  try {
    // die einzelnen Logpunkte einer Nachricht filtern wir nicht
    if (!row._aggregated) return true

    const testField = row[filter.id]
    const pruefer = RegExp(filter.value)
    const test = pruefer.test.bind(pruefer)
    if (Array.isArray(testField)) {
      return testField.some(test)
    } else {
      return test(testField)
    }
  } catch (_) {
    // Fehler hier interessieren nicht, z.B. noch unvollständige RegExps
    return true
  }
}

const getSubComponent = ({row}) => {
  const {Timestamp, Sender, ServiceOperation, filter, ...rest} = row._original
  return (
    <div style={{padding: '20px'}}>
      <ReactJson src={{...rest}} name={false}/>
    </div>
  )
}

const getTdProps = (handleRouteTo) => {
  return (state, rowInfo, column) => {
    if (rowInfo && rowInfo && !rowInfo.aggregated) return {}

    return {
      onClick: (e, handleOriginal) => {
        log.trace('Click on column', column.id)
        switch (column.id) {
          case 'MESSAGEID':
            if (handleOriginal) {
              handleOriginal()
            }
            break
          case 'ServiceOperation':
          case 'ORIGINATOR':
            if (rowInfo && rowInfo.row) {
              log.trace('Route to Dashboard')
              handleRouteTo(LOG_SEARCH_TYPES.MESSAGEID, rowInfo.row.MESSAGEID)
            }
            break
          default:
            // do nothing
        }
      }
    }
  }
}

export const UnconnectedLogTable = withRouter((props) => {
  log.trace('Mount UnconnectedLogTable', props)
  const {umgebung, datum, von, bis, searchType, searchValue} = props

  const handleRouteTo = (searchType, searchValue) => {
    const route = getDashboardRoute(umgebung, datum, von, bis, searchType, searchValue)
    if (props.history.location.pathname === route) return
    log.trace('routing to ', route)
    props.history.push(route)
  }

  const [configuration, setConfiguration] = useConfiguration()

  const [logs, setLogs] = useState({status: 'loading'})
  const [analysedData, setAnalysedData] = useState({isEmpty: true})
  const [columns, setColumns] = useState(null)
  const [modal, setModal] = useState({show: false})

  const hideModal = () => {
    setModal({show: false})
  }

  useEffect(() => {
    log.trace('useEffect on filter', umgebung, datum, von, bis, searchType, searchValue)

    const handleLogs = data => {
      if (props.notify) props.notify(data)
      setLogs(data)
    }

    handleLogs({status: 'loading'})
    getLogpoints({umgebung, datum, von, bis, searchType, searchValue}, handleLogs)
  }, [umgebung, datum, von, bis, searchType, searchValue, props])

  useEffect(() => {
    log.trace('useEffect on data', logs.status)
    if (logs.status !== 'ready') return

    const showModal = (props) => {
      setModal({show: true, onHide: hideModal, ...props})
    }

    log.trace('setColumns', logs.keys)
    if (!columns) setColumns(getColumns(showModal, logs.keys))

    log.trace('calculate statistic')
    const result = getStatistik(logs.data, 'Timestamp')
    if (result.isEmpty) {
      setAnalysedData(result)
      return
    }
    log.trace('Statistik', result)

    setAnalysedData(result)
  }, [columns, logs])

  if (logs.status === 'loading') return (
    <WartenAnzeiger/>
  )

  const Modal = props => {
    if (!modal.show) return null

    const type = modal.component
    if (!type) return null

    switch (type) {
      case 'Timestamp':
        return <ServiceModal {...props} />
      case 'LogpointAction':
        return <ServicecallModal {...props} />
      default:
        throw new Error('Unbekannter Type "' + type + '" in Modalem Dialog in LogTable')
    }
  }

  if (logs.status === 'ready') {
    if (!logs.data || !columns) return (
      <WartenAnzeiger/>
    )

    log.trace('render LogTable')

    const {statistik} = analysedData

    const sizeOptions = sort((a, b) => a - b, configuration.logtable.pageSizes.filter(s => !!s).map(s => parseInt(s, 10)))
    log.trace('SizeOptions', sizeOptions)

    const handlePageSizeChange = e => {
      const newConf = mergeDeepRight(configuration, {logtable: {defaultSize: '' + e}})
      setConfiguration(newConf)
    }

    const tdProps = getTdProps(handleRouteTo)
    const oneMessageOnly = searchValue && searchType === LOG_SEARCH_TYPES.MESSAGEID
    const minRows = oneMessageOnly ? 1 : undefined
    const fullTableControls = !oneMessageOnly

    const defaultSorted = [
      {id: 'Timestamp'},
    ]
    const defaultPageSize = parseInt(configuration.logtable.defaultSize, 10)

    return (
      <Row>
        <Col>
          <Modal umgebung={umgebung} {...modal} onHide={hideModal}/>
          {!analysedData.isEmpty && (
            <LogpointDistribution statistik={statistik} setBis={props.setBis}/>
          )}
          <ReactTable
            columns={columns}
            data={logs.data}
            pivotBy={['MESSAGEID']}
            pageSizeOptions={sizeOptions}
            onPageSizeChange={handlePageSizeChange}
            defaultPageSize={defaultPageSize}
            defaultFilterMethod={getDefaultFilterMethod}
            showPageSizeOptions={fullTableControls}
            showPagination={fullTableControls}
            filterable={fullTableControls}
            minRows={minRows}
            SubComponent={getSubComponent}
            collapseOnDataChange={false}
            defaultSorted={defaultSorted}
            getTdProps={tdProps}
          />
        </Col>
      </Row>
    )
  }

  return <h2>{logs.status}</h2>
})
UnconnectedLogTable.whyDidYouRender = true

export default connect(
  state => ({
    umgebung: state.umgebung,
    datum: state.datum,
    von: state.von,
    bis: state.bis,
    searchType: state.logSearchType,
    searchValue: state.logSearchValue
  }),
  dispatch => ({
    setSearchParameters: (searchType, searchValue) => dispatch(setLogSearchParameters(searchType, searchValue)),
    setBis: bis => dispatch(setBis(bis))
  })
)(UnconnectedLogTable)
