import { NavLink, Outlet } from 'react-router-dom'
import { useDispatch, useSelector } from 'react-redux'
import { logout } from '../../store/authSlice'
import AdminLogin from './AdminLogin'
import './admin.css'

const LINKS = [
  { to: '/admin/products', label: 'Products' },
  { to: '/admin/categories', label: 'Categories' },
  { to: '/admin/coupons', label: 'Coupons' },
  { to: '/admin/orders', label: 'Orders' },
]

export default function AdminLayout() {
  const dispatch = useDispatch()
  const { token, user } = useSelector((s) => s.auth)

  if (!token) {
    return (
      <div className="page">
        <div className="container">
          <div className="admin__head">
            <h1 className="page-title">Admin</h1>
          </div>
          <AdminLogin />
        </div>
      </div>
    )
  }

  return (
    <div className="page">
      <div className="container">
        <div className="admin__head admin__head--row">
          <h1 className="page-title">Admin</h1>
          <div className="admin__user">
            <span className="muted">{user?.name || user?.email}</span>
            <button
              type="button"
              className="btn btn--ghost btn--sm"
              onClick={() => dispatch(logout())}
            >
              Sign out
            </button>
          </div>
        </div>
        <nav className="admin__tabs">
          {LINKS.map((l) => (
            <NavLink
              key={l.to}
              to={l.to}
              className={({ isActive }) =>
                `admin__tab${isActive ? ' is-active' : ''}`
              }
            >
              {l.label}
            </NavLink>
          ))}
        </nav>
        <div style={{ marginTop: 'var(--space-6)' }}>
          <Outlet />
        </div>
      </div>
    </div>
  )
}
