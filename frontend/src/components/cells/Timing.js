import React from 'react'
import styled from 'styled-components'
import { Centered, SmallX } from '../styles'
import { MEP_NAMES } from '../../logic/mep'
import { calculateTimingFromRows } from '../../logic/calltiming'
import Rahmen from '../Rahmen'
import withLinkToTimeline from '../withLinkToTimeline'

const Millis = styled.span`
  background: ${props => props.ms === '-' ? 'inherit': props.ms > 999 ? 'red' : props.ms > 499 ? 'yellow' : 'green'};
  color: ${props => props.ms === '-' ? 'grey': props.ms > 999 ? 'white' : props.ms > 499 ? 'black' : 'white'};
`

export const Timing = ({row}) => {
  if (!row || !row.aggregated) return null

  const subRows = row.subRows
  const {mep, timing} = calculateTimingFromRows(subRows)

  const requestArrow = (mep === MEP_NAMES.fireAndForget || mep === MEP_NAMES.requestCallback) ? '⥂' : '→'
  const responseArrow = mep === MEP_NAMES.requestCallback ? '⟿' : '→'

  return (
    <Centered>
      <SmallX>
        <div>
          <Millis ms={timing.antwort}>Antwortzeit: {timing.antwort}{timing.consumer !== '-' ? ` / ${timing.consumer}` : null} ms</Millis>
        </div>
      </SmallX>
      <SmallX>
        <Rahmen>
        {` ${timing.busIn} ${requestArrow} [${timing.busProvider}${timing.provider !== '-' ? ' / ' + timing.provider : ''}] ${responseArrow} ${timing.busOut} `}
        </Rahmen>
      </SmallX>
    </Centered>
  )
}

export default withLinkToTimeline(Timing)
