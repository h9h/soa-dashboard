import React from 'react'
import Button from 'react-bootstrap/Button'
import { Smaller } from '../styles'
import { logpointWithMessage } from '../../logic/logpunkt'

const Simple = ({ time }) => <Smaller>{time.split('T').map(t => <div key={t}>{t}</div>)}</Smaller>

const Timestamp = ({row, onClick}) => {
  const time = row.value.format('YYYY-MM-DDTHH:mm:ss.SSS')

  if (!onClick) return (
    <Simple time={time} />
  )

  const logpoint = parseInt(row.row.LOGPOINTNO, 10)
  if (logpointWithMessage(logpoint)) {
    return (
        <Button
          variant="link"
          size="sm"
          onClick={(event) => {
            event.preventDefault()
            event.stopPropagation()
            onClick({
              component: 'Timestamp',
              row
            })
          }
          }>
          <Simple time={time} />
        </Button>
    )
  } else {
    return (
      <Simple time={time} />
    )
  }
}

export default Timestamp
