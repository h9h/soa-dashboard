import React from 'react'
import { Smaller } from '../styles'
import CopyToClipboard from '../CopyToClipboard'
import { getDashboardRoute } from '../../logic/routes'
import { LOG_SEARCH_TYPES } from '../../logic/store'
import { getClientUrl } from '../../logic/api/rest-api-local'
import { once } from 'ramda'
import { notification } from '../../logic/notification'

const url = once(() => getClientUrl())()

const ServiceOperation = ({row}) => {
  const so = Array.isArray(row.value) ? row.value : row.value.split(':').map(t => t.trim())
  const component = (
    <>
      <Smaller key={0}>{so[0]}</Smaller>
      <br/>
      <Smaller key={1}>{so[1]}</Smaller>
    </>
  )

  const values = row.aggregated ? row.subRows[0] : row.row
  if (!values.filter) return (
    <CopyToClipboard text={so[0]} onCopy={() => notification({
      nachricht: 'Service-Name in Zwischenablage kopiert'
    })}>
      {component}
    </CopyToClipboard>
  )

  const { umgebung, datum, von, bis } = values.filter
  const route = getDashboardRoute(umgebung, datum, von, bis)(LOG_SEARCH_TYPES.MESSAGEID, values.MESSAGEID)

  return (
    <CopyToClipboard
      text={`${url}/#${route}`}
      onCopy={() => notification({
        nachricht: 'Link zum Call in Zwischenablage kopiert'
      })}
    >
      {component}
    </CopyToClipboard>
  )
}

export default ServiceOperation
