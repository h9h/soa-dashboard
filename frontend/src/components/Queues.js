import React, { useState, useEffect } from 'react'
import { getQueues } from '../logic/api/api-dashboard'
import WartenAnzeiger from './WartenAnzeiger'
import { getColumns } from '../logic/tableConfQueue'
import Row from 'react-bootstrap/Row'
import Col from 'react-bootstrap/Col'
import ReactTable from 'react-table'

import Log from '../log'
import { connect } from 'react-redux'
import { setFilterQueues } from '../logic/actions'
import { mergeDeepRight, sort } from 'ramda'
import { useConfiguration } from '../configuration'

const log = Log('queues')

const Queues = props => {
  const {umgebung, database} = props
  log.trace('Queues for', umgebung, database)

  const [configuration, setConfiguration] = useConfiguration()

  const [queues, setQueues] = useState({status: 'loading'})
  const columns = getColumns()

  useEffect(() => {
    if (!database) return
    setQueues({status: 'loading'})
    getQueues({umgebung, database}, setQueues)
  }, [umgebung, database])

  if (!database) return null

  if (queues.status === 'loading') return <WartenAnzeiger/>

  if (queues.status === 'ready') {
    const sizeOptions = sort((a,b) => a-b, configuration.queuetable.pageSizes.filter(s => !!s).map(s => parseInt(s,10)))
    log.trace('SizeOptions', sizeOptions)

    const handlePageSizeChange = e => {
      const newConf = mergeDeepRight(configuration, { queuetable: { defaultSize: '' + e }})
      setConfiguration(newConf)
    }

    return (
      <>
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
              defaultPageSize={parseInt(configuration.queuetable.defaultSize, 10)}
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
            />
          </Col>
        </Row>
      </>
    )
  }

  return null
}

export default connect(
  state => ({
    umgebung: state.umgebung,
    database: state.database
  }),
  dispatch => ({
    setFilterQueues: (umgebung, database) => dispatch(setFilterQueues(umgebung, database))
  })
)(Queues)
