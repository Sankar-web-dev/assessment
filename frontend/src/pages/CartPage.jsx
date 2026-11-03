import { useState } from 'react'
import { Link } from 'react-router-dom'
import { useDispatch, useSelector } from 'react-redux'
import {
  increase,
  decrease,
  removeItem,
  clearCart,
  applyCoupon,
  removeCoupon,
} from '../store/cartSlice'
import {
  selectCartItems,
  selectCartItemCount,
  selectSubtotal,
  selectCouponDiscount,
  selectShipping,
  selectTotal,
  selectCoupon,
  selectCouponError,
  FREE_SHIPPING_THRESHOLD,
} from '../store/selectors'
import { discountedPrice, money } from '../utils/money'
import Icon from '../components/Icon'
import QuantityStepper from '../components/QuantityStepper'
import './CartPage.css'

export default function CartPage() {
  const dispatch = useDispatch()
  const items = useSelector(selectCartItems)
  const count = useSelector(selectCartItemCount)
  const subtotal = useSelector(selectSubtotal)
  const discount = useSelector(selectCouponDiscount)
  const shipping = useSelector(selectShipping)
  const total = useSelector(selectTotal)
  const coupon = useSelector(selectCoupon)
  const couponError = useSelector(selectCouponError)

  const [code, setCode] = useState('')

  if (items.length === 0) {
    return (
      <div className="page">
        <div className="container">
          <h1 className="page-title">Shopping cart</h1>
          <div className="state-box cart-empty">
            <Icon name="cart" size={40} />
            <h2 className="cart-empty__title">Your cart is empty</h2>
            <p className="muted">
              Browse our products and add something you like.
            </p>
            <Link to="/" className="btn btn--primary">
              Browse products
            </Link>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="page">
      <div className="container">
        <div className="cart__head">
          <h1 className="page-title">
            Shopping cart <span className="muted">({count} items)</span>
          </h1>
          <Link to="/" className="cart__continue">
            <Icon name="arrowRight" size={16} style={{ transform: 'scaleX(-1)' }} />
            Continue shopping
          </Link>
        </div>

        <div className="cart__layout">
          {/* Items */}
          <section className="cart__items">
            <div className="cart__items-head">
              <span className="caption">Product</span>
              <button
                type="button"
                className="btn btn--ghost btn--sm"
                onClick={() => dispatch(clearCart())}
              >
                Clear cart
              </button>
            </div>

            <ul className="cart__list">
              {items.map((item) => {
                const unit = discountedPrice(item)
                const pct = Math.round(item.discountPercentage || 0)
                return (
                  <li key={item.id} className="cart__row">
                    <Link to={`/product/${item.id}`} className="cart__thumb">
                      <img src={item.thumbnail} alt={item.title} />
                    </Link>

                    <div className="cart__info">
                      <Link to={`/product/${item.id}`} className="cart__name">
                        {item.title}
                      </Link>
                      <span className="caption">{item.category}</span>
                      <span className="cart__unit">
                        {money(unit)}{' '}
                        {pct > 0 && <s className="muted">{money(item.price)}</s>}
                      </span>
                    </div>

                    <QuantityStepper
                      value={item.qty}
                      max={item.stock}
                      onDecrease={() => dispatch(decrease(item.id))}
                      onIncrease={() => dispatch(increase(item.id))}
                    />

                    <span className="cart__line-total">
                      {money(unit * item.qty)}
                    </span>

                    <button
                      type="button"
                      className="cart__remove"
                      onClick={() => dispatch(removeItem(item.id))}
                      aria-label={`Remove ${item.title}`}
                    >
                      <Icon name="trash" size={18} />
                    </button>
                  </li>
                )
              })}
            </ul>
          </section>

          {/* Order summary */}
          <aside className="summary">
            <h2 className="summary__title">Order summary</h2>

            <div className="summary__coupon">
              <label htmlFor="coupon" className="caption">
                Coupon code
              </label>
              {coupon ? (
                <div className="summary__coupon-applied">
                  <span className="chip summary__coupon-chip">
                    <Icon name="check" size={14} />
                    {coupon.code} applied: {coupon.percent}% off
                  </span>
                  <button
                    type="button"
                    className="chip__close"
                    onClick={() => dispatch(removeCoupon())}
                    aria-label="Remove coupon"
                  >
                    <Icon name="x" size={14} />
                  </button>
                </div>
              ) : (
                <div className="summary__coupon-form">
                  <input
                    id="coupon"
                    className={`input${couponError ? ' input--error' : ''}`}
                    placeholder="Enter code"
                    value={code}
                    onChange={(e) => setCode(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') {
                        e.preventDefault()
                        dispatch(applyCoupon(code))
                      }
                    }}
                  />
                  <button
                    type="button"
                    className="btn btn--secondary"
                    onClick={() => dispatch(applyCoupon(code))}
                  >
                    Apply
                  </button>
                </div>
              )}
              {couponError && <p className="field-error">{couponError}</p>}
            </div>

            <dl className="summary__rows">
              <div className="summary__row">
                <dt>Subtotal ({count} items)</dt>
                <dd>{money(subtotal)}</dd>
              </div>
              {discount > 0 && (
                <div className="summary__row summary__row--discount">
                  <dt>Coupon ({coupon.code})</dt>
                  <dd>−{money(discount)}</dd>
                </div>
              )}
              <div className="summary__row">
                <dt>Shipping</dt>
                <dd className={shipping === 0 ? 'summary__free' : ''}>
                  {shipping === 0 ? 'FREE' : money(shipping)}
                </dd>
              </div>
              {shipping > 0 && (
                <p className="summary__hint">
                  Add {money(FREE_SHIPPING_THRESHOLD - subtotal)} more for free
                  shipping
                </p>
              )}
              <div className="summary__row summary__row--total">
                <dt>Total</dt>
                <dd>{money(total)}</dd>
              </div>
            </dl>

            <button type="button" className="btn btn--primary btn--lg btn--block">
              Proceed to checkout
            </button>
            <p className="summary__note muted">
              Prices in USD. The cart is saved after refresh (redux-persist).
            </p>
          </aside>
        </div>
      </div>
    </div>
  )
}
