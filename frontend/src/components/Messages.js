import React, { useState, useEffect } from 'react'
import { getMessages } from '../logic/api/api-dashboard'
import WartenAnzeiger from './WartenAnzeiger'
import { getColumns } from '../logic/tableConfMessages'
import Row from 'react-bootstrap/Row'
import Col from 'react-bootstrap/Col'
import ReactTable from 'react-table'
import { connect } from 'react-redux'
import MessageModal from './MessageModal'
import { sort } from 'ramda'
import MessageFilter from './MessageFilter'
import SaveJob from './SaveJob'
import { checkAliveFile } from '../logic/api/rest-api-local'
import { Centered, Red } from './styles'
import Log from '../log'
import moment from 'moment'
import {
  updateConfiguration,
} from '../logic/actions'

const log = Log('messages')

const getDefaultSorted = [{id: 'LOGTIMESTAMP'}]

const getTdProps = setRow => (state, rowInfo, column) => {
  return {
    onClick: (e, handleOriginal) => {
      log.trace('Click on column', column.id)
      switch (column.id) {
        case 'MESSAGEID':
          if (rowInfo.row) setRow(rowInfo.row._original)
          break
        default:
          if (handleOriginal) {
            handleOriginal()
            return
          }
      }
    }
  }
}

function AnzahlSaetzeSelektiert (props) {
  return <>
    Anzahl selektierte Sätze: {props.filteredMessages.length}
    <br/>
    Gesamtanzahl an Sätzen: {props.anzahl}
    {(props.anzahl === 1000 || props.anzahl === 10000 || props.anzahl === 50000) && (
      <>
        <hr />
        <Red>
          Hinweis: Datenbank-Limit erreicht!
          <br/>
          Ggf. weitere Sätze vorhanden
        </Red>
      </>
    )}
  </>
}

/* eslint-disable no-eval, no-unused-vars */
const evaluateFilterexpression = (filter, row, index) => {
  try {
    // row, index und now können in filter verwendet werden
    const now = moment()
    return eval(filter)
    /* eslint-enable */
  } catch (e) {
    log.trace('Invalid filter expression', e.message)
    return false
  }
}

const Messages = props => {
  const {umgebung, messageType, datumVon, datumBis, searchType, searchValue} = props
  log.trace('Messages for', umgebung, messageType, datumVon, datumBis, searchType, searchValue)
  const [haveJobsApi, setHaveJobsApi] = useState(false)

  useEffect(() => {
    checkAliveFile(props.user).then((have) => setHaveJobsApi(have))
  }, [props.user])
  log.trace('have Jobs-API', haveJobsApi)

  const [status, setStatus] = useState('loading')
  const [messages, setMessages] = useState(null)
  const [filter, setFilter] = useState('')
  const [filteredMessages, setFilteredMessages] = useState(null)
  const [row, setRow] = useState(null)
  const [modal, setModal] = useState({show: false})

  const handleHide = () => setModal({
    show: false
  })

  const Modal = () => {
    if (!modal.show) return null
    return <MessageModal {...modal} />
  }

  const handleClick = (props) => {
    setModal({show: true, onHide: handleHide, ...props})
  }

  useEffect(() => {
    if (!messageType || !datumVon || !datumBis) return
    log.trace('in useEffect', umgebung, messageType, datumVon, datumBis, searchType, searchValue)
    setMessages(null)
    setStatus('loading')
    const cb = ({status, data}) => {
      setMessages(data)
      setStatus(status)
    }
    getMessages({umgebung, messageType, datumVon, datumBis, searchType, searchValue}, cb)
  }, [umgebung, messageType, datumVon, datumBis, searchType, searchValue])

  useEffect(() => {
    if (!messages) return
    setRow(messages[0])
  }, [messages])

  useEffect(() => {
    if (!messages) return
    setStatus('loading')

    const filtered = filter === '' ? messages : messages.filter((row, index) => evaluateFilterexpression(filter, row, index))

    setFilteredMessages(filtered)
    setStatus('ready')
  }, [messages, filter])

  if (!messageType || !datumVon || !datumBis) return null

  const columns = getColumns(messageType, handleClick)

  if (status === 'loading') return <WartenAnzeiger
    nachricht="Nicht ungeduldig werden: wenn viele Sätze in der Queue stehen kann das ein Minütchen dauern..."/>

  if (status === 'ready') {
    if (!filteredMessages || filteredMessages.length === 0) {
      return (
        <>
          {haveJobsApi && filter !== '' && (
            <Row>
              <Col xs={8}>
                <MessageFilter row={row} defaultFilter={filter} handleFilter={setFilter}/>
              </Col>
            </Row>
          )}
          <Row>
            <Col>
              <Centered><h2>Keine Daten</h2></Centered>
            </Col>
          </Row>
        </>
      )
    }

    const sizeOptions = sort((a, b) => a - b, props.pageSizes.filter(s => !!s).map(s => parseInt(s, 10)))
    log.trace('SizeOptions', sizeOptions)

    const handlePageSizeChange = e => {
      props.setPageSize(e)
    }

    const anzahl = messages ? messages.length : 0

    return (
      <>
        <Modal/>
        {haveJobsApi && (
          <Row>
            <Col xs={7}>
              <MessageFilter row={row} defaultFilter={filter} handleFilter={setFilter}/>
            </Col>
            <Col xs={5}>
              <SaveJob job={{umgebung, messageType, datumVon, datumBis, filter, filteredMessages}}>
                <AnzahlSaetzeSelektiert filteredMessages={filteredMessages} anzahl={anzahl}/>
              </SaveJob>
            </Col>
          </Row>
        )}
        <Row>
          <Col>
            <ReactTable
              columns={columns}
              data={filteredMessages}
              filterable={!haveJobsApi}
              defaultSorted={getDefaultSorted}
              pageSizeOptions={sizeOptions}
              onPageSizeChange={handlePageSizeChange}
              defaultPageSize={props.defaultPageSize}
              getTdProps={getTdProps(setRow)}
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
    messageType: state.messageType,
    datumVon: state.datumVon,
    datumBis: state.datumBis,
    user: state.user,
    pageSizes: state.configuration.messagetable.pageSizes,
    defaultPageSize: parseInt(state.configuration.messagetable.defaultSize, 10),
    searchType: state.messageSearchType,
    searchValue: state.messageSearchValue
  }),
  dispatch => ({
    setPageSize: size => dispatch(updateConfiguration({ messagetable: { defaultSize: '' + size }}))
  })
)(Messages)
