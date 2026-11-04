import { useSelector } from 'react-redux'
import { Navigate, useLocation } from 'react-router-dom'

// Route guard for the storefront — shoppers must be signed in. The page they
// tried to visit is passed along so LoginPage can send them back after auth.
export default function RequireAuth({ children }) {
  const token = useSelector((s) => s.auth.token)
  const location = useLocation()

  if (!token) {
    return (
      <Navigate
        to="/login"
        state={{ from: location.pathname + location.search }}
        replace
      />
    )
  }
  return children
}
