import { createSlice, createAsyncThunk } from '@reduxjs/toolkit'
import { api } from '../api/client'

export const login = createAsyncThunk(
  'auth/login',
  async ({ email, password }, { rejectWithValue }) => {
    try {
      // POST /api/v1/login -> { user, token }
      return await api('/login', {
        method: 'POST',
        body: { email, password },
      })
    } catch (err) {
      return rejectWithValue(err.message)
    }
  },
)

export const signup = createAsyncThunk(
  'auth/signup',
  async ({ name, email, password }, { rejectWithValue }) => {
    try {
      // POST /api/v1/signup -> user (no token; log in afterwards)
      await api('/signup', {
        method: 'POST',
        body: { name, email, password },
      })
      const session = await api('/login', {
        method: 'POST',
        body: { email, password },
      })
      return session
    } catch (err) {
      return rejectWithValue(err.message)
    }
  },
)

const initialState = {
  token: null,
  user: null,
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
  },
  extraReducers: (builder) => {
    const pending = (state) => {
      state.status = 'loading'
      state.error = null
    }
    const fulfilled = (state, action) => {
      state.status = 'succeeded'
      state.token = action.payload.token
      state.user = action.payload.user
    }
    const rejected = (state, action) => {
      state.status = 'failed'
      state.error = action.payload || 'Authentication failed'
    }
    builder
      .addCase(login.pending, pending)
      .addCase(login.fulfilled, fulfilled)
      .addCase(login.rejected, rejected)
      .addCase(signup.pending, pending)
      .addCase(signup.fulfilled, fulfilled)
      .addCase(signup.rejected, rejected)
  },
})

export const { logout, clearAuthError } = authSlice.actions
export default authSlice.reducer
