import { Navigate, useLocation, Outlet } from 'react-router-dom'
import { connect } from 'react-redux'
import { checkValidUser } from './logic/authorization'

const ProtectedRoute = ({ user, children }) => {

  const location = useLocation()

  if (!checkValidUser(user)) {
    // user is not authenticated
    return <Navigate to="/login" replace state={{ from: location }}/>
  }

  return <Outlet />
}

export default connect(
  state => ({
    user: state.user,
  })
)(ProtectedRoute)
