import { useState } from 'react'
import { Link, NavLink, useLocation, useNavigate } from 'react-router-dom'
import { useDispatch, useSelector } from 'react-redux'
import { selectCartItemCount } from '../store/selectors'
import { setSearch } from '../store/productsSlice'
import { logout } from '../store/authSlice'
import Icon from './Icon'
import ThemeToggle from './ThemeToggle'
import './Header.css'

const NAV = [
  { to: '/', label: 'Home', match: '' },
  { to: '/?view=products', label: 'Products', match: 'view=products' },
  { to: '/?cat=gaming', label: 'Gaming', match: 'cat=gaming' },
  { to: '/?sort=deals', label: 'Deals', match: 'sort=deals' },
  { to: '/#about', label: 'About', match: 'hash' },
]

export default function Header() {
  const count = useSelector(selectCartItemCount)
  const search = useSelector((s) => s.products.search)
  const { token, user } = useSelector((s) => s.auth)
  const isAdmin = user?.role === 'admin'
  const dispatch = useDispatch()
  const navigate = useNavigate()
  const location = useLocation()
  const [menuOpen, setMenuOpen] = useState(false)
  const closeMenu = () => setMenuOpen(false)

  const isActive = (match) =>
    location.pathname === '/' &&
    (match === 'hash'
      ? location.hash === '#about'
      : match
        ? location.search.includes(match)
        : location.search === '' && location.hash === '')

  return (
    <header className="header">
      <div className="container header__inner">
        <Link to="/" className="header__logo" aria-label="VoltNex home">
          <span className="header__logo-mark">
            <Icon name="zap" size={16} filled />
          </span>
          <span className="header__logo-text">
            Volt<em>Nex</em>
          </span>
        </Link>

        <nav className="header__nav header__nav--main" aria-label="Categories">
          {NAV.map((item) => (
            <Link
              key={item.label}
              to={item.to}
              className={`header__link${isActive(item.match) ? ' active' : ''}`}
            >
              {item.label}
            </Link>
          ))}
        </nav>

        {!isAdmin && (
          <form
            className="header__search"
            role="search"
            onSubmit={(e) => {
              e.preventDefault()
              navigate('/')
            }}
          >
            <Icon name="search" size={20} />
            <input
              type="search"
              placeholder="Search products…"
              value={search}
              onChange={(e) => dispatch(setSearch(e.target.value))}
              aria-label="Search products"
            />
          </form>
        )}

        {/* Compact cart shortcut — visible in the bar on mobile only */}
        {!isAdmin && (
          <NavLink to="/cart" className="header__cart header__cart--bar">
            <Icon name="cart" size={20} />
            <span>Cart</span>
            {count > 0 && <span className="header__cart-count">{count}</span>}
          </NavLink>
        )}

        <button
          type="button"
          className="header__menu-btn"
          aria-label={menuOpen ? 'Close menu' : 'Open menu'}
          aria-expanded={menuOpen}
          aria-controls="header-nav"
          onClick={() => setMenuOpen((o) => !o)}
        >
          <Icon name={menuOpen ? 'x' : 'menu'} size={22} />
        </button>

        <nav
          className={`header__nav${menuOpen ? ' is-open' : ''}`}
          id="header-nav"
          aria-label="Account"
        >
          {/* Category links — only rendered inside the mobile dropdown */}
          {!isAdmin &&
            NAV.map((item) => (
              <Link
                key={item.label}
                to={item.to}
                className={`header__link header__link--mobile${isActive(item.match) ? ' active' : ''}`}
                onClick={closeMenu}
              >
                {item.label}
              </Link>
            ))}
          {!isAdmin && token && (
            <NavLink to="/orders" className="header__link" onClick={closeMenu}>
              Orders
            </NavLink>
          )}
          <NavLink to="/admin" className="header__link" onClick={closeMenu}>
            Admin
          </NavLink>
          {!isAdmin && (
            <NavLink to="/cart" className="header__cart" onClick={closeMenu}>
              <Icon name="cart" size={20} />
              <span>Cart</span>
              {count > 0 && <span className="header__cart-count">{count}</span>}
            </NavLink>
          )}
          <ThemeToggle />
          {token ? (
            <div className="header__account">
              <span className="header__avatar" aria-hidden="true">
                {(user?.name || user?.email || '?').charAt(0).toUpperCase()}
              </span>
              <span className="header__user">{user?.name || user?.email}</span>
              <button
                type="button"
                className="header__logout"
                onClick={() => {
                  dispatch(logout())
                  navigate('/')
                  closeMenu()
                }}
              >
                Sign out
              </button>
            </div>
          ) : (
            <NavLink
              to="/login"
              className="header__link header__signin"
              onClick={closeMenu}
            >
              Sign in
            </NavLink>
          )}
        </nav>
      </div>
    </header>
  )
}
