import React, { useState, useEffect, useMemo } from 'react'
import Row from 'react-bootstrap/Row'
import Col from 'react-bootstrap/Col'
import ReactTable from 'react-table-6'
import { sort } from 'ramda'
import { getColumns } from '../logic/tableConfLog'
import { getLogpoints } from '../logic/api/api-dashboard'
import LogpointDistribution from './LogpointDistribution'
import WartenAnzeiger from './WartenAnzeiger'
import Log from '../log'
import { getStatistik } from '../logic/logpunktstatistik'
import { connect } from 'react-redux'
import {
  setLogSearchParameters,
  setBis,
  updateConfiguration,
} from '../logic/actions'
import withRouter from '../withRouter'
import { getDashboardRoute } from '../logic/routes'
import { LOG_SEARCH_TYPES } from '../logic/store'
import { getDefaultFilterMethod, json2string } from '../logic/utils'
import useWindowSize from './useWindowSize'
import { getConfigurationValue } from '../logic/configuration'
import { Modal, useModal } from './LogpointModals'

const log = Log('logtable')

const getTdProps = (history, route) => {
  const handleRouteTo = (searchType, searchValue) => {
    const concreteRoute = route(searchType, searchValue)
    if (history.location.pathname === concreteRoute) return
    log.trace('routing to ', concreteRoute)
    history.push(concreteRoute)
  }

  return (state, rowInfo, column) => {
    if (rowInfo && rowInfo && !rowInfo.aggregated) return {}

    return {
      onClick: (e, handleOriginal) => {
        log.trace('Click on column', column.id)
        switch (column.id) {
          case 'xxx': // sinnvoll?
            if (rowInfo && rowInfo.row) {
              log.trace('Route to Dashboard')
              handleRouteTo(LOG_SEARCH_TYPES.MESSAGEID, rowInfo.row.MESSAGEID)
            }
            break
          case 'MESSAGEID':
            // kein handleOriginal für das Pivot-Feld Message ID - wir wollen die
            // Zeile nicht aufklappen!
            break
          default:
            if (handleOriginal) {
              handleOriginal()
            }
        }
      }
    }
  }
}

const useFetch = ({umgebung, datum, von, bis, searchType, searchValue, onlyFaults}) => {
  const [result, setResult] = useState({
    status: 'loading'
  })

  useEffect(() => {
    setResult({status: 'loading'})
    log.trace('useEffect on filter', umgebung, datum, von, bis, searchType, searchValue, onlyFaults)
    getLogpoints({umgebung, datum, von, bis, searchType, searchValue, onlyFaults}, setResult)
  }, [umgebung, datum, von, bis, searchType, searchValue, onlyFaults])

  return result
}

export const UnconnectedLogTable = withRouter((props) => {
  log.trace('Mount UnconnectedLogTable', props)
  const {umgebung, datum, von, bis, searchType, searchValue, onlyFaults} = props
  const decodedSearchValue = decodeURIComponent(searchValue)
  const result = useFetch({umgebung, datum, von, bis, searchType, searchValue: decodedSearchValue, onlyFaults})

  switch(result.status) {
    case 'ready':
      return <LogpointTable logs={result} {...props} />
    case 'loading':
      return <WartenAnzeiger />
    case 'error':
      return (
        <div>
          <h2>Error</h2>
          <p>{json2string(result)}</p>
        </div>
      )
    default:
      return (
        <div>
          <h2>Unbekannter Zustand</h2>
          <p>{json2string(result)}</p>
        </div>
      )
  }
})

const UnconnectedLogpointTable = ({ logs, defaultPageSize, pageSizes, setPageSize, ...props}) => {
  const {umgebung, datum, von, bis, searchType, searchValue} = props
  const { height } = useWindowSize()
  let barchartHeight = parseInt(getConfigurationValue('presentation.distribution.heightInPx'), 10)
  if (barchartHeight < 20) barchartHeight = 0

  const menuHeight = navigator.userAgent.indexOf('Firefox') > -1 ? 180 : 120

  const [modal, showModal, hideModal] = useModal()

  log.trace('setColumns', logs.keys)
  const columns = getColumns(showModal, logs.keys)

  log.trace('calculate statistic')
  const {statistik, isEmpty} = useMemo(() => getStatistik(logs.data, 'Timestamp'), [logs.data])
  const oneMessageOnly = searchValue && (searchType === LOG_SEARCH_TYPES.MESSAGEID || searchType === LOG_SEARCH_TYPES.REFERENCE)

  const distribution = useMemo(() => (oneMessageOnly ? (
      <span />
    ) : (
      <LogpointDistribution isEmpty={isEmpty} statistik={statistik} setBis={props.setBis}/>
    )),
    [oneMessageOnly, isEmpty, props.setBis, statistik]
  )

  const tableOptions = {
    pivotBy: ['MESSAGEID'],
    defaultSorted: [{id: 'Timestamp', desc: true}],
    defaultFilterMethod: getDefaultFilterMethod(true),
    showPageSizeOptions: !oneMessageOnly,
    showPagination: !oneMessageOnly,
    pageSizeOptions: sort((a, b) => a - b, pageSizes.filter(s => !!s).map(s => parseInt(s, 10))),
    filterable: !oneMessageOnly,
    minRows: oneMessageOnly ? 1 : 0,
    collapseOnDataChange: false,
    getTdProps: getTdProps(props.history, getDashboardRoute(umgebung, datum, von, bis)),
  }

  log.trace('render LogTable')
  return (
    <Row>
      <Col>
        <Modal umgebung={umgebung} {...modal} onHide={hideModal}/>
        {distribution}
        <ReactTable
          columns={columns}
          data={logs.data}
          onPageSizeChange={setPageSize}
          defaultPageSize={defaultPageSize}
          style={{height: (height - barchartHeight - menuHeight) + 'px'}}
          {...tableOptions}
        />
      </Col>
    </Row>
  )
}

const LogpointTable = connect(
  state => ({
    pageSizes: state.configuration.logtable.pageSizes,
    defaultPageSize: parseInt(state.configuration.logtable.defaultSize, 10)
  }),
  dispatch => ({
    setPageSize: size => dispatch(updateConfiguration({ logtable: { defaultSize: '' + size }}))
  })
)(UnconnectedLogpointTable)

UnconnectedLogTable.whyDidYouRender = true

export default connect(
  state => ({
    umgebung: state.umgebung,
    datum: state.datum,
    von: state.von,
    bis: state.bis,
    searchType: state.logSearchType,
    searchValue: state.logSearchValue,
    onlyFaults: state.onlyFaults
  }),
  dispatch => ({
    setSearchParameters: (searchType, searchValue) => dispatch(setLogSearchParameters(searchType, searchValue)),
    setBis: bis => dispatch(setBis(bis)),
  })
)(UnconnectedLogTable)
