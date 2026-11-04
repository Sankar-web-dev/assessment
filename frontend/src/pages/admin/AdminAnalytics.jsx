import { useEffect, useState } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { fetchAllOrders } from '../../store/ordersSlice'
import { fetchProducts } from '../../store/productsSlice'
import { selectAllProducts } from '../../store/selectors'
import { api } from '../../api/client'
import { money } from '../../utils/money'

const STATUSES = ['pending', 'processing', 'shipped', 'delivered', 'cancelled']

// Admin dashboard — all stats are computed client-side from the existing
// /orders/all, /users and /products endpoints.
export default function AdminAnalytics() {
  const dispatch = useDispatch()
  const token = useSelector((s) => s.auth.token)
  const orders = useSelector((s) => s.orders.allOrders)
  const ordersStatus = useSelector((s) => s.orders.allStatus)
  const products = useSelector(selectAllProducts)
  const productsStatus = useSelector((s) => s.products.status)
  const [customers, setCustomers] = useState(0)

  useEffect(() => {
    if (ordersStatus === 'idle') dispatch(fetchAllOrders())
    if (productsStatus === 'idle') dispatch(fetchProducts())
    api('/users', { token })
      .then((users) =>
        setCustomers(users.filter((u) => u.role !== 'admin').length),
      )
      .catch(() => {})
  }, [dispatch, ordersStatus, productsStatus, token])

  // Cancelled orders don't count toward revenue.
  const validOrders = orders.filter((o) => o.status !== 'cancelled')
  const revenue = validOrders.reduce((s, o) => s + o.total, 0)
  const units = validOrders.reduce(
    (s, o) => s + o.items.reduce((a, i) => a + i.quantity, 0),
    0,
  )

  const stats = [
    { label: 'Revenue', value: money(revenue), sub: `${validOrders.length} orders` },
    { label: 'Orders', value: orders.length, sub: `${units} items sold` },
    {
      label: 'Avg order',
      value: money(validOrders.length ? revenue / validOrders.length : 0),
      sub: 'per order',
    },
    { label: 'Customers', value: customers, sub: 'registered' },
    { label: 'Products', value: products.length, sub: 'in catalog' },
  ]

  // Orders grouped by status, for the bar list.
  const byStatus = STATUSES.map((s) => ({
    status: s,
    count: orders.filter((o) => o.status === s).length,
  }))
  const maxStatus = Math.max(1, ...byStatus.map((b) => b.count))

  // Top 5 products by units sold.
  const sold = {}
  validOrders.forEach((o) =>
    o.items.forEach((i) => {
      sold[i.name] = sold[i.name] || { name: i.name, qty: 0, revenue: 0 }
      sold[i.name].qty += i.quantity
      sold[i.name].revenue += i.price * i.quantity
    }),
  )
  const topProducts = Object.values(sold)
    .sort((a, b) => b.qty - a.qty)
    .slice(0, 5)
  const maxQty = Math.max(1, ...topProducts.map((t) => t.qty))

  const recent = [...orders]
    .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
    .slice(0, 5)

  return (
    <div>
      {/* Stat cards */}
      <div className="admin__stats">
        {stats.map((s) => (
          <div key={s.label} className="admin__stat">
            <span className="admin__stat-label">{s.label}</span>
            <span className="admin__stat-value">{s.value}</span>
            <span className="muted caption">{s.sub}</span>
          </div>
        ))}
      </div>

      <div className="admin__grid-analytics">
        {/* Orders by status */}
        <div className="admin__panel">
          <h2 className="admin__panel-title">Orders by status</h2>
          {byStatus.map((b) => (
            <div key={b.status} className="admin__bar-row">
              <span className="admin__bar-label">{b.status}</span>
              <span className="admin__bar-track">
                <span
                  className="admin__bar-fill"
                  style={{ width: `${(b.count / maxStatus) * 100}%` }}
                />
              </span>
              <span className="admin__bar-val">{b.count}</span>
            </div>
          ))}
          {orders.length === 0 && (
            <p className="muted">No orders yet — stats appear once orders are placed.</p>
          )}
        </div>

        {/* Top selling products */}
        <div className="admin__panel">
          <h2 className="admin__panel-title">Top products</h2>
          {topProducts.map((t) => (
            <div key={t.name} className="admin__bar-row">
              <span className="admin__bar-label admin__bar-label--wide" title={t.name}>
                {t.name}
              </span>
              <span className="admin__bar-track">
                <span
                  className="admin__bar-fill"
                  style={{ width: `${(t.qty / maxQty) * 100}%` }}
                />
              </span>
              <span className="admin__bar-val">{t.qty}</span>
            </div>
          ))}
          {topProducts.length === 0 && (
            <p className="muted">No sales yet.</p>
          )}
        </div>
      </div>

      {/* Recent orders */}
      <div className="admin__panel">
        <h2 className="admin__panel-title">Recent orders</h2>
        <div className="admin__table-wrap">
          <table className="admin__table">
            <thead>
              <tr>
                <th>Order</th>
                <th>Customer</th>
                <th>Total</th>
                <th>Status</th>
                <th>Date</th>
              </tr>
            </thead>
            <tbody>
              {recent.map((o) => (
                <tr key={o._id}>
                  <td>
                    <strong>#{o._id.slice(-6).toUpperCase()}</strong>
                  </td>
                  <td>{o.user?.name || '—'}</td>
                  <td>{money(o.total)}</td>
                  <td className="caption" style={{ textTransform: 'capitalize' }}>
                    {o.status}
                  </td>
                  <td className="muted">
                    {new Date(o.createdAt).toLocaleDateString()}
                  </td>
                </tr>
              ))}
              {recent.length === 0 && (
                <tr>
                  <td colSpan={5} className="muted" style={{ textAlign: 'center' }}>
                    No orders yet.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}
