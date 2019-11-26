import React, { useState, useEffect } from 'react'
import { getQueuedMessages } from '../logic/api/api-dashboard'
import WartenAnzeiger from './WartenAnzeiger'
import { getColumns } from '../logic/tableConfQueuetable'
import Row from 'react-bootstrap/Row'
import Col from 'react-bootstrap/Col'
import ReactTable from 'react-table-6'

import Log from '../log'
import { sort } from 'ramda'
import MessageModal from './MessageModal'
import { connect } from 'react-redux'
import { updateConfiguration } from '../logic/actions'
import useWindowSize from './useWindowSize'
const log = Log('queuedmessages')

const QueuedMessages = ({ umgebung, database, queuetable, queue, ...props }) => {
  log.trace('QueuedMessages for', umgebung, database, queuetable, queue)

  const { height } = useWindowSize()

  const [messages, setMessages] = useState({status: 'loading'})
  const [modal, setModal] = useState({show: false})

  useEffect(() => {
    if (!database || !queuetable) return
    getQueuedMessages({ umgebung, database, queuetable, queue }, setMessages)
  }, [umgebung, database, queuetable, queue])

  const Modal = () => {
    if (!modal.show) return null
    return <MessageModal {...modal} />
  }

  const handleHide = () => setModal({
    show: false
  })

  const handleClick = (props) => {
    setModal({show: true, onHide: handleHide, ...props})
  }

  const columns = getColumns(handleClick)

  if (!database || !queuetable) return null
  if (messages.status === 'loading') return <WartenAnzeiger />

  if (messages.status === 'ready') {
    const sizeOptions = sort((a,b) => a-b, props.pageSizes.filter(s => !!s).map(s => parseInt(s,10)))
    log.trace('SizeOptions', sizeOptions)

    const handlePageSizeChange = e => {
      props.setPageSize(e)
    }

    return (
      <Row>
        <Col>
          <Modal />
          <ReactTable
            columns={columns}
            data={messages.data}
            defaultSorted={[
              {id: 'ENQ_TIME'},
            ]}
            pageSizeOptions={sizeOptions}
            onPageSizeChange={handlePageSizeChange}
            defaultPageSize={props.defaultPageSize}
            getTdProps={(state, rowInfo, column) => {
              return {
                onClick: (e, handleOriginal) => {
                  log.trace('Click on column', column.id)
                  switch(column.id) {
                    default:
                      if (handleOriginal) {
                        handleOriginal()
                        return
                      }
                  }
                }
              }
            }}
            style={{ height: (height - 120) + 'px' }}
          />
        </Col>
      </Row>
    )
  }

  return null
}

export default connect(
  state => ({
    pageSizes: state.configuration.queuetabletable.pageSizes,
    defaultPageSize: parseInt(state.configuration.queuetabletable.defaultSize, 10)
  }),
  dispatch => ({
    setPageSize: size => dispatch(updateConfiguration({ queuetabletable: { defaultSize: '' + size }}))
  })
)(QueuedMessages)

