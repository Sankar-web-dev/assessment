import { Link } from 'react-router-dom'
import { useSelector } from 'react-redux'
import { selectAllProducts } from '../store/selectors'
import ProductCard from '../components/ProductCard'
import Icon from '../components/Icon'
import './WishlistPage.css'

export default function WishlistPage() {
  const saved = useSelector((s) => Object.values(s.wishlist.items))
  const allProducts = useSelector(selectAllProducts)
  // Rehydrate full product data so cards get rating/stock/category.
  const items = saved.map(
    (w) => allProducts.find((p) => p.id === w.id) || w,
  )

  return (
    <div className="page">
      <div className="container">
        <div className="cart__head">
          <h1 className="page-title">
            Your Wishlist <span className="muted">({items.length})</span>
          </h1>
          <Link to="/products" className="cart__continue">
            Continue Shopping
            <Icon name="arrowRight" size={16} />
          </Link>
        </div>

        {items.length === 0 ? (
          <div className="state-box cart-empty">
            <span className="cart-empty__icon">
              <Icon name="heart" size={48} />
            </span>
            <h2 className="cart-empty__title">Your Wishlist is Empty!</h2>
            <p className="muted">
              Tap the heart on any product to save it here.
            </p>
            <Link to="/products" className="btn btn--primary btn--lg">
              Browse Products
              <Icon name="arrowRight" size={16} />
            </Link>
          </div>
        ) : (
          <div className="wishlist__grid">
            {items.map((p) => (
              <ProductCard key={p.id} product={p} />
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
