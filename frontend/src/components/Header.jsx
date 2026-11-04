import { useState } from 'react'
import { Link, NavLink, useLocation, useNavigate } from 'react-router-dom'
import { useDispatch, useSelector } from 'react-redux'
import { selectCartItemCount } from '../store/selectors'
import { setSearch } from '../store/productsSlice'
import { logout } from '../store/authSlice'
import Icon from './Icon'
import ThemeToggle from './ThemeToggle'
import './Header.css'

export default function Header() {
  const count = useSelector(selectCartItemCount)
  const wishCount = useSelector((s) => Object.keys(s.wishlist.items).length)
  const search = useSelector((s) => s.products.search)
  const { token, user } = useSelector((s) => s.auth)
  const isAdmin = user?.role === 'admin'
  const dispatch = useDispatch()
  const navigate = useNavigate()
  const location = useLocation()
  const [menuOpen, setMenuOpen] = useState(false)
  const closeMenu = () => setMenuOpen(false)

  // Storefront nav — shown only for signed-in shoppers (admins use the
  // admin area's own tabs).
  const navItems =
    token && !isAdmin
      ? [
          { to: '/products', label: 'Products' },
          { to: '/orders', label: 'Orders' },
        ]
      : []

  const isActive = (to) => location.pathname.startsWith(to)

  return (
    <header className="header">
      <div className="container header__inner">
        <Link to="/landing" className="header__logo" aria-label="VoltNex home">
          <span className="header__logo-mark">
            <Icon name="zap" size={16} filled />
          </span>
          <span className="header__logo-text">
            Volt<em>Nex</em>
          </span>
        </Link>

        {token && !isAdmin && (
          <form
            className="header__search"
            role="search"
            onSubmit={(e) => {
              e.preventDefault()
              navigate('/products')
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

        <div className="header__actions">
          {/* Compact cart shortcut — visible in the bar on mobile only */}
          {token && !isAdmin && (
            <NavLink to="/cart" className="header__cart header__cart--bar">
              <Icon name="cart" size={20} />
              <span>Cart</span>
              {count > 0 && <span className="header__cart-count">{count}</span>}
            </NavLink>
          )}

          <nav
            className={`header__nav${menuOpen ? ' is-open' : ''}`}
            id="header-nav"
            aria-label="Account"
          >
            {navItems.map((item) => (
              <Link
                key={item.label}
                to={item.to}
                className={`header__link${isActive(item.to) ? ' active' : ''}`}
                onClick={closeMenu}
              >
                {item.label}
              </Link>
            ))}
            {token && !isAdmin && (
              <NavLink to="/wishlist" className="header__cart" onClick={closeMenu} aria-label="Wishlist">
                <Icon name="heart" size={20} />
                <span>Wishlist</span>
                {wishCount > 0 && (
                  <span className="header__cart-count">{wishCount}</span>
                )}
              </NavLink>
            )}
            {token && !isAdmin && (
              <NavLink to="/cart" className="header__cart" onClick={closeMenu}>
                <Icon name="cart" size={20} />
                <span>Cart</span>
                {count > 0 && <span className="header__cart-count">{count}</span>}
              </NavLink>
            )}
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
                    navigate('/landing')
                    closeMenu()
                  }}
                >
                  Sign out
                </button>
              </div>
            ) : (
              <NavLink
                to="/login"
                className="header__link header__login"
                onClick={closeMenu}
              >
                Login
              </NavLink>
            )}
          </nav>

          <ThemeToggle />

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
        </div>
      </div>
    </header>
  )
}
