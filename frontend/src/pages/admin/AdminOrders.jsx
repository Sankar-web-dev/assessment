import { useEffect, useState } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { fetchAllOrders, updateOrderStatus } from '../../store/ordersSlice'
import { money } from '../../utils/money'

const STATUSES = ['pending', 'processing', 'shipped', 'delivered', 'cancelled']

export default function AdminOrders() {
  const dispatch = useDispatch()
  const { allOrders, allStatus, allError } = useSelector((s) => s.orders)
  const [error, setError] = useState('')

  useEffect(() => {
    if (allStatus === 'idle') dispatch(fetchAllOrders())
  }, [dispatch, allStatus])

  const changeStatus = async (id, status) => {
    setError('')
    const res = await dispatch(updateOrderStatus({ id, status }))
    if (updateOrderStatus.rejected.match(res)) {
      setError(res.payload || 'Could not update status')
    }
  }

  return (
    <div className="admin__panel">
      <div className="admin__panel-head">
        <div>
          <h2 className="admin__panel-title">Orders</h2>
          <p className="muted">{allOrders.length} orders</p>
        </div>
      </div>

      {(error || allError) && (
        <p className="field-error">{error || allError}</p>
      )}

      <div className="admin__table-wrap">
        <table className="admin__table">
          <thead>
            <tr>
              <th>Order</th>
              <th>Customer</th>
              <th>Items</th>
              <th>Total</th>
              <th>Date</th>
              <th>Status</th>
            </tr>
          </thead>
          <tbody>
            {allOrders.map((o) => (
              <tr key={o._id}>
                <td>
                  <strong>#{o._id.slice(-6).toUpperCase()}</strong>
                </td>
                <td>
                  {o.user?.name || '—'}
                  <br />
                  <span className="muted caption">{o.user?.email}</span>
                </td>
                <td>{o.items.reduce((s, i) => s + i.quantity, 0)}</td>
                <td>{money(o.total)}</td>
                <td className="muted">
                  {new Date(o.createdAt).toLocaleDateString()}
                </td>
                <td>
                  <select
                    className="input"
                    style={{ height: 'var(--control-sm)' }}
                    value={o.status}
                    onChange={(e) => changeStatus(o._id, e.target.value)}
                  >
                    {STATUSES.map((s) => (
                      <option key={s} value={s}>
                        {s}
                      </option>
                    ))}
                  </select>
                </td>
              </tr>
            ))}
            {allOrders.length === 0 && allStatus === 'succeeded' && (
              <tr>
                <td colSpan={6} className="muted" style={{ textAlign: 'center' }}>
                  No orders yet.
                </td>
              </tr>
            )}
            {allStatus === 'loading' && (
              <tr>
                <td colSpan={6} className="muted" style={{ textAlign: 'center' }}>
                  Loading orders…
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  )
}
