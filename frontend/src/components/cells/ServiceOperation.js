import React from 'react'
import { Smaller } from '../styles'
import { CopyMessageToClipboard } from '../CopyToClipboard'
import { getDashboardRoute } from '../../logic/routes'
import { LOG_SEARCH_TYPES } from '../../logic/store'
import { getClientUrl } from '../../logic/api/rest-api-local'
import { once } from 'ramda'

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
  if (!values.filter) return component

  const { umgebung, datum, von, bis } = values.filter
  const route = getDashboardRoute(umgebung, datum, von, bis)(LOG_SEARCH_TYPES.MESSAGEID, values.MESSAGEID)

  return (
    <CopyMessageToClipboard
      textToBeCopied={`${url}/#${route}`}
      meldung="Link zum Call in Zwischenablage kopiert"
    >
      {component}
    </CopyMessageToClipboard>
  )
}

export default ServiceOperation
