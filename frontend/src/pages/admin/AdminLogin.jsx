import { useState } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { login, signup, clearAuthError } from '../../store/authSlice'

export default function AdminLogin() {
  const dispatch = useDispatch()
  const { status, error } = useSelector((s) => s.auth)

  const [mode, setMode] = useState('login') // login | signup
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')

  const submit = (e) => {
    e.preventDefault()
    dispatch(clearAuthError())
    if (mode === 'login') {
      dispatch(login({ email, password }))
    } else {
      dispatch(signup({ name, email, password }))
    }
  }

  return (
    <div className="admin__panel admin__panel--narrow admin__login">
      <h2 className="admin__panel-title">Admin sign in</h2>
      <p className="muted">
        Sign in to manage products, categories and coupons. Data is stored in
        the Kadai API.
      </p>

      <form className="admin__form" onSubmit={submit}>
        {mode === 'signup' && (
          <div className="admin__field">
            <label className="caption" htmlFor="a-name">
              Name
            </label>
            <input
              id="a-name"
              className="input"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Your name"
              required
            />
          </div>
        )}

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

        {error && <p className="field-error">{error}</p>}

        <button
          type="submit"
          className="btn btn--primary btn--lg btn--block"
          disabled={status === 'loading'}
        >
          {status === 'loading'
            ? 'Signing in…'
            : mode === 'login'
              ? 'Sign in'
              : 'Create account'}
        </button>
      </form>

      <button
        type="button"
        className="admin__switch-mode"
        onClick={() => setMode((m) => (m === 'login' ? 'signup' : 'login'))}
      >
        {mode === 'login'
          ? 'No account yet? Create one'
          : 'Already have an account? Sign in'}
      </button>
    </div>
  )
}
