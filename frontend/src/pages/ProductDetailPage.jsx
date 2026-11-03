import { useEffect, useMemo, useState } from 'react'
import { Link, useNavigate, useParams } from 'react-router-dom'
import { useDispatch, useSelector } from 'react-redux'
import {
  fetchProducts,
  fetchProductById,
  clearDetail,
} from '../store/productsSlice'
import { selectAllProducts } from '../store/selectors'
import { addToCart } from '../store/cartSlice'
import { discountedPrice, money, round2 } from '../utils/money'
import { useToast } from '../components/Toast'
import RatingStars from '../components/RatingStars'
import QuantityStepper from '../components/QuantityStepper'
import ProductCard from '../components/ProductCard'
import SkeletonCard from '../components/SkeletonCard'
import Icon from '../components/Icon'
import './ProductDetailPage.css'

const TABS = ['Description', 'Specifications', 'Reviews']

export default function ProductDetailPage() {
  const { id } = useParams()
  const dispatch = useDispatch()
  const navigate = useNavigate()
  const showToast = useToast()

  const numericId = Number(id)
  const allProducts = useSelector(selectAllProducts)
  const listStatus = useSelector((s) => s.products.status)
  const detail = useSelector((s) => s.products.detail)
  const isDeleted = useSelector((s) => s.admin.deletedIds.includes(numericId))

  const [imgIndex, setImgIndex] = useState(0)
  const [qty, setQty] = useState(1)
  const [tab, setTab] = useState('Description')

  // Prefer the merged catalog (covers admin-created and admin-edited products).
  const catalogProduct = allProducts.find((p) => p.id === numericId)
  const product =
    catalogProduct ?? (detail.data?.id === numericId ? detail.data : null)

  useEffect(() => {
    window.scrollTo(0, 0)
    setImgIndex(0)
    setQty(1)
    setTab('Description')
    if (listStatus === 'idle') dispatch(fetchProducts())
    if (!catalogProduct && !isDeleted && detail.status !== 'succeeded') {
      dispatch(fetchProductById(id))
    }
    return () => dispatch(clearDetail())
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [dispatch, id])

  const relatedItems = useMemo(
    () =>
      product
        ? allProducts
            .filter((p) => p.category === product.category && p.id !== product.id)
            .slice(0, 4)
        : [],
    [allProducts, product],
  )

  const status = product
    ? 'succeeded'
    : isDeleted
      ? 'failed'
      : detail.status
  const error = isDeleted ? 'Product not found.' : detail.error

  if (status === 'failed') {
    return (
      <div className="page">
        <div className="container">
          <div className="state-box state-box--error">
            <Icon name="alert" size={32} />
            <p>{error || 'Could not load product.'}</p>
            <button
              type="button"
              className="btn"
              style={{ background: 'var(--color-danger-700)', color: 'var(--color-white)' }}
              onClick={() => {
                dispatch(fetchProducts())
                if (!isDeleted) dispatch(fetchProductById(id))
              }}
            >
              Retry
            </button>
          </div>
        </div>
      </div>
    )
  }

  const loading = status === 'loading' || status === 'idle' || !product
  const images = product?.images?.length ? product.images : [product?.thumbnail]
  const discounted = product ? discountedPrice(product) : 0
  const discountPct = product ? Math.round(product.discountPercentage || 0) : 0
  const savings = product ? round2(product.price - discounted) : 0
  const stock = product?.stock ?? 0
  const stockLabel =
    stock === 0 ? 'Out of stock' : stock < 10 ? `Only ${stock} left` : `In stock · ${stock}`
  const stockClass =
    stock === 0 ? 'is-out' : stock < 10 ? 'is-low' : 'is-in'

  const add = () => {
    dispatch(addToCart({ product, qty }))
    showToast('Added to cart', '/cart', 'View cart')
  }

  const buyNow = () => {
    dispatch(addToCart({ product, qty }))
    navigate('/cart')
  }

  return (
    <div className="page">
      <div className="container">
        {loading ? (
          <div className="pdetail__skeleton">
            <div className="skeleton pdetail__skeleton-media" />
            <div className="pdetail__skeleton-info">
              <div className="skeleton" style={{ height: 14, width: '30%' }} />
              <div className="skeleton" style={{ height: 32, width: '80%' }} />
              <div className="skeleton" style={{ height: 16, width: '45%' }} />
              <div className="skeleton" style={{ height: 36, width: '35%' }} />
              <div className="skeleton" style={{ height: 80, width: '100%' }} />
              <div className="skeleton" style={{ height: 52, width: '100%' }} />
            </div>
          </div>
        ) : (
          <>
            <nav className="breadcrumb" aria-label="Breadcrumb">
              <Link to="/">Home</Link>
              <span>/</span>
              <Link to="/">{product.category}</Link>
              <span>/</span>
              <span className="breadcrumb__current">{product.title}</span>
            </nav>

            <section className="pdetail">
              {/* Gallery */}
              <div className="pdetail__gallery">
                <div className="pdetail__main">
                  {discountPct > 0 && (
                    <span className="badge badge--sale pdetail__badge">
                      -{discountPct}%
                    </span>
                  )}
                  <img src={images[imgIndex]} alt={product.title} />
                  <span className="pdetail__img-count caption">
                    Image {imgIndex + 1} of {images.length} (product images)
                  </span>
                </div>
                <div className="pdetail__thumbs">
                  {images.slice(0, 4).map((src, i) => (
                    <button
                      key={i}
                      type="button"
                      className={`pdetail__thumb${i === imgIndex ? ' is-active' : ''}`}
                      onClick={() => setImgIndex(i)}
                      aria-label={`Show image ${i + 1}`}
                    >
                      <img src={src} alt="" />
                    </button>
                  ))}
                </div>
              </div>

              {/* Info */}
              <div className="pdetail__info">
                <div className="pdetail__meta">
                  <span className="caption" style={{ color: 'var(--color-primary-600)' }}>
                    {product.category}
                  </span>
                  <span className={`pdetail__stock ${stockClass}`}>
                    {stockLabel}
                  </span>
                </div>

                <h1 className="pdetail__title">{product.title}</h1>

                <div className="pdetail__rating">
                  <RatingStars rating={product.rating} />
                  <span>
                    {product.rating?.toFixed(1)} · {product.reviews?.length ?? 0}{' '}
                    reviews
                  </span>
                  {product.brand && (
                    <span className="muted">· Brand: {product.brand}</span>
                  )}
                </div>

                <div className="pdetail__price-row">
                  <span className="pdetail__price">{money(discounted)}</span>
                  {discountPct > 0 && (
                    <>
                      <s className="pdetail__price-old">{money(product.price)}</s>
                      <span className="pdetail__save">
                        You save {money(savings)} ({discountPct}%)
                      </span>
                    </>
                  )}
                </div>

                <p className="pdetail__desc">{product.description}</p>

                <div className="pdetail__buy">
                  <div className="pdetail__qty">
                    <span className="caption">Quantity</span>
                    <QuantityStepper
                      value={qty}
                      max={stock}
                      onDecrease={() => setQty((q) => Math.max(1, q - 1))}
                      onIncrease={() => setQty((q) => Math.min(stock, q + 1))}
                    />
                  </div>
                  <div className="pdetail__actions">
                    <button
                      type="button"
                      className="btn btn--primary btn--lg"
                      onClick={add}
                      disabled={stock === 0}
                    >
                      Add to cart
                    </button>
                    <button
                      type="button"
                      className="btn btn--secondary btn--lg"
                      onClick={buyNow}
                      disabled={stock === 0}
                    >
                      Buy now
                    </button>
                  </div>
                </div>

                <div className="pdetail__perks">
                  <div className="pdetail__perk">
                    <Icon name="truck" size={20} />
                    <div>
                      <strong>Free shipping</strong>
                      <span className="muted">On orders of $50 or more</span>
                    </div>
                  </div>
                  <div className="pdetail__perk">
                    <Icon name="rotateCcw" size={20} />
                    <div>
                      <strong>7-day returns</strong>
                      <span className="muted">
                        {product.returnPolicy || 'Easy returns'}
                      </span>
                    </div>
                  </div>
                  <div className="pdetail__perk">
                    <Icon name="shield" size={20} />
                    <div>
                      <strong>Warranty</strong>
                      <span className="muted">
                        {product.warrantyInformation || '1-year warranty'}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            </section>

            {/* Tabs */}
            <section className="tabs">
              <div className="tabs__bar" role="tablist">
                {TABS.map((t) => (
                  <button
                    key={t}
                    type="button"
                    role="tab"
                    aria-selected={tab === t}
                    className={`tabs__tab${tab === t ? ' is-active' : ''}`}
                    onClick={() => setTab(t)}
                  >
                    {t === 'Reviews'
                      ? `Reviews (${product.reviews?.length ?? 0})`
                      : t}
                  </button>
                ))}
              </div>

              <div className="tabs__panel">
                {tab === 'Description' && (
                  <p className="tabs__text">{product.description}</p>
                )}

                {tab === 'Specifications' && (
                  <dl className="specs">
                    {[
                      ['Brand', product.brand],
                      ['SKU', product.sku],
                      ['Category', product.category],
                      ['Weight', product.weight && `${product.weight} kg`],
                      [
                        'Dimensions',
                        product.dimensions &&
                          `${product.dimensions.width} × ${product.dimensions.height} × ${product.dimensions.depth} cm`,
                      ],
                      ['Warranty', product.warrantyInformation],
                      ['Shipping', product.shippingInformation],
                      ['Availability', product.availabilityStatus],
                      ['Return policy', product.returnPolicy],
                    ]
                      .filter(([, v]) => v)
                      .map(([k, v]) => (
                        <div key={k} className="specs__row">
                          <dt>{k}</dt>
                          <dd>{v}</dd>
                        </div>
                      ))}
                  </dl>
                )}

                {tab === 'Reviews' && (
                  <ul className="reviews">
                    {(product.reviews ?? []).map((r, i) => (
                      <li key={i} className="reviews__item">
                        <div className="reviews__head">
                          <RatingStars rating={r.rating} />
                          <strong>{r.reviewerName}</strong>
                          <span className="muted">
                            {new Date(r.date).toLocaleDateString()}
                          </span>
                        </div>
                        <p className="tabs__text">{r.comment}</p>
                      </li>
                    ))}
                    {(product.reviews ?? []).length === 0 && (
                      <p className="muted">No reviews yet.</p>
                    )}
                  </ul>
                )}
              </div>
            </section>

            {/* Related */}
            <section className="related">
              <h2 className="related__title">You may also like</h2>
              <div className="related__grid">
                {listStatus !== 'succeeded'
                  ? Array.from({ length: 4 }, (_, i) => <SkeletonCard key={i} />)
                  : relatedItems.map((p) => (
                      <ProductCard key={p.id} product={p} />
                    ))}
              </div>
            </section>
          </>
        )}
      </div>
    </div>
  )
}
