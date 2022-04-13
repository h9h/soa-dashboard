import React from 'react'
import Form from 'react-bootstrap/Form'
import ButtonWithTip from '../ButtonWithTip'
import { getDashboardRoute } from '../../logic/routes'
import { LOG_SEARCH_TYPES } from '../../logic/store'
import { withRouter } from 'react-router-dom'
import moment from 'moment'

const JumpToCall = ({ row }) => {
  const buttons = [routeToCall]
  return <ButtonRow row={row} buttons={buttons} />
}

export default JumpToCall

const routeToCall = row => {
  console.log(row)
  const values = row.original
  const filter = values.filter
  if (!filter) return null

  const timestamp = values.Timestamp
  const datum = timestamp.format('YYYY-MM-DD')
  const von = moment(timestamp).subtract(5, 'minutes').format('HH:mm:ss')
  const bis = moment(timestamp).add(5, 'minutes').format('HH:mm:ss')
  const { umgebung } = values.filter
  const route = getDashboardRoute(umgebung, datum, von, bis)(LOG_SEARCH_TYPES.MESSAGEID, values.MESSAGEID)

  return {
    glyph: 'routeToCall',
    title: 'Absprung',
    description: 'Absprung zum Service-Call',
    handleClick: history => () => history.push(`${route}`)
  }
}

const WrappedAktion = withRouter(({ button, history }) => (
  <ButtonWithTip
    title={button.title}
    description={button.description}
    glyph={button.glyph}
    handleClick={button.handleClick(history)}
    variant="light"
    size="sm"
  />
))

const ButtonRow = ({ row, buttons }) => (
  <Form inline>
    {buttons.map(b => b(row)).filter(b => b).map(button => <WrappedAktion key={button.title} button={button} />)}
  </Form>
)
