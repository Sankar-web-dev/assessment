import { useEffect, useState } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { fetchCoupons } from '../../store/productsSlice'
import {
  createCouponApi,
  updateCouponApi,
  deleteCouponApi,
} from '../../api/adminApi'
import { selectCoupons } from '../../store/selectors'
import { removeCoupon } from '../../store/cartSlice'
import { money } from '../../utils/money'
import Icon from '../../components/Icon'

export default function AdminCoupons() {
  const dispatch = useDispatch()
  const coupons = useSelector(selectCoupons)
  const couponsStatus = useSelector((s) => s.products.couponsStatus)
  const activeCoupon = useSelector((s) => s.cart.coupon)

  const [code, setCode] = useState('')
  const [percent, setPercent] = useState('')
  const [minOrder, setMinOrder] = useState('')
  const [error, setError] = useState('')

  useEffect(() => {
    if (couponsStatus === 'idle') dispatch(fetchCoupons())
  }, [dispatch, couponsStatus])

  const submit = async (e) => {
    e.preventDefault()
    const cleanCode = code.trim().toUpperCase()
    const pct = Number(percent)
    if (!cleanCode) {
      setError('Coupon code is required')
      return
    }
    if (!pct || pct <= 0 || pct > 100) {
      setError('Discount must be between 1 and 100')
      return
    }
    setError('')
    try {
      await dispatch(
        createCouponApi({
          code: cleanCode,
          discountPercent: pct,
          minOrderAmount: Number(minOrder) || 0,
        }),
      )
      setCode('')
      setPercent('')
      setMinOrder('')
    } catch (err) {
      setError(err.message) // e.g. "Coupon code already exists"
    }
  }

  const toggle = async (c, active) => {
    setError('')
    try {
      await dispatch(updateCouponApi(c._id, { isActive: active }))
      if (!active && activeCoupon?.code === c.code) dispatch(removeCoupon())
    } catch (err) {
      setError(err.message)
    }
  }

  const remove = async (c) => {
    setError('')
    try {
      await dispatch(deleteCouponApi(c._id))
      if (activeCoupon?.code === c.code) dispatch(removeCoupon())
    } catch (err) {
      setError(err.message)
    }
  }

  return (
    <div className="admin__panel">
      <div className="admin__panel-head">
        <div>
          <h2 className="admin__panel-title">Coupons</h2>
          <p className="muted">{coupons.length} coupon codes</p>
        </div>
      </div>

      <form className="admin__inline-form" onSubmit={submit}>
        <input
          className={`input${error ? ' input--error' : ''}`}
          placeholder="Code (e.g. SAVE10)"
          value={code}
          onChange={(e) => {
            setCode(e.target.value)
            setError('')
          }}
          style={{ textTransform: 'uppercase' }}
        />
        <input
          className="input"
          type="number"
          min="1"
          max="100"
          placeholder="% off"
          value={percent}
          onChange={(e) => setPercent(e.target.value)}
          style={{ maxWidth: 110 }}
        />
        <input
          className="input"
          type="number"
          min="0"
          placeholder="Min order $"
          value={minOrder}
          onChange={(e) => setMinOrder(e.target.value)}
          style={{ maxWidth: 120 }}
        />
        <button type="submit" className="btn btn--primary">
          <Icon name="plus" size={16} />
          Add coupon
        </button>
      </form>
      {error && <p className="field-error">{error}</p>}

      <div className="admin__table-wrap">
        <table className="admin__table">
          <thead>
            <tr>
              <th>Code</th>
              <th>Discount</th>
              <th>Min order</th>
              <th>Status</th>
              <th className="admin__col-actions">Actions</th>
            </tr>
          </thead>
          <tbody>
            {coupons.map((c) => (
              <tr key={c._id} className={c.isActive ? '' : 'admin__row--deleted'}>
                <td>
                  <span className="chip chip--active">{c.code}</span>
                </td>
                <td>{c.discountPercent}% off</td>
                <td>{c.minOrderAmount ? money(c.minOrderAmount) : '—'}</td>
                <td>
                  <label className="admin__switch">
                    <input
                      type="checkbox"
                      checked={c.isActive}
                      onChange={(e) => toggle(c, e.target.checked)}
                    />
                    <span
                      className={
                        c.isActive ? 'admin__status--on' : 'admin__status--off'
                      }
                    >
                      {c.isActive ? 'Active' : 'Disabled'}
                    </span>
                  </label>
                </td>
                <td className="admin__col-actions">
                  <button
                    type="button"
                    className="btn btn--danger btn--sm"
                    onClick={() => remove(c)}
                  >
                    Delete
                  </button>
                </td>
              </tr>
            ))}
            {coupons.length === 0 && couponsStatus === 'succeeded' && (
              <tr>
                <td colSpan={5} className="muted" style={{ textAlign: 'center' }}>
                  No coupons yet — add one above.
                </td>
              </tr>
            )}
            {couponsStatus === 'failed' && (
              <tr>
                <td colSpan={5} className="muted" style={{ textAlign: 'center' }}>
                  Could not load coupons — try signing in again.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  )
}
