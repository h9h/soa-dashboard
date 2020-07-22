import React from 'react'
import styled from 'styled-components'
import { equals, groupWith, once, partition } from 'ramda'
import { Black, Blue, Centered, Red, Green, Small, Smaller } from '../styles'
import { logpointDirection, logpointToNumber, logpointType, LP_TYPES, sortLogpunkte } from '../../logic/logpunkt'
import Log from '../../log'
import withLinkToTimeline from '../withLinkToTimeline'
import { getConfigurationValue } from '../../logic/configuration'

const log = Log('logpointnummer')

const COLORS = {
  [LP_TYPES.APPLICATION]: Black,
  [LP_TYPES.FAULT]: Red,
  [LP_TYPES.BUS]: Blue,
  [LP_TYPES.SEP]: Green
}

const Block = styled.span`
  text-align: center;
`

const isRequest = point => logpointDirection(point) === 'request'

const isEnter = point => [8, 17, 18, 57].indexOf(point) > -1
const isExit = point => [1, 2, 11].indexOf(point) > -1

const LogBlock = styled.span`
  width: 1.5em;
  text-align: center;
  display: inline-block;
  vertical-align: ${props => props.verticalSeparation ? (props.isRequest ? "super" : "sub") : "baseline"};
  border-top: ${props => props.isRequest ? "1px solid" : "hidden"};
  border-bottom: ${props => props.isRequest ? "hidden" : "1px solid"};
  border-right: ${props => props.isEnter ? "1px solid" : "hidden"};
  border-left: ${props => props.isExit ? "1px solid" : "hidden"};
`

const DecoratedBlock = ({ point, children }) => {
  const verticalSeparation = once(() => getConfigurationValue('presentation.logpoints.verticalSeparation') === 'true')()

  return <LogBlock verticalSeparation={verticalSeparation} isRequest={isRequest(point)} isEnter={isEnter(point)} isExit={isExit(point)}>{children}</LogBlock>
}

const LogPoint = ({ point, description = null }) => {
  const Color = description && description.startsWith('Fault') ? Red : COLORS[logpointType(point)]

  return (
    <Color>
      <Block>{point}</Block>
      {description &&
        <>
          <br/>
          <Small>
            {description}
          </Small>
        </>
      }
    </Color>

  )
}

const AggregatedLogPoint = ({ decoratedPoint, point, description = null }) => {
  const Color = description && description.startsWith('Fault') ? Red : COLORS[logpointType(point)]

  return (
    <Color>
      <Smaller>
        <DecoratedBlock point={point}>{decoratedPoint}</DecoratedBlock>
      </Smaller>
    </Color>
  )
}

const description = (row, no) => {
  try {
    const theRow = row.subRows.filter(r => r.LOGPOINTNO === no)
    if (theRow.length > 0) return theRow[0].DESCRIPTION
    return null
  } catch (err) {
    log.error('Error getting description for logpoint', row, no, err)
    return null
  }
}

export const LogpointNummer = ({row}) => {
  if (row.aggregated) {
    const subRows = row.subRows
    const [app, bus] = partition(r => logpointType(r.LOGPOINTNO) === LP_TYPES.APPLICATION, subRows.sort(sortLogpunkte))

    const rows = []
    let i = 0
    let j = 0
    while(i < app.length || j < bus.length) {
      const val0 = i < app.length ? app[i].LOGPOINTNO : null
      const val1 = j < bus.length ? bus[j].LOGPOINTNO : null
      if (val0 && val0 < val1) {
        rows.push(val0)
        i++
      } else if (val1) {
        rows.push(val1)
        j++
      } else {
        rows.push(val0)
        i++
      }
    }

    const groups = groupWith(equals, rows)
    const decoratedPoints = groups.map(n => n[0] + (n.length > 1 ? '\u2026' : '')) // Wiederholungen durch Ellipsis ersetzen
    const points = decoratedPoints.map(logpointToNumber)

    return (
      <Centered>
        {points.map((no, i) =>
          <AggregatedLogPoint
            key={i + 20}
            decoratedPoint={decoratedPoints[i]}
            point={no}
            description={description(row, no)}
          />
        )}
      </Centered>
    )
  }

  return (
    <Centered>
      <LogPoint point={row.value} description={row.row.DESCRIPTION} />
    </Centered>
  )
}

export default withLinkToTimeline(LogpointNummer)
