import { NavLink, Outlet } from 'react-router-dom'
import { useSelector } from 'react-redux'
import AdminLogin from './AdminLogin'
import './admin.css'

const LINKS = [
  { to: '/admin/analytics', label: 'Analytics' },
  { to: '/admin/products', label: 'Products' },
  { to: '/admin/categories', label: 'Categories' },
  { to: '/admin/coupons', label: 'Coupons' },
  { to: '/admin/orders', label: 'Orders' },
  { to: '/admin/customers', label: 'Customers' },
]

export default function AdminLayout() {
  const { token, user } = useSelector((s) => s.auth)

  if (!token || user?.role !== 'admin') {
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
        <div className="admin__head">
          <h1 className="page-title">Admin Dashboard</h1>
          <p className="muted">
            Manage products, categories, coupons, orders and customers.
          </p>
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
