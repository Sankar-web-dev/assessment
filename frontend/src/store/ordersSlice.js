import { createSlice, createAsyncThunk } from '@reduxjs/toolkit'
import { api } from '../api/client'
import { fetchProducts } from './productsSlice'

// POST /api/v1/orders — items: [{ productId, quantity }], optional couponCode.
// Requires an auth token; the backend decrements stock on success.
export const checkoutOrder = createAsyncThunk(
  'orders/checkout',
  async (_, { getState, dispatch, rejectWithValue }) => {
    const state = getState()
    const items = Object.values(state.cart.items).map((i) => ({
      productId: i.id,
      quantity: i.qty,
    }))
    try {
      const order = await api('/orders', {
        method: 'POST',
        body: { items, couponCode: state.cart.coupon?.code || undefined },
        token: state.auth.token,
      })
      // Stock changed on the backend — refresh catalog
      dispatch(fetchProducts())
      return order
    } catch (err) {
      return rejectWithValue(err.message)
    }
  },
)

export const fetchMyOrders = createAsyncThunk(
  'orders/fetchMy',
  async (_, { getState, rejectWithValue }) => {
    try {
      const data = await api('/orders?limit=50', {
        token: getState().auth.token,
      })
      return data.orders
    } catch (err) {
      return rejectWithValue(err.message)
    }
  },
)

// Admin: every user's orders
export const fetchAllOrders = createAsyncThunk(
  'orders/fetchAll',
  async (_, { getState, rejectWithValue }) => {
    try {
      const data = await api('/orders/all?limit=50', {
        token: getState().auth.token,
      })
      return data.orders
    } catch (err) {
      return rejectWithValue(err.message)
    }
  },
)

export const updateOrderStatus = createAsyncThunk(
  'orders/updateStatus',
  async ({ id, status }, { getState, dispatch, rejectWithValue }) => {
    try {
      await api(`/orders/${id}/status`, {
        method: 'PATCH',
        body: { status },
        token: getState().auth.token,
      })
      dispatch(fetchAllOrders())
    } catch (err) {
      return rejectWithValue(err.message)
    }
  },
)

export const cancelOrder = createAsyncThunk(
  'orders/cancel',
  async (id, { getState, dispatch, rejectWithValue }) => {
    try {
      await api(`/orders/${id}/cancel`, {
        method: 'POST',
        token: getState().auth.token,
      })
      dispatch(fetchMyOrders())
    } catch (err) {
      return rejectWithValue(err.message)
    }
  },
)

const initialState = {
  myOrders: [],
  myStatus: 'idle',
  myError: null,
  allOrders: [],
  allStatus: 'idle',
  allError: null,
  checkoutStatus: 'idle', // idle | placing | placed | failed
  checkoutError: null,
}

const ordersSlice = createSlice({
  name: 'orders',
  initialState,
  reducers: {
    resetCheckout(state) {
      state.checkoutStatus = 'idle'
      state.checkoutError = null
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(checkoutOrder.pending, (state) => {
        state.checkoutStatus = 'placing'
        state.checkoutError = null
      })
      .addCase(checkoutOrder.fulfilled, (state) => {
        state.checkoutStatus = 'placed'
      })
      .addCase(checkoutOrder.rejected, (state, action) => {
        state.checkoutStatus = 'failed'
        state.checkoutError = action.payload || 'Order could not be placed'
      })
      .addCase(fetchMyOrders.pending, (state) => {
        state.myStatus = 'loading'
        state.myError = null
      })
      .addCase(fetchMyOrders.fulfilled, (state, action) => {
        state.myStatus = 'succeeded'
        state.myOrders = action.payload
      })
      .addCase(fetchMyOrders.rejected, (state, action) => {
        state.myStatus = 'failed'
        state.myError = action.payload
      })
      .addCase(fetchAllOrders.pending, (state) => {
        state.allStatus = 'loading'
        state.allError = null
      })
      .addCase(fetchAllOrders.fulfilled, (state, action) => {
        state.allStatus = 'succeeded'
        state.allOrders = action.payload
      })
      .addCase(fetchAllOrders.rejected, (state, action) => {
        state.allStatus = 'failed'
        state.allError = action.payload
      })
  },
})

export const { resetCheckout } = ordersSlice.actions
export default ordersSlice.reducer
