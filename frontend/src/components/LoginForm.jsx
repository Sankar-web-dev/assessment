import { useState } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { login, signup, clearAuthError } from '../store/authSlice'

export default function LoginForm({ header }) {
  const dispatch = useDispatch()
  const { status, error } = useSelector((s) => s.auth)

  const [mode, setMode] = useState('login')
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [address, setAddress] = useState({
    line1: '',
    city: '',
    state: '',
    postalCode: '',
  })

  const submit = (e) => {
    e.preventDefault()
    dispatch(clearAuthError())
    if (mode === 'login') {
      dispatch(login({ email, password }))
    } else {
      dispatch(signup({ name, email, password, address }))
    }
  }

  return (
    <div className="admin__panel admin__panel--narrow admin__login">
      {header}
      <h2 className="admin__panel-title">
        {mode === 'login' ? 'Sign in' : 'Create account'}
      </h2>
      <p className="muted">
        {mode === 'login'
          ? 'Sign in to check out and track your orders.'
          : 'Create an account to shop and manage your orders.'}
      </p>

      <form className="admin__form" onSubmit={submit}>
        {mode === 'signup' && (
          <div className="admin__field">
            <label className="caption" htmlFor="u-name">
              Name
            </label>
            <input
              id="u-name"
              className="input"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Your name"
              autoComplete="name"
              required
            />
          </div>
        )}

        <div className="admin__field">
          <label className="caption" htmlFor="u-email">
            Email
          </label>
          <input
            id="u-email"
            type="email"
            className="input"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="you@example.com"
            autoComplete="email"
            required
          />
        </div>

        <div className="admin__field">
          <label className="caption" htmlFor="u-password">
            Password
          </label>
          <input
            id="u-password"
            type="password"
            className="input"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="••••••••"
            autoComplete={mode === 'login' ? 'current-password' : 'new-password'}
            required
          />
        </div>

        {mode === 'signup' && (
          <>
            <div className="admin__field">
              <label className="caption" htmlFor="u-line1">
                Address
              </label>
              <input
                id="u-line1"
                className="input"
                value={address.line1}
                onChange={(e) =>
                  setAddress({ ...address, line1: e.target.value })
                }
                placeholder="Street address"
                autoComplete="street-address"
              />
            </div>
            <div className="admin__grid-2">
              <div className="admin__field">
                <label className="caption" htmlFor="u-city">
                  City
                </label>
                <input
                  id="u-city"
                  className="input"
                  value={address.city}
                  onChange={(e) =>
                    setAddress({ ...address, city: e.target.value })
                  }
                  autoComplete="address-level2"
                />
              </div>
              <div className="admin__field">
                <label className="caption" htmlFor="u-zip">
                  ZIP code
                </label>
                <input
                  id="u-zip"
                  className="input"
                  value={address.postalCode}
                  onChange={(e) =>
                    setAddress({ ...address, postalCode: e.target.value })
                  }
                  autoComplete="postal-code"
                />
              </div>
            </div>
            <div className="admin__field">
              <label className="caption" htmlFor="u-state">
                State
              </label>
              <input
                id="u-state"
                className="input"
                value={address.state}
                onChange={(e) =>
                  setAddress({ ...address, state: e.target.value })
                }
                autoComplete="address-level1"
              />
            </div>
          </>
        )}

        {error && <p className="field-error">{error}</p>}

        <button
          type="submit"
          className="btn btn--primary btn--lg btn--block"
          disabled={status === 'loading'}
        >
          {status === 'loading'
            ? 'Please wait…'
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
