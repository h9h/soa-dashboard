import PropTypes from 'prop-types'
import React, { useEffect, useRef, useState, useMemo } from 'react'
import Row from 'react-bootstrap/Row'
import Col from 'react-bootstrap/Col'
import { DataSet, Timeline } from 'vis-timeline'
import useComponentSize from '@rehooks/component-size'
import { isEmpty } from 'ramda'
import {
  logpointDirection,
  logpointType,
  logpointWithMessage, LP_DIRECTION,
} from '../logic/logpunkt'
import MessageFromLogpoint from './MessageFromLogpoint'
import styled from 'styled-components'

import Log from '../log'
import { getConfigurationValue } from '../logic/configuration'

const log = Log('servicecall')

const WordWrap = styled.div`
  word-wrap: break-word;
`

const content = point => {
  const direction = logpointDirection(point.LOGPOINTNO)
  const text = point.DESCRIPTION
  const titel = (direction === LP_DIRECTION.REQUEST) ? `${text} ⇒` : `⇐ ${text}`

  return `
    <table>
        <tr>
            <td style="width: 40px">
                ${point.LOGPOINTNO}
            </td>
            <td>
              <div>
                  <div>${titel}</div>
              </div>
            </td>
        </tr>
    </table>
  `
}

const title = point => {
  const lines = ['INTERNALLOGID', 'SENDERTIMESTAMP', 'MEP', 'MESSAGEID'].map(key => `<div>${key}: ${point[key]}</div>`)
  lines.push(`<div>Timestamp: ${point.Timestamp.format('HH:mm:ss.SSS')}</div>`)
  return `<div style="font-size: x-small">${lines.join('')}</div>`
}

const groups = [
  { id: 'application', content: 'App' },
  { id: 'bus', content: 'Bus' },
  { id: 'fault', content: 'Fault' },
  { id: 'sep', content: 'SEP' },
]

const Servicecall = ({umgebung, logpoints, standalone=false}) => {
  log.trace('Servicecall called', umgebung, logpoints, standalone)

  const [data, defaultLogIds] = useMemo(() => {
    const defaultLogIds = {}

    const dataset = new DataSet(logpoints.map(point => {
      log.trace('Logpunkt ', {...point})

      if ([2, 6, 11, 53].indexOf(point.LOGPOINTNO) > -1) {
        defaultLogIds[point.LOGPOINTNO] = point.INTERNALLOGID
      }

      return {
        id: `${point.LOGPOINTNO}:${point.INTERNALLOGID}`,
        content: content(point),
        start: point.Timestamp,
        className: logpointType(point.LOGPOINTNO),
        title: title(point),
        group: logpointType(point.LOGPOINTNO)
      }
    }))

    return [dataset, defaultLogIds]
  }, [logpoints])

  const element = useRef(null)
  const {width} = useComponentSize(element)
  const [logPoint, setLogPoint] = useState(null)

  const timeline = useRef(null)

  useEffect(() => {
    log.trace('useEffect on element and width', element, width)
    if (!element || width === 0) return

    if (!timeline.current) {
      timeline.current = new Timeline(element.current, data, groups, {
        align: getConfigurationValue('presentation.timeline.alignFlag'),
        type: 'box',
        maxHeight: '500px'
      })
    }

    const onSelect = ({item}) => {
      if (!item) return

      const [logpointNo, logpointId] = item.split(':')
      if (!logpointWithMessage(logpointNo)) {
        setLogPoint(null)
      } else {
        setLogPoint({ id: logpointId, no: logpointNo })
      }
    }

    const fit = () => {
      if (width === 0) return
      log.trace('fit timeline')
      timeline.current.fit()
    }

    const onRightClick = props => {
      fit()
      props.event.preventDefault()
    }

    timeline.current.on('mouseUp', onSelect)
    timeline.current.on('contextmenu', onRightClick)

    return function cleanup () {
      timeline.current.off('mouseUp', onSelect)
      timeline.current.off('contextmenu', onRightClick)
      timeline.current.destroy()
    }
  }, [data, element, width])

  useEffect(() => {
    if (!timeline.current || width === 0) return
    log.trace('set width', width)
    timeline.current.setOptions({ width })
    timeline.current.fit()
  }, [width])

  const showDefaultLogIds = !isEmpty(defaultLogIds) && standalone
  const anzahlDefaultLogIds = Object.keys(defaultLogIds).length || 1

  log.trace('render')
  return (
    <>
      <div ref={element}/>
      {
        !logPoint && !showDefaultLogIds && (
          <>
            <div>Hinweise:</div>
            <ul>
              <li>Logpunkt anklicken, um zugehörige Nachricht abzurufen (falls eine vorhanden)</li>
              <li>Scrollen um rein- oder rauszuzoomen</li>
              <li>Rechtsklick um Zoomstufe zurückzusetzen</li>
              <li>Mit der Maus ziehen um Zeitfenster zu verschieben</li>
            </ul>
          </>
        )
      }
      {
        !logPoint && showDefaultLogIds && (
          <Row>
            {Object.keys(defaultLogIds).map(key => (
              <Col xs={12/anzahlDefaultLogIds} key={key}>
                <WordWrap>
                  {defaultLogIds[key] && <MessageFromLogpoint umgebung={umgebung} logpointNo={parseInt(key, 10)} id={defaultLogIds[key]} /> }
                </WordWrap>
              </Col>
            ))}
          </Row>
        )
      }
      {logPoint && <MessageFromLogpoint umgebung={umgebung} logpointNo={logPoint.no} id={logPoint.id} />}
    </>
  )
}

Servicecall.whyDidYouRender = true

export default Servicecall

Servicecall.propTypes = {
  logpoints: PropTypes.any.isRequired,
  umgebung: PropTypes.string.isRequired,
  standalone: PropTypes.bool,
}
