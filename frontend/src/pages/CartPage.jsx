import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useDispatch, useSelector } from 'react-redux'
import { checkoutOrder, resetCheckout } from '../store/ordersSlice'
import { useToast } from '../components/Toast'
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
  const token = useSelector((s) => s.auth.token)
  const checkoutStatus = useSelector((s) => s.orders.checkoutStatus)
  const checkoutError = useSelector((s) => s.orders.checkoutError)

  const navigate = useNavigate()
  const showToast = useToast()
  const [code, setCode] = useState('')

  // Total product-level savings (original − selling price).
  const savings = items.reduce(
    (sum, i) => sum + Math.max(0, i.price - discountedPrice(i)) * i.qty,
    0,
  )

  const checkout = async () => {
    if (!token) {
      navigate('/login', { state: { from: '/cart' } })
      return
    }
    // checkoutOrder() returns the new order, or null if it failed
    const order = await dispatch(checkoutOrder())
    if (order) {
      dispatch(clearCart())
      dispatch(resetCheckout())
      showToast('Order placed successfully', '/orders', 'View orders')
      navigate('/orders')
    }
  }

  if (items.length === 0) {
    return (
      <div className="page">
        <div className="container">
          <div className="state-box cart-empty">
            <span className="cart-empty__icon">
              <Icon name="cart" size={48} />
            </span>
            <h2 className="cart-empty__title">Your Cart is Empty!</h2>
            <p className="muted">
              Looks like you haven't added anything yet.
            </p>
            <Link to="/" className="btn btn--primary btn--lg">
              Shop Now
              <Icon name="arrowRight" size={16} />
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
            Your Cart <span className="muted">({count} items)</span>
          </h1>
          <Link to="/" className="cart__continue">
            Continue Shopping
            <Icon name="arrowRight" size={16} />
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

            {/* Coupon under the items, like the reference layout */}
            <div className="cart__coupon">
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
                    placeholder="Enter Coupon Code"
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
                    className="btn btn--primary"
                    onClick={() => dispatch(applyCoupon(code))}
                  >
                    Apply
                  </button>
                </div>
              )}
              {couponError && <p className="field-error">{couponError}</p>}
            </div>
          </section>

          {/* Order summary */}
          <aside className="summary">
            <h2 className="summary__title">Order Summary</h2>

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
              {savings > 0 && (
                <div className="summary__row summary__row--discount">
                  <dt>You Save</dt>
                  <dd>{money(savings)}</dd>
                </div>
              )}
              <div className="summary__row summary__row--total">
                <dt>Total</dt>
                <dd>{money(total)}</dd>
              </div>
            </dl>
            {shipping > 0 && (
              <p className="summary__hint">
                Add {money(FREE_SHIPPING_THRESHOLD - subtotal)} more for free
                shipping
              </p>
            )}

            <button
              type="button"
              className="btn btn--primary btn--lg btn--block"
              disabled={checkoutStatus === 'placing'}
              onClick={checkout}
            >
              {checkoutStatus === 'placing'
                ? 'Placing order…'
                : token
                  ? 'Proceed to Checkout'
                  : 'Sign in to checkout'}
            </button>
            {checkoutError && (
              <p className="field-error">{checkoutError}</p>
            )}
            <p className="summary__note muted">
              Prices in USD. Your cart is saved for next time.
            </p>
          </aside>
        </div>
      </div>
    </div>
  )
}
