import React, { useEffect, useState } from 'react'
import Row from 'react-bootstrap/Row'
import Col from 'react-bootstrap/Col'
import Button from 'react-bootstrap/Button'
import { connect } from 'react-redux'
import WartenAnzeiger from './WartenAnzeiger'
import Log from '../log'
import { Icon } from './icons'
import { withExplanation, withProgressNotification } from '../logic/notification'
import { fileListener, getJobLogName, Job } from '../logic/transactions/Job'
import { resendMessages } from '../logic/actionHandlers/resendMessages'
import { nurLog } from '../logic/actionHandlers/nurLog'
import NumberPicker from './NumberPicker'
import format from 'xml-formatter'
import styled from 'styled-components'
import ReactTable from 'react-table'
import { getJob } from '../logic/api/rest-api-local'
import { Bold, Red, Smaller } from './styles'
import { AKTIONEN, Aktionen } from './Aktionen'
import moment from 'moment'
import Inspector from 'react-inspector'
import { THEME } from './ServiceView/theme'

const STATUS = {
  IDLE: 'Idle',
  RUNNING: 'Running',
  FINISHED: 'Finished'
}

const log = Log('jobs')

const ObjectValue = ({ object }) => {
  switch (typeof object) {
    case 'number':
    case 'boolean':
      return <span>{String(object)}</span>;
    case 'string':
      return <span>"{object}"</span>;
    case 'undefined':
      return <span>undefined</span>;
    case 'object':
      if (object === null) {
        return <span>null</span>;
      }
      if (object instanceof Date) {
        return <span>{object.toString()}</span>;
      }
      if (object instanceof RegExp) {
        return (
          <span>{object.toString()}</span>
        );
      }
      if (Array.isArray(object)) {
        return <span>{`Array(${object.length})`}</span>;
      }
      if (!object.constructor) {
        return <span/>;
      }
      if (
        typeof object.constructor.isBuffer === 'function' &&
        object.constructor.isBuffer(object)
      ) {
        return <span>{`Buffer[${object.length}]`}</span>;
      }

      return <span/>;
    case 'function':
      return (
        <span>
          <span>ƒ&nbsp;</span>
          <span>
            {object.name}()
          </span>
        </span>
      );
    case 'symbol':
      return (
        <span>{object.toString()}</span>
      );
    default:
      return <span />;
  }
};

const MyObjectLabel = ({ name, data }) => {
  return (
    <span>
      {name === 'FEHLER' ? (
        <span style={{ color: 'red' }}>{name}: </span>
      ) : (
        <span style={{ color: 'darkblue' }}>{name}: </span>
      )}
      <ObjectValue object={data} />
    </span>
  );
};

const nodeRenderer = ({ depth, name, data }) =>
  depth === 0 ? null : <MyObjectLabel name={name} data={data} />

const PreSmall = styled.pre`
  font-size: smaller;
  padding-top: 10px;
`

const JsonViewer = props => <Inspector theme={THEME} nodeRenderer={nodeRenderer} showNonenumerable={false} {...props} />

const MessageContent = ({ message }) => {
  if (!message) return null
  if (!message.MESSAGE) return null
  try {
    return (
      <PreSmall>
        {format(message.MESSAGE, {stripComments: false}).replace(/\s*\n/g, '\n')}
      </PreSmall>
    )
  } catch (_) {
    return null
  }
}

const ZeigeSaetze = ({messages, satzNr, setSatzNr}) => {
  if (!messages) return null
  if (!satzNr && satzNr !== 0) return null

  const onChangeSatzNr = v => setSatzNr(v)

  return (
    <>
      <NumberPicker
        title={`Anzahl Sätze: ${messages.length} - Satz Nr.: `}
        defaultValue={satzNr}
        onChange={onChangeSatzNr}
        min={0}
        max={messages.length - 1}
      />
        <MessageContent message={messages[satzNr]} />
        <JsonViewer
          name="Checkalive Runs nach Datum"
          data={messages[satzNr]}
          expandLevel={2}
        />
    </>
  )
}

const ErgebnisColumns = setNr => ([
  {
    Header: 'Nr',
    accessor: 'index',
    width: 50,
    Cell: props => (
      <span style={{textAlign: 'right', cursor: 'pointer'}}
                         onClick={() => setNr(props.value)}>{props.value}
      </span>
    )
  },
  {
    Header: 'Ok?',
    accessor: 'success',
    width: 50,
    Cell: props => <Icon glyph={props.value ? 'success' : 'fail'}/>
    },
  {
    Header: 'Result',
    accessor: 'result',
    minWidth: 200,
    Cell: props => props.value ? (
      <JsonViewer
        name={null}
        data={props.value}
        expandLevel={1}
        expandPaths={['$.FEHLER']}
      />
    ) : '-'
  },
])

const ZeigeErgebnisse = ({results, setNr}) => {
  const countFehlerhaft = results.filter(item => !item.success).length
  const countOk = results.filter(item => item.success).length

  const Stil = countFehlerhaft > 0 ? Red : styled.span``

  return (
    <>
      <p>Gesamt: {results.length}, davon erfolgreich: {countOk} und
        <Stil> fehlerhaft: {countFehlerhaft}</Stil>
      </p>
      <Smaller>
      <ReactTable
        data={results}
        columns={ErgebnisColumns(setNr)}
        defaultPageSize={8}
        pageSizeOptions={[8, 10, 12, 25, 50, 100]}
        collapseOnDataChange={false}
      />
      </Smaller>
    </>
  )
}

