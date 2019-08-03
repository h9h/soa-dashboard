import React from 'react'
import { Route, Redirect } from 'react-router-dom'
import { connect } from 'react-redux'
import Log from './log'
import { checkValidUser } from './logic/authorization'

const log = Log('routeauthenticated')

const RouteAuthenticated = ({component: C, ...props}) => {
  const {user, ...rest} = props
  log.trace('authentifizierte route', { user, rest, C })

  return (
    <Route
      {...rest}
      render={props => {
        if (checkValidUser(user)) {
          return <C {...props} />
        }

        return (
          <Redirect
            to={`/login?redirect=${props.location.pathname}${props.location.search}`}
          />
        )
      }}
    />
  )
}

export default connect(
  state => ({
    user: state.user,
  })
)(RouteAuthenticated)
