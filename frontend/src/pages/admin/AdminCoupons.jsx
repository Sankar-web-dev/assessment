import { useState } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import {
  addCoupon,
  updateCoupon,
  deleteCoupon,
} from '../../store/adminSlice'
import { selectCoupons } from '../../store/selectors'
import { removeCoupon } from '../../store/cartSlice'
import Icon from '../../components/Icon'

export default function AdminCoupons() {
  const dispatch = useDispatch()
  const coupons = useSelector(selectCoupons)
  const activeCoupon = useSelector((s) => s.cart.coupon)

  const [code, setCode] = useState('')
  const [percent, setPercent] = useState('')
  const [error, setError] = useState('')

  const submit = (e) => {
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
    if (coupons.some((c) => c.code === cleanCode)) {
      setError('Coupon code already exists')
      return
    }
    dispatch(addCoupon({ code: cleanCode, percent: pct, active: true }))
    setCode('')
    setPercent('')
    setError('')
  }

  const remove = (c) => {
    dispatch(deleteCoupon(c.code))
    // If this coupon is currently applied to the cart, drop it there too.
    if (activeCoupon?.code === c.code) dispatch(removeCoupon())
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
              <th>Status</th>
              <th className="admin__col-actions">Actions</th>
            </tr>
          </thead>
          <tbody>
            {coupons.map((c) => (
              <tr key={c.code} className={c.active ? '' : 'admin__row--deleted'}>
                <td>
                  <span className="chip chip--active">{c.code}</span>
                </td>
                <td>{c.percent}% off</td>
                <td>
                  <label className="admin__switch">
                    <input
                      type="checkbox"
                      checked={c.active}
                      onChange={(e) => {
                        dispatch(
                          updateCoupon({
                            code: c.code,
                            active: e.target.checked,
                          }),
                        )
                        if (!e.target.checked && activeCoupon?.code === c.code)
                          dispatch(removeCoupon())
                      }}
                    />
                    <span
                      className={
                        c.active ? 'admin__status--on' : 'admin__status--off'
                      }
                    >
                      {c.active ? 'Active' : 'Disabled'}
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
            {coupons.length === 0 && (
              <tr>
                <td colSpan={4} className="muted" style={{ textAlign: 'center' }}>
                  No coupons yet — add one above.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  )
}
