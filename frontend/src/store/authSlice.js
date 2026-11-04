import { createSlice } from '@reduxjs/toolkit'
import { api } from '../api/client'

// Restore the session saved by the store subscribe() in store.js.
const saved = JSON.parse(localStorage.getItem('voltnex-auth') || '{}')

const initialState = {
  token: saved.token || null,
  user: saved.user || null,
  status: 'idle', // idle | loading | succeeded | failed
  error: null,
}

const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    logout(state) {
      state.token = null
      state.user = null
      state.status = 'idle'
      state.error = null
    },
    clearAuthError(state) {
      state.error = null
    },
    // Plain status actions — the thunks below dispatch these.
    authLoading(state) {
      state.status = 'loading'
      state.error = null
    },
    authSuccess(state, action) {
      state.status = 'succeeded'
      state.token = action.payload.token
      state.user = action.payload.user
    },
    authFailed(state, action) {
      state.status = 'failed'
      state.error = action.payload || 'Authentication failed'
    },
  },
})

export const { logout, clearAuthError, authLoading, authSuccess, authFailed } =
  authSlice.actions

// ---- Plain thunks (async action creators) --------------------
// POST /api/v1/login -> { user, token } — stored via authSuccess.
// Returns the session on success, null on failure.

export const login = ({ email, password }) => async (dispatch) => {
  dispatch(authLoading())
  try {
    const session = await api('/login', {
      method: 'POST',
      body: { email, password },
    })
    dispatch(authSuccess(session))
    return session
  } catch (err) {
    dispatch(authFailed(err.message))
    return null
  }
}

// POST /api/v1/signup (no token back) then log in automatically.
export const signup = ({ name, email, password }) => async (dispatch) => {
  dispatch(authLoading())
  try {
    await api('/signup', {
      method: 'POST',
      body: { name, email, password },
    })
    const session = await api('/login', {
      method: 'POST',
      body: { email, password },
    })
    dispatch(authSuccess(session))
    return session
  } catch (err) {
    dispatch(authFailed(err.message))
    return null
  }
}

export default authSlice.reducer
