import { useEffect } from 'react'
import { Link, Navigate } from 'react-router-dom'
import { useDispatch, useSelector } from 'react-redux'
import { fetchMyOrders, cancelOrder } from '../store/ordersSlice'
import { money } from '../utils/money'
import Icon from '../components/Icon'
import './admin/admin.css'

const STATUS_CHIP = {
  pending: 'admin__status--off',
  processing: 'admin__status--on',
  shipped: 'admin__status--on',
  delivered: 'admin__status--on',
  cancelled: 'admin__status--off',
}

export default function OrdersPage() {
  const dispatch = useDispatch()
  const token = useSelector((s) => s.auth.token)
  const { myOrders, myStatus, myError } = useSelector((s) => s.orders)

  useEffect(() => {
    if (token && myStatus === 'idle') dispatch(fetchMyOrders())
  }, [dispatch, token, myStatus])

  if (!token) return <Navigate to="/login" state={{ from: '/orders' }} replace />

  return (
    <div className="page">
      <div className="container">
        <div className="cart__head">
          <h1 className="page-title">My orders</h1>
          <Link to="/" className="cart__continue">
            <Icon name="arrowRight" size={16} style={{ transform: 'scaleX(-1)' }} />
            Continue shopping
          </Link>
        </div>

        {myStatus === 'loading' && (
          <div className="state-box">
            <span className="spinner spinner--lg" />
            <p>Loading your orders…</p>
          </div>
        )}

        {myStatus === 'failed' && (
          <div className="state-box state-box--error">
            <Icon name="alert" size={32} />
            <p>{myError || 'Could not load orders.'}</p>
            <button
              type="button"
              className="btn btn--secondary"
              onClick={() => dispatch(fetchMyOrders())}
            >
              Retry
            </button>
          </div>
        )}

        {myStatus === 'succeeded' && myOrders.length === 0 && (
          <div className="state-box">
            <Icon name="cart" size={40} />
            <p>No orders yet.</p>
            <Link to="/" className="btn btn--primary">
              Start shopping
            </Link>
          </div>
        )}

        {myOrders.map((o) => (
          <div key={o._id} className="admin__panel" style={{ marginBottom: 'var(--space-4)' }}>
            <div className="admin__panel-head">
              <div>
                <h2 className="admin__panel-title">
                  Order #{o._id.slice(-6).toUpperCase()}
                </h2>
                <p className="muted">
                  {new Date(o.createdAt).toLocaleDateString()} · {o.items.length}{' '}
                  item{o.items.length > 1 ? 's' : ''}
                </p>
              </div>
              <span className={`chip ${STATUS_CHIP[o.status] || ''}`}>
                {o.status}
              </span>
            </div>

            <ul className="cart__list">
              {o.items.map((i) => (
                <li key={i.product} className="cart__row">
                  <span className="cart__thumb">
                    {i.image ? <img src={i.image} alt={i.name} /> : null}
                  </span>
                  <div className="cart__info">
                    <span className="cart__name">{i.name}</span>
                    <span className="caption">
                      {i.quantity} × {money(i.price)}
                    </span>
                  </div>
                  <span className="cart__line-total">
                    {money(i.price * i.quantity)}
                  </span>
                </li>
              ))}
            </ul>

            <dl className="summary__rows" style={{ maxWidth: 320, marginLeft: 'auto' }}>
              <div className="summary__row">
                <dt>Subtotal</dt>
                <dd>{money(o.subtotal)}</dd>
              </div>
              {o.couponDiscount > 0 && (
                <div className="summary__row summary__row--discount">
                  <dt>Coupon ({o.couponCode})</dt>
                  <dd>−{money(o.couponDiscount)}</dd>
                </div>
              )}
              <div className="summary__row">
                <dt>Shipping</dt>
                <dd>{o.shipping === 0 ? 'FREE' : money(o.shipping)}</dd>
              </div>
              <div className="summary__row summary__row--total">
                <dt>Total</dt>
                <dd>{money(o.total)}</dd>
              </div>
            </dl>

            {(o.status === 'pending' || o.status === 'processing') && (
              <div className="admin__form-actions" style={{ justifyContent: 'flex-end' }}>
                <button
                  type="button"
                  className="btn btn--danger btn--sm"
                  onClick={() => dispatch(cancelOrder(o._id))}
                >
                  Cancel order
                </button>
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  )
}
