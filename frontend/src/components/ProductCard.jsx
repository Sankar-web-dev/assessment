import { useState } from 'react'
import { Link } from 'react-router-dom'
import { useDispatch, useSelector } from 'react-redux'
import { addToCart, increase, decrease } from '../store/cartSlice'
import { discountedPrice, money } from '../utils/money'
import { useToast } from './Toast'
import RatingStars from './RatingStars'
import QuantityStepper from './QuantityStepper'
import Icon from './Icon'
import './ProductCard.css'

const WISHLIST_KEY = 'voltnex-wishlist'

const loadWishlist = () => {
  try {
    return JSON.parse(localStorage.getItem(WISHLIST_KEY)) || []
  } catch {
    return []
  }
}

export default function ProductCard({ product }) {
  const dispatch = useDispatch()
  const showToast = useToast()
  const inCart = useSelector((s) => s.cart.items[product.id])
  const [liked, setLiked] = useState(() =>
    loadWishlist().includes(product.id),
  )

  const toggleLike = (e) => {
    e.preventDefault()
    const list = loadWishlist()
    const next = liked
      ? list.filter((id) => id !== product.id)
      : [...list, product.id]
    localStorage.setItem(WISHLIST_KEY, JSON.stringify(next))
    setLiked(!liked)
  }

  const discounted = discountedPrice(product)
  const discountPct = Math.round(product.discountPercentage || 0)
  const outOfStock = product.stock === 0
  const lowStock = product.stock > 0 && product.stock < 10

  const handleAdd = () => {
    dispatch(addToCart({ product, qty: 1 }))
    showToast('Added to cart', '/cart', 'View cart')
  }

  return (
    <article className="card">
      <Link
        to={`/product/${product.id}`}
        className="card__media"
        aria-label={product.title}
      >
        {discountPct > 0 && (
          <span className="badge badge--sale card__badge">
            -{discountPct}%
          </span>
        )}
        <button
          type="button"
          className={`card__wish${liked ? ' is-liked' : ''}`}
          onClick={toggleLike}
          aria-label={liked ? 'Remove from wishlist' : 'Add to wishlist'}
          aria-pressed={liked}
        >
          <Icon name="heart" size={16} filled={liked} />
        </button>
        <img
          src={product.thumbnail}
          alt={product.title}
          loading="lazy"
          className="card__img"
        />
      </Link>

      <div className="card__body">
        <span className="caption">{product.category}</span>
        <Link to={`/product/${product.id}`} className="card__title">
          {product.title}
        </Link>

        <div className="card__rating">
          <RatingStars rating={product.rating} />
          <span className="card__rating-text">
            {product.rating?.toFixed(1)} (
            {product.reviewCount ?? product.reviews?.length ?? 0})
          </span>
        </div>

        <div className="card__price-row">
          <span className="card__price">{money(discounted)}</span>
          {discountPct > 0 && (
            <s className="card__price-old">{money(product.price)}</s>
          )}
          {lowStock && (
            <span className="card__stock">Only {product.stock} left</span>
          )}
        </div>

        {outOfStock ? (
          <button type="button" className="btn btn--block" disabled>
            Out of stock
          </button>
        ) : inCart ? (
          <QuantityStepper
            variant="cart"
            value={inCart.qty}
            max={product.stock}
            onDecrease={() => dispatch(decrease(product.id))}
            onIncrease={() => dispatch(increase(product.id))}
          />
        ) : (
          <button
            type="button"
            className="btn btn--primary btn--block"
            onClick={handleAdd}
          >
            Add to cart
          </button>
        )}
      </div>
    </article>
  )
}
