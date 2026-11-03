import { useState } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { login, logout, clearAuthError } from '../../store/authSlice'

// Admin-only sign in — there is no admin signup; the admin account is
// provisioned on the backend (admin@gmail.com).
export default function AdminLogin() {
  const dispatch = useDispatch()
  const { status, error } = useSelector((s) => s.auth)

  const [denied, setDenied] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')

  const submit = async (e) => {
    e.preventDefault()
    setDenied('')
    dispatch(clearAuthError())
    const res = await dispatch(login({ email, password }))
    if (login.fulfilled.match(res) && res.payload.user?.role !== 'admin') {
      // Regular user trying to enter the admin area
      dispatch(logout())
      setDenied('This account does not have admin access.')
    }
  }

  return (
    <div className="admin__panel admin__panel--narrow admin__login">
      <h2 className="admin__panel-title">Admin sign in</h2>
      <p className="muted">
        Restricted area — sign in with an admin account to manage products,
        categories, coupons and orders.
      </p>

      <form className="admin__form" onSubmit={submit}>
        <div className="admin__field">
          <label className="caption" htmlFor="a-email">
            Email
          </label>
          <input
            id="a-email"
            type="email"
            className="input"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="admin@kadai.store"
            required
          />
        </div>

        <div className="admin__field">
          <label className="caption" htmlFor="a-password">
            Password
          </label>
          <input
            id="a-password"
            type="password"
            className="input"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="••••••••"
            required
          />
        </div>

        {(error || denied) && (
          <p className="field-error">{denied || error}</p>
        )}

        <button
          type="submit"
          className="btn btn--primary btn--lg btn--block"
          disabled={status === 'loading'}
        >
          {status === 'loading' ? 'Signing in…' : 'Sign in as admin'}
        </button>
      </form>
    </div>
  )
}
