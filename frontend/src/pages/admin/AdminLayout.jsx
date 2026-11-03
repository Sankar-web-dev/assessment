import { NavLink, Outlet } from 'react-router-dom'
import './admin.css'

const LINKS = [
  { to: '/admin/products', label: 'Products' },
  { to: '/admin/categories', label: 'Categories' },
  { to: '/admin/coupons', label: 'Coupons' },
]

export default function AdminLayout() {
  return (
    <div className="page">
      <div className="container">
        <div className="admin__head">
          <h1 className="page-title">Admin</h1>
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
        </div>
        <Outlet />
      </div>
    </div>
  )
}
