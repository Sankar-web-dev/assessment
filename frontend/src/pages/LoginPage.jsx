import { useEffect } from 'react'
import { useSelector } from 'react-redux'
import { useNavigate, useLocation } from 'react-router-dom'
import LoginForm from '../components/LoginForm'
import './admin/admin.css'

// Generic sign-in page for shoppers (checkout requires an account).
// Redirects back to the page that sent us (e.g. /cart) after login.
export default function LoginPage() {
  const token = useSelector((s) => s.auth.token)
  const navigate = useNavigate()
  const location = useLocation()

  useEffect(() => {
    if (token) {
      navigate(location.state?.from || '/products', { replace: true })
    }
  }, [token, navigate, location.state])

  return (
    <div className="page">
      <div className="container">
        <div className="admin__head">
          <h1 className="page-title">Sign in</h1>
        </div>
        <LoginForm />
      </div>
    </div>
  )
}
