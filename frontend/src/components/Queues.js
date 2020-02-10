import React, { useState, useEffect } from 'react'
import { getQueues } from '../logic/api/api-dashboard'
import WartenAnzeiger from './WartenAnzeiger'
import { getColumns } from '../logic/tableConfQueue'
import Row from 'react-bootstrap/Row'
import Col from 'react-bootstrap/Col'
import ReactTable from 'react-table-6'

import Log from '../log'
import { connect } from 'react-redux'
import { setFilterQueues, updateConfiguration } from '../logic/actions'
import { sort } from 'ramda'
import useWindowSize from './useWindowSize'

const log = Log('queues')

const fetchData = (database, setQueues, umgebung) => {
  if (!database) return
  setQueues({status: 'loading'})
  getQueues({umgebung, database}, setQueues)
}

const Queues = props => {
  const {umgebung, database} = props
  log.trace('Queues for', umgebung, database)

  const { height } = useWindowSize()

  const [queues, setQueues] = useState({status: 'loading', queues: { data: [] }})
  const columns = getColumns()

  useEffect(() => {
    fetchData(database, setQueues, umgebung)
  }, [umgebung, database])

  if (!database) return null

  const sizeOptions = sort((a,b) => a-b, props.pageSizes.filter(s => !!s).map(s => parseInt(s,10)))
  log.trace('SizeOptions', sizeOptions)

  const handlePageSizeChange = e => {
    props.setPageSize(e)
  }

  return (
    <>
      {queues.status === 'loading' && (
        <WartenAnzeiger />
      )}
      <Row>
        <Col>
          <ReactTable
            columns={columns}
            data={queues.data}
            defaultSorted={[
              {id: 'QUEUE_NAME'},
            ]}
            pageSizeOptions={sizeOptions}
            onPageSizeChange={handlePageSizeChange}
            defaultPageSize={props.defaultPageSize}
            getTdProps={(state, rowInfo, column) => {
              return {
                onClick: (e, handleOriginal) => {
                  log.trace('Click on column', column.id)
                  switch (column.id) {
                    case 'EXPIRATION':
                    case 'WAITING':
                    case 'READY':
                    case 'EXPIRED':
                      log.trace('TBD-1: handle click in cell (c,r)', column.id, rowInfo, rowInfo && rowInfo.row ? rowInfo.row[column.id] : '-')
                      fetchData(database, setQueues, umgebung)
                      break
                    case 'QUEUE_NAME':
                    case 'QUEUE_TABLE':
                      log.trace('TBD-2: handle click in cell (c,r)', column.id, rowInfo, rowInfo && rowInfo.row ? rowInfo.row[column.id] : '-')
                      break
                    default:
                      if (handleOriginal) {
                        handleOriginal()
                        return
                      }
                  }
                }
              }
            }}
            style={{height: (height - 120) + 'px'}}
          />
        </Col>
      </Row>
    </>
  )
}

export default connect(
  state => ({
    umgebung: state.umgebung,
    database: state.database,
    pageSizes: state.configuration.queuetable.pageSizes,
    defaultPageSize: parseInt(state.configuration.queuetable.defaultSize, 10)
  }),
  dispatch => ({
    setFilterQueues: (umgebung, database) => dispatch(setFilterQueues(umgebung, database)),
    setPageSize: size => dispatch(updateConfiguration({ queuetable: { defaultSize: '' + size }}))
  })
)(Queues)
