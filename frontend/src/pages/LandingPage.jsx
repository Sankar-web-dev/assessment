import { useEffect, useState } from 'react'
import { Link, useLocation } from 'react-router-dom'
import { useDispatch, useSelector } from 'react-redux'
import { fetchProducts } from '../store/productsSlice'
import { selectAllProducts } from '../store/selectors'
import ProductCard from '../components/ProductCard'
import Icon from '../components/Icon'
import './LandingPage.css'

const PERKS = [
  { icon: 'truck', title: 'Fast Delivery', sub: 'Across India' },
  { icon: 'shield', title: 'Secure', sub: 'Payments' },
  { icon: 'rotateCcw', title: 'Easy', sub: 'Returns' },
  { icon: 'headphones', title: '24/7', sub: 'Support' },
]

const ABOUT_FEATURES = [
  { icon: 'grid', title: 'Wide Range', sub: 'of Products' },
  { icon: 'tag', title: 'Exclusive', sub: 'Deals & Offers' },
  { icon: 'shield', title: '100% Genuine', sub: 'Products' },
]

const SHOP_CATS = [
  { label: 'Headphones', q: 'headphone' },
  { label: 'Keyboards', q: 'keyboard' },
  { label: 'Gaming Gear', q: 'gaming' },
  { label: 'Mice', q: 'mouse' },
  { label: 'Monitors', q: 'monitor' },
  { label: 'Laptops', q: 'laptop' },
]

export default function LandingPage() {
  const dispatch = useDispatch()
  const items = useSelector(selectAllProducts)
  const status = useSelector((s) => s.products.status)
  const token = useSelector((s) => s.auth.token)
  const location = useLocation()

  useEffect(() => {
    if (status === 'idle') dispatch(fetchProducts())
  }, [dispatch, status])

  useEffect(() => {
    if (location.hash) {
      setTimeout(
        () =>
          document
            .getElementById(location.hash.slice(1))
            ?.scrollIntoView({ behavior: 'smooth' }),
        50,
      )
    }
  }, [location.hash])

  const featured = items.filter((p) => p.isFeatured).slice(0, 4)
  const heroPool = featured.length ? featured : items.slice(0, 4)
  const [heroIdx, setHeroIdx] = useState(0)
  useEffect(() => {
    if (heroPool.length < 2) return
    const t = setInterval(
      () => setHeroIdx((i) => (i + 1) % heroPool.length),
      3500,
    )
    return () => clearInterval(t)
  }, [heroPool.length])
  const heroImg = heroPool[heroIdx % heroPool.length]?.thumbnail
  const aboutImg =
    items.find((p) => p.title.toLowerCase().includes('console'))?.thumbnail ||
    items[1]?.thumbnail

  return (
    <div className="landing">
      {/* ============ Hero ============ */}
      <section className="lhero">
        <div className="container lhero__inner">
          <div className="lhero__content">
            <span className="hero__pill">Your One-Stop Electronics Store</span>
            <h1 className="lhero__title">
              Shop Smarter for
              <span className="hero__title-grad">All Your Electronic Needs</span>
            </h1>
            <p className="lhero__text">
              VoltNex is a modern e-commerce platform to explore, compare and
              buy the latest electronic gadgets at the best prices with a
              seamless and secure shopping experience.
            </p>
            <div className="lhero__cta-row">
              <Link to="/products" className="btn btn--primary btn--lg">
                <Icon name="cart" size={18} />
                Browse Products
                <Icon name="arrowRight" size={16} />
              </Link>
              {token ? (
                <Link to="/orders" className="btn btn--secondary btn--lg">
                  <Icon name="truck" size={18} />
                  My Orders
                </Link>
              ) : (
                <Link to="/login" className="btn btn--secondary btn--lg">
                  <Icon name="user" size={18} />
                  Create Account
                </Link>
              )}
            </div>
            <div className="lhero__perks">
              {PERKS.map((p) => (
                <div key={p.title} className="lhero__perk">
                  <Icon name={p.icon} size={20} />
                  <div>
                    <strong>{p.title}</strong>
                    <span className="muted">{p.sub}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="lhero__art">
            <div className="lhero__art-main">
              {heroImg && (
                <img
                  key={heroImg}
                  src={heroImg}
                  alt="Featured electronics"
                  className="lhero__art-img"
                />
              )}
            </div>
            <div className="lhero__check-card">
              {['Latest Gadgets', 'Great Deals', 'Trusted & Secure'].map(
                (t) => (
                  <span key={t}>
                    <Icon name="checkCircle" size={16} />
                    {t}
                  </span>
                ),
              )}
            </div>
          </div>
        </div>
      </section>

      {/* ============ Featured products ============ */}
      <section className="container landing__section">
        <div className="landing__section-head">
          <h2 className="landing__title">Featured Products</h2>
          <Link to="/products" className="cats__all">
            View All Products
            <Icon name="arrowRight" size={14} />
          </Link>
        </div>
        <div className="landing__featured-grid">
          {featured.map((p) => (
            <ProductCard key={p.id} product={p} />
          ))}
        </div>
      </section>

      {/* ============ About ============ */}
      <section className="container landing__section landing__about" id="about">
        <div className="landing__about-img">
          {aboutImg && <img src={aboutImg} alt="About VoltNex" />}
        </div>
        <div className="landing__about-body">
          <h2 className="landing__title">
            About <span>VoltNex</span>
          </h2>
          <p className="muted">
            VoltNex is an electronics e-commerce platform built to make online
            tech shopping simple, reliable, and affordable. From smartphones to
            accessories, we bring the latest gadgets right to your fingertips.
          </p>
          <div className="landing__about-features">
            {ABOUT_FEATURES.map((f) => (
              <div key={f.title} className="landing__feature">
                <Icon name={f.icon} size={22} />
                <strong>{f.title}</strong>
                <span className="muted">{f.sub}</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ============ Shop by category ============ */}
      <section className="container landing__section">
        <div className="landing__section-head">
          <h2 className="landing__title">Shop by Category</h2>
          <Link to="/products" className="cats__all">
            View All Products
            <Icon name="arrowRight" size={14} />
          </Link>
        </div>
        <div className="lcats__row">
          {SHOP_CATS.map((c) => {
            const img = items.find((p) =>
              p.title.toLowerCase().includes(c.q),
            )?.thumbnail
            return (
              <Link
                key={c.label}
                to={`/products?q=${c.q}`}
                className="lcats__card"
              >
                <span className="lcats__img">
                  {img ? (
                    <img src={img} alt={c.label} loading="lazy" />
                  ) : (
                    <Icon name="gamepad" size={28} />
                  )}
                </span>
                <span className="lcats__name">{c.label}</span>
              </Link>
            )
          })}
        </div>
      </section>

    </div>
  )
}
