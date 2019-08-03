import React from 'react'
import { Route, Redirect } from 'react-router-dom'
import { connect } from 'react-redux'
import Log from './log'
import { checkValidUser } from './logic/authorization'

const log = Log('routeunauthenticated')

function querystring(name, url = window.location.href) {
  name = name.replace(/[[]]/g, "\\$&");

  const regex = new RegExp("[?&]" + name + "(=([^&#]*)|&|#|$)", "i");
  const results = regex.exec(url);

  if (!results) {
    return null;
  }
  if (!results[2]) {
    return "";
  }

  return decodeURIComponent(results[2].replace(/\+/g, " "));
}

const RouteUnauthenticated = ({component: C, ...props}) => {
  const {user, ...rest} = props
  const redirect = querystring("redirect")
  log.trace('unauthentifizierte route', { redirect, user, rest, C })

  return (
    <Route
      {...rest}
      render={() => {
        if (checkValidUser(user)) {
          return (
            <Redirect to={redirect === "" || redirect === null ? "/" : redirect} />
          )
        }

        return <C {...rest} />
      }}
    />
  )
}

export default connect(
  state => ({
    user: state.user,
  })
)(RouteUnauthenticated)
