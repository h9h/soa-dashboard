import React from 'react'
import styled from 'styled-components'
import { Link } from 'react-router-dom'
import { getMessageRoute } from '../logic/routes'

export const getCallTimingHandler = (row, onClick) => {
  const filter = row.subRows ? row.subRows[0].filter : row.filter
  if (!filter) {
    return {
      route: null,
      asNewPage: null,
      handler: null
    }
  }
  const {umgebung, datum, von, bis} = filter
  const messageId = row.row.MESSAGEID
  const route = getMessageRoute(umgebung, datum, von, bis, messageId)

  return {
    route,
    asNewPage: !onClick,
    handler: () => {
      if (onClick) {
        onClick({
          component: 'LogpointAction',
          row
        })
      } else {
        const linkToClick = document.getElementById(route)
        linkToClick.click()
      }
    }
  }
}

const Clickable = styled.span`
  cursor: ${props => props.asNewPage ? "alias": "pointer"};
`

function withLinkToTimeline(WrappedCmponent) {
  return props => {

    const {row, onClick, ...rest} = props

    const {route, asNewPage ,handler} = getCallTimingHandler(row, onClick)
    if (!route) {
      return <WrappedCmponent row={row} {...rest} />
    }

    return (
      <Clickable asNewPage={asNewPage} onClick={handler}>
        {asNewPage && <Link id={route} to={route} target="_blank"/>}
        <WrappedCmponent row={row} {...rest} />
      </Clickable>
    )
  }
}

export default withLinkToTimeline