const executeAction = async (name, config, jobname, setStatus, setResults, setLogFilename, messages) => {
  setStatus(STATUS.RUNNING)

  let handler
  let aktionName
  switch (name) {
    case AKTIONEN.NUR_LOG:
      handler = nurLog
      aktionName = 'NUR_LOG'
      break
    case AKTIONEN.RESEND:
      handler = resendMessages(true)
      aktionName = 'RESEND'
      break
    case AKTIONEN.RESEND_JOBDATA:
      handler = resendMessages(false)
      aktionName = 'RESEND_JOBDATA'
      break
    default:
      handler = null
  }

  if (!handler) {
    alert(`Handler für '${name}' nicht konfiguriert`)
    return
  }

  const logname = getJobLogName(jobname, aktionName)
  setLogFilename(logname)

  const listener = fileListener(logname)

  const executable = new Job(messages, handler, listener, config)

  const anzahl = messages.length

  const nachricht = () => {
    const starttime = moment().valueOf()

    return index => {
      const spent = moment().valueOf() - starttime
      const eta = moment().add( Math.floor((spent/index) * (anzahl - index)), 'ms')
      return (
        <div>
          <p>Ausführen von {aktionName}:</p>
          <p>Fortschritt {Math.floor(index/anzahl*100)}%, erwartete Ankunft um {eta.format('HH:mm')}</p>
        </div>
      )
    }
  }

  const Stopbutton = ({closeToast}) => (
    <Button
      onClick={() => {
        closeToast()
      }}
      variant="outline-primary"
    >
      <Icon glyph="cancel"/> Job abbrechen
    </Button>
  )

  const myUpdateNachricht = nachricht()
  let index = 1
  const updateProgress = withProgressNotification({
    nachricht: myUpdateNachricht(index),
    closeButton: <Stopbutton />,
    onClose: () => executable.abort('Abbruch durch Nutzer')
  })

  try {
    while (await executable.next()) {
      if (index % 10 === 0) updateProgress(myUpdateNachricht(index))
      index++
    }
  } catch (err) {
    // abgebrochen, Grund wird unten ausgegeben
  }

  setResults(executable.getResults())
  updateProgress(null)
  setStatus(STATUS.FINISHED)
}

const Jobs = (props) => {
  const {jobname} = props
  log.trace('Mount Jobs', props)

  const [job, setJob] = useState({status: 'loading'})
  const [messages, setMessages] = useState([])
  const [logFilename, setLogFilename] = useState(null)
  const [status, setStatus] = useState(STATUS.IDLE)
  const [results, setResults] = useState([])
  const [satzNr, setSatzNr] = useState(0)

  useEffect(() => {
    if (jobname === '') return

    setStatus(STATUS.IDLE)
    setResults([])
    setLogFilename(null)

    const cb = result => {
      if (result.status === 'ready') {
        try {
          const {filteredMessages: messages, ...job} = JSON.parse(result.data.job)
          setJob(job)
          setMessages(messages.filter(m => !m.anzahl))
        } catch (err) {
          setJob({
            nachricht: 'Fehler beim parsen der Datei',
            error: err,
            data: result.data.job
          })
        }
      }
    }
    getJob(jobname, cb)
  }, [jobname])

  if (jobname === '') return null

  if (job.status && job.status === 'loading') {
    return <WartenAnzeiger/>
  }

  log.trace('Job', job)

  const onClickAktion = messages.length === 0 ? null : (aktion) => {
    withExplanation({
      nachricht: `Aktion '${aktion.name}' wird ausgeführt`,
      fn: () => executeAction(aktion.name, aktion.config, jobname, setStatus, setResults, setLogFilename, messages),
    })
  }

  const anzahlMessages = messages ? messages.length : 0

  return (
    <>
      <Row>
        <Col xs={6}>
          <Aktionen anzahlMessages={anzahlMessages} onClickAktion={onClickAktion}/>
          <hr/>
          <h4>Filterkriterien</h4>
          <JsonViewer
            name={null}
            data={job}
            expandLevel={2}
          />
          <hr/>
          <h4>Nachrichten</h4>
          <ZeigeSaetze messages={messages} satzNr={satzNr} setSatzNr={setSatzNr}/>
        </Col>
        <Col xs={6}>
          <Row>
            <Col>
              <h4>Ergebnisse {logFilename ? ` - ${logFilename}` : ''}</h4>
            </Col>
          </Row>
          {status === STATUS.IDLE && (
            <Row>
              <Col>
                <p>Keine Ergebnisse vorhanden. Starte eine Aktion.</p>
              </Col>
            </Row>
          )}
          {status === STATUS.RUNNING && (
            <Row>
              <Col>
                <WartenAnzeiger/>
              </Col>
            </Row>
          )}
          {status === STATUS.FINISHED && results && (
            <>
              <Row>
                <Col>
                  {results.abort.aborted && <Bold><Red>{`Lauf abgebrochen: ${results.abort.reason}`}</Red></Bold>}
                </Col>
              </Row>
              <Row>
                <Col xs={12}>
                  <ZeigeErgebnisse results={results.results} setNr={setSatzNr}/>
                </Col>
              </Row>
            </>
          )}
        </Col>
      </Row>
    </>
  )
}

Jobs.whyDidYouRender = true

export default connect(
  state => ({
    jobname: state.jobname,
  }),
)(Jobs)
