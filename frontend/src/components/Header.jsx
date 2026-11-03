import { Link, NavLink, useNavigate } from 'react-router-dom'
import { useDispatch, useSelector } from 'react-redux'
import { selectCartItemCount } from '../store/selectors'
import { setSearch } from '../store/productsSlice'
import { logout } from '../store/authSlice'
import Icon from './Icon'
import './Header.css'

export default function Header() {
  const count = useSelector(selectCartItemCount)
  const search = useSelector((s) => s.products.search)
  const { token, user } = useSelector((s) => s.auth)
  const isAdmin = user?.role === 'admin'
  const dispatch = useDispatch()
  const navigate = useNavigate()

  return (
    <header className="header">
      <div className="container header__inner">
        <Link to="/" className="header__logo" aria-label="Kadai Store home">
          <span className="header__logo-mark">K</span>
          <span className="header__logo-text">Kadai.</span>
        </Link>

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
              placeholder="Search for products, brands and more"
              value={search}
              onChange={(e) => dispatch(setSearch(e.target.value))}
              aria-label="Search products"
            />
          </form>
        )}

        <nav className="header__nav">
          {!isAdmin && (
            <>
              <NavLink to="/" className="header__link">
                Products
              </NavLink>
              {token && (
                <NavLink to="/orders" className="header__link">
                  Orders
                </NavLink>
              )}
            </>
          )}
          <NavLink to="/admin" className="header__link">
            Admin
          </NavLink>
          {!isAdmin && (
            <NavLink to="/cart" className="header__cart">
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
              <span className="header__user">
                {user?.name || user?.email}
              </span>
              <button
                type="button"
                className="header__logout"
                onClick={() => {
                  dispatch(logout())
                  navigate('/')
                }}
              >
                Sign out
              </button>
            </div>
          ) : (
            <NavLink to="/login" className="header__link header__signin">
              Sign in
            </NavLink>
          )}
        </nav>
      </div>
    </header>
  )
}
