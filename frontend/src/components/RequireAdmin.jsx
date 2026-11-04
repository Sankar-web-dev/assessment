import { useSelector } from 'react-redux'
import { Navigate, useLocation } from 'react-router-dom'

// Route guard for the admin area — guests go to the login page with the Admin
// tab preselected; signed-in non-admin users are sent back to the storefront.
export default function RequireAdmin({ children }) {
  const { token, user } = useSelector((s) => s.auth)
  const location = useLocation()

  if (!token) {
    return (
      <Navigate
        to="/login"
        state={{ from: location.pathname, role: 'admin' }}
        replace
      />
    )
  }
  if (user?.role !== 'admin') {
    return <Navigate to="/products" replace />
  }
  return children
}
