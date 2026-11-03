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
import { discountedPrice, money } from '../utils/money'
import { useToast } from '../components/Toast'
import RatingStars from '../components/RatingStars'
import QuantityStepper from '../components/QuantityStepper'
import ProductCard from '../components/ProductCard'
import SkeletonCard from '../components/SkeletonCard'
import Icon from '../components/Icon'
import ReviewList from '../components/ReviewList'
import ReviewForm from '../components/ReviewForm'
import {
  getProductReviews,
  createReview,
  updateReview,
  deleteReview,
} from '../api/reviewApi'
import './ProductDetailPage.css'

const TABS = ['Description', 'Specifications', 'Reviews']

const fmtCount = (n) => (n >= 1000 ? `${(n / 1000).toFixed(1)}k` : String(n))

export default function ProductDetailPage() {
  const { id } = useParams()
  const dispatch = useDispatch()
  const navigate = useNavigate()
  const showToast = useToast()

  const allProducts = useSelector(selectAllProducts)
  const listStatus = useSelector((s) => s.products.status)
  const detail = useSelector((s) => s.products.detail)

  const [imgIndex, setImgIndex] = useState(0)
  const [qty, setQty] = useState(1)
  const [tab, setTab] = useState('Description')
  const [reviews, setReviews] = useState([])
  const [reviewsLoading, setReviewsLoading] = useState(false)
  const [showReviewForm, setShowReviewForm] = useState(false)
  const [editingReview, setEditingReview] = useState(null)
  const [userReview, setUserReview] = useState(null)

  const user = useSelector((s) => s.auth.user)
  const token = useSelector((s) => s.auth.token)

  // Prefer the already-loaded catalog; fall back to the detail fetch.
  const catalogProduct = allProducts.find((p) => String(p.id) === String(id))
  const product =
    catalogProduct ??
    (String(detail.data?.id) === String(id) ? detail.data : null)

  useEffect(() => {
    window.scrollTo(0, 0)
    setImgIndex(0)
    setQty(1)
    setTab('Description')
    if (listStatus === 'idle') dispatch(fetchProducts())
    if (!catalogProduct && detail.status !== 'succeeded') {
      dispatch(fetchProductById(id))
    }
    return () => dispatch(clearDetail())
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [dispatch, id])

  // Load reviews when product changes
  useEffect(() => {
    if (product) {
      loadReviews()
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [product])

  const loadReviews = async () => {
    if (!product) return
    setReviewsLoading(true)
    try {
      const productId = product.id || product._id
      const data = await getProductReviews(productId)
      setReviews(data.reviews || [])
      // Check if current user has already reviewed
      if (user) {
        const myReview = data.reviews?.find((r) => r.user._id === user.id || r.user._id === user._id)
        setUserReview(myReview || null)
      }
    } catch (error) {
      console.error('Failed to load reviews:', error)
    } finally {
      setReviewsLoading(false)
    }
  }

  const handleCreateReview = async (reviewData) => {
    try {
      const productId = product.id || product._id
      await createReview({ ...reviewData, productId }, token)
      showToast('Review submitted successfully!')
      setShowReviewForm(false)
      loadReviews()
    } catch (error) {
      showToast(error.message || 'Failed to submit review')
    }
  }

  const handleUpdateReview = async (reviewData) => {
    try {
      const productId = product.id || product._id
      await updateReview(editingReview._id, { ...reviewData, productId }, token)
      showToast('Review updated successfully!')
      setEditingReview(null)
      setShowReviewForm(false)
      loadReviews()
    } catch (error) {
      showToast(error.message || 'Failed to update review')
    }
  }

  const handleDeleteReview = async (reviewId) => {
    if (!window.confirm('Are you sure you want to delete this review?')) return
    try {
      await deleteReview(reviewId, token)
      showToast('Review deleted successfully!')
      loadReviews()
    } catch (error) {
      showToast(error.message || 'Failed to delete review')
    }
  }

  const handleEditReview = (review) => {
    setEditingReview(review)
    setShowReviewForm(true)
  }

  const handleCancelReview = () => {
    setShowReviewForm(false)
    setEditingReview(null)
  }

  const relatedItems = useMemo(
    () =>
      product
        ? allProducts
            .filter((p) => p.category === product.category && p.id !== product.id)
            .slice(0, 4)
        : [],
    [allProducts, product],
  )

  const status = product ? 'succeeded' : detail.status
  const error = detail.error

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
                dispatch(fetchProductById(id))
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
              <Link to="/" className="breadcrumb__home" aria-label="Home">
                <Icon name="home" size={16} />
              </Link>
              <Icon name="chevronRight" size={12} />
              <Link to="/">{product.categoryName || product.category}</Link>
              <Icon name="chevronRight" size={12} />
              <span className="breadcrumb__current">{product.title}</span>
            </nav>

            <section className="pdetail">
              {/* Gallery — vertical thumbs like the reference layout */}
              <div className="pdetail__gallery">
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
                <div className="pdetail__main">
                  {discountPct > 0 && (
                    <span className="badge badge--sale pdetail__badge">
                      -{discountPct}%
                    </span>
                  )}
                  <img src={images[imgIndex]} alt={product.title} />
                  <span className="pdetail__img-count caption">
                    {imgIndex + 1} / {images.length}
                  </span>
                </div>
              </div>

              {/* Info */}
              <div className="pdetail__info">
                <div className="pdetail__meta">
                  <span className="pdetail__chip">
                    {product.rating >= 4.5
                      ? 'Best Seller'
                      : product.categoryName || product.category}
                  </span>
                  <span className={`pdetail__stock ${stockClass}`}>
                    {stockLabel}
                  </span>
                </div>

                <h1 className="pdetail__title">{product.title}</h1>

                <div className="pdetail__rating">
                  <RatingStars rating={product.rating} />
                  <span>
                    {product.rating?.toFixed(1)} (
                    {fmtCount(
                      product.reviewCount ?? product.reviews?.length ?? 0,
                    )}{' '}
                    reviews)
                  </span>
                  {product.brand && (
                    <span className="muted">· {product.brand}</span>
                  )}
                </div>

                <div className="pdetail__price-row">
                  <span className="pdetail__price">{money(discounted)}</span>
                  {discountPct > 0 && (
                    <>
                      <s className="pdetail__price-old">{money(product.price)}</s>
                      <span className="pdetail__off">{discountPct}% OFF</span>
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
                      <Icon name="cart" size={18} />
                      Add to Cart
                    </button>
                    <button
                      type="button"
                      className="btn btn--secondary btn--lg"
                      onClick={buyNow}
                      disabled={stock === 0}
                    >
                      <Icon name="zap" size={18} filled />
                      Buy Now
                    </button>
                  </div>
                </div>

                <div className="pdetail__perks">
                  <div className="pdetail__perk">
                    <Icon name="truck" size={20} />
                    <div>
                      <strong>Free Shipping</strong>
                      <span className="muted">on orders over $50</span>
                    </div>
                  </div>
                  <div className="pdetail__perk">
                    <Icon name="shield" size={20} />
                    <div>
                      <strong>Secure Payment</strong>
                      <span className="muted">100% protected</span>
                    </div>
                  </div>
                  <div className="pdetail__perk">
                    <Icon name="rotateCcw" size={20} />
                    <div>
                      <strong>Easy Returns</strong>
                      <span className="muted">
                        {product.returnPolicy || '30-day policy'}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            </section>

            {/* Tabs + key features */}
            <div className="pdetail__lower">
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
                        ? `Reviews (${fmtCount(product.reviewCount ?? product.reviews?.length ?? 0)})`
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
                      ['Category', product.categoryName || product.category],
                      ...Object.entries(product.specifications || {}),
                      ['Warranty', product.warrantyInformation],
                      ['Availability', product.availabilityStatus],
                      ['Return policy', product.returnPolicy],
                    ]
                      .filter(([, v]) => v)
                      .map(([k, v]) => (
                        <div key={k} className="specs__row">
                          <dt>{k}</dt>
                          <dd>{String(v)}</dd>
                        </div>
                      ))}
                  </dl>
                )}

                {tab === 'Reviews' && (
                  <div className="reviews-section">
                    {user && !userReview && !showReviewForm && (
                      <button
                        type="button"
                        className="btn btn--primary"
                        onClick={() => setShowReviewForm(true)}
                        style={{ marginBottom: '1.5rem' }}
                      >
                        Write a Review
                      </button>
                    )}

                    {showReviewForm && (
                      <ReviewForm
                        productId={product.id || product._id}
                        initialReview={editingReview}
                        onSubmit={editingReview ? handleUpdateReview : handleCreateReview}
                        onCancel={handleCancelReview}
                      />
                    )}

                    <ReviewList
                      reviews={reviews}
                      currentUserId={user?.id}
                      onEdit={handleEditReview}
                      onDelete={handleDeleteReview}
                      loading={reviewsLoading}
                    />
                  </div>
                )}
              </div>
              </section>

              <aside className="features">
                <h3 className="features__title">Key Features</h3>
                <ul className="features__list">
                  {[
                    product.brand && `Genuine ${product.brand}`,
                    product.warrantyInformation || '1-year warranty',
                    product.availabilityStatus || 'Ready to ship',
                    product.returnPolicy || '30-day easy returns',
                  ]
                    .filter(Boolean)
                    .slice(0, 4)
                    .map((f) => (
                      <li key={f}>
                        <Icon name="checkCircle" size={18} />
                        {f}
                      </li>
                    ))}
                </ul>
                <Icon name="gamepad" size={120} style={{ strokeWidth: 1 }} />
              </aside>
            </div>

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
