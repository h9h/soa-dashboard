import React from 'react'
import styled from 'styled-components'
import { Centered, Red, SmallX } from '../styles'
import { MEP_NAMES } from '../../logic/mep'
import { calculateTimingFromRows } from '../../logic/calltiming'
import Rahmen from '../Rahmen'
import withLinkToTimeline from '../withLinkToTimeline'

const Millis = styled.span`
  background: ${props => props.ms === '-' ? 'inherit': props.ms > 999 ? 'red' : props.ms > 499 ? 'yellow' : 'green'};
  color: ${props => props.ms === '-' ? 'grey': props.ms > 999 ? 'white' : props.ms > 499 ? 'black' : 'white'};
`

const Verarbeitung = (props) => {
  const { timing: { busProvider, provider }} = props

  if (provider === '-') return <span>[{busProvider}]</span>

  const verarbeitungText = ` [${busProvider} / ${provider}] `

  if (Math.abs(busProvider - provider) > 1500) return <Red>{verarbeitungText}</Red>

  return <span>{verarbeitungText}</span>
}

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
        {` ${timing.busIn} ${requestArrow} ` }
        <Verarbeitung timing={timing}/>
        { ` ${responseArrow} ${timing.busOut} `}
        </Rahmen>
      </SmallX>
    </Centered>
  )
}

export default withLinkToTimeline(Timing)
