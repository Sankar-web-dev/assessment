import { useEffect, useState } from 'react'
import { useSelector } from 'react-redux'
import { useNavigate, useLocation } from 'react-router-dom'
import LoginForm from '../components/LoginForm'
import AdminLogin from './admin/AdminLogin'
import './admin/admin.css'

// Sign-in page with Customer / Admin tabs. After auth, admins land in the
// admin area and shoppers return to the page that sent them here.
const TABS = [
  { id: 'customer', label: 'Customer' },
  { id: 'admin', label: 'Admin' },
]

export default function LoginPage() {
  const { token, user } = useSelector((s) => s.auth)
  const navigate = useNavigate()
  const location = useLocation()
  const [tab, setTab] = useState(
    location.state?.role === 'admin' ? 'admin' : 'customer',
  )

  useEffect(() => {
    if (!token) return
    let dest = location.state?.from || '/products'
    if (user?.role === 'admin') {
      dest = dest.startsWith('/admin') ? dest : '/admin'
    } else if (dest.startsWith('/admin')) {
      dest = '/products'
    }
    navigate(dest, { replace: true })
  }, [token, user, navigate, location.state])

  const switcher = (
    <div className="admin__seg" role="tablist">
      {TABS.map((t) => (
        <button
          key={t.id}
          type="button"
          role="tab"
          aria-selected={tab === t.id}
          className={`admin__seg-btn${tab === t.id ? ' is-active' : ''}`}
          onClick={() => setTab(t.id)}
        >
          {t.label}
        </button>
      ))}
    </div>
  )

  return (
    <div className="page">
      <div className="container">
        <div className="admin__head admin__head--center">
          <h1 className="page-title">Sign in</h1>
        </div>
        {tab === 'customer' ? (
          <LoginForm header={switcher} />
        ) : (
          <AdminLogin header={switcher} />
        )}
      </div>
    </div>
  )
}
