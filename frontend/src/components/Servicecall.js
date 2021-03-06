import PropTypes from 'prop-types'
import React, { useEffect, useRef, useState, useMemo } from 'react'
import Row from 'react-bootstrap/Row'
import Col from 'react-bootstrap/Col'
import { DataSet, Timeline } from 'vis-timeline/standalone'
import useComponentSize from '@rehooks/component-size'
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

function initTimeline (timeline, element, data) {
  if (!timeline.current) {
    timeline.current = new Timeline(element.current, data, groups, {
      align: getConfigurationValue('presentation.timeline.alignFlag'),
      type: 'box',
      maxHeight: '500px'
    })
  }
}

const Servicecall = ({umgebung, logpoints, standalone=false}) => {
  log.trace('Servicecall called', umgebung, logpoints, standalone)

  const [data, defaultLogIds] = useMemo(() => {
    // 1: insert potentielle Logpunkte mit Nachricht, damit Reihenfolge klar ist:
    const defaultLogIds = new Map([2, 6, 11, 53, 82, 75, 86, 71].map(key => [key, null]))

    const dataset = new DataSet(logpoints.map(point => {
      log.trace('Logpunkt ', {...point})

      if ([2, 6, 11, 53, 82, 75].indexOf(point.LOGPOINTNO) > -1) {
        // 2: setzte Inhalt für Logpunkt mit Nachricht:
        defaultLogIds.set(point.LOGPOINTNO, point.INTERNALLOGID)
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

  // 3: lösche alle Schlüssel, zu denen es doch keinen Logpunkt gab:
  defaultLogIds.forEach((v, k, map) => !v && map.delete(k))

  const element = useRef(null)
  const {width} = useComponentSize(element)
  const [logPoint, setLogPoint] = useState(null)

  const timeline = useRef(null) // useMemo(() => ({ current: null }), []) // useRef(null)

  useEffect(() => {
    log.trace('useEffect on element', element)
    if (!element) return

    initTimeline(timeline, element, data)
  }, [data, element, timeline])

  useEffect(() => {
    log.trace('useEffect on element and width', element, width)
    if (!element || width === 0) return

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

    const tref = timeline.current

    tref.on('mouseUp', onSelect)
    tref.on('contextmenu', onRightClick)

    return function cleanup () {
      // try {
      //   tref.off('mouseUp', onSelect)
      //   tref.off('contextmenu', onRightClick)
      //   tref.destroy()
      // } catch (e) {
      //   log.info('in timeline cleanup', e)
      // }
    }
  }, [data, element, timeline, width])

  useEffect(() => {
    if (!timeline.current || width === 0) return
    log.trace('set width', width)
    try {
      timeline.current.setOptions({width})
      timeline.current.fit()
    } catch (e) {
      log.info('in set width', e)
    }
  }, [data, timeline, width])

  const showDefaultLogIds = defaultLogIds.size > 0 // && standalone
  const anzahlDefaultLogIds = defaultLogIds.size || 1

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
            {Array.from(defaultLogIds).map(([key, value]) => (
              <Col xs={12/anzahlDefaultLogIds} key={'' + key}>
                <WordWrap>
                  {value && <MessageFromLogpoint umgebung={umgebung} logpointNo={key} id={value} /> }
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
