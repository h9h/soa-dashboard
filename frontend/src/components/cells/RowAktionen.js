import React from 'react'
import Form from 'react-bootstrap/Form'
import ButtonWithTip from '../ButtonWithTip'
import { getClientUrl } from '../../logic/api/rest-api-local'
import { once } from 'ramda'
import { getDashboardRoute } from '../../logic/routes'
import { LOG_SEARCH_TYPES } from '../../logic/store'
import withRouter from '../../withRouter'
import { withNotification } from '../../logic/notification'
import copy from 'copy-to-clipboard'

const url = once(() => getClientUrl())()

const RowAktionen = ({ row }) => {
  const buttons = row.aggregated ? [copyRoute, routeToCall] : []
  return <ButtonRow row={row} buttons={buttons} />
}

export default RowAktionen

const routeToCall = row => {
  const values = row.aggregated ? row.subRows[0] : row.row
  if (!values.filter) return null

  const { umgebung, datum, von, bis } = values.filter
  const route = getDashboardRoute(umgebung, datum, von, bis)(LOG_SEARCH_TYPES.MESSAGEID, values.MESSAGEID)

  return {
    glyph: 'routeToCall',
    title: 'Absprung',
    description: 'Absprung zum Service-Call',
    handleClick: history => () => history.push(`${route}`)
  }
}

const copyRoute = row => {
  const values = row.aggregated ? row.subRows[0] : row.row
  if (!values.filter) return null
  const { umgebung, datum, von, bis } = values.filter
  const route = getDashboardRoute(umgebung, datum, von, bis)(LOG_SEARCH_TYPES.MESSAGEID, values.MESSAGEID)

  return {
    glyph: 'copyRoute',
    title: 'Link',
    description: 'Kopiere Link zum Service-Call',
    handleClick: () => () => withNotification({
      nachricht: (
        <div>
          Link wurde in die Zwischenablage kopiert
          <br />
          {url}#{route}
        </div>
      ),
      fn: copy(`${url}#${route}`)
    })
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
  <Form  className="d-flex">
    {buttons.map(b => b(row)).filter(b => b).map(button => <WrappedAktion key={button.title} button={button} />)}
  </Form>
)
