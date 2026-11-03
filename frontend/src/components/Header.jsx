import { Link, NavLink, useLocation, useNavigate } from 'react-router-dom'
import { useDispatch, useSelector } from 'react-redux'
import { selectCartItemCount } from '../store/selectors'
import { setSearch } from '../store/productsSlice'
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
  const dispatch = useDispatch()
  const navigate = useNavigate()
  const location = useLocation()

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

        <nav className="header__nav" aria-label="Account">
          <NavLink to="/admin" className="header__link">
            Admin
          </NavLink>
          <NavLink to="/login" className="header__icon-link" aria-label="Sign in">
            <Icon name="user" size={20} />
          </NavLink>
          <NavLink to="/cart" className="header__cart">
            <Icon name="cart" size={20} />
            <span>Cart</span>
            {count > 0 && <span className="header__cart-count">{count}</span>}
          </NavLink>
          <ThemeToggle />
        </nav>
      </div>
    </header>
  )
}
