import { createSlice } from '@reduxjs/toolkit'
import { api } from '../api/client'
import { fetchProducts } from './productsSlice'

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
    // Plain status actions — the thunks below dispatch these.
    checkoutStarted(state) {
      state.checkoutStatus = 'placing'
      state.checkoutError = null
    },
    checkoutPlaced(state) {
      state.checkoutStatus = 'placed'
    },
    checkoutFailed(state, action) {
      state.checkoutStatus = 'failed'
      state.checkoutError = action.payload || 'Order could not be placed'
    },
    myOrdersLoading(state) {
      state.myStatus = 'loading'
      state.myError = null
    },
    myOrdersLoaded(state, action) {
      state.myStatus = 'succeeded'
      state.myOrders = action.payload
    },
    myOrdersFailed(state, action) {
      state.myStatus = 'failed'
      state.myError = action.payload
    },
    allOrdersLoading(state) {
      state.allStatus = 'loading'
      state.allError = null
    },
    allOrdersLoaded(state, action) {
      state.allStatus = 'succeeded'
      state.allOrders = action.payload
    },
    allOrdersFailed(state, action) {
      state.allStatus = 'failed'
      state.allError = action.payload
    },
  },
})

export const {
  resetCheckout,
  checkoutStarted,
  checkoutPlaced,
  checkoutFailed,
  myOrdersLoading,
  myOrdersLoaded,
  myOrdersFailed,
  allOrdersLoading,
  allOrdersLoaded,
  allOrdersFailed,
} = ordersSlice.actions

// ---- Plain thunks (async action creators) --------------------
// Pattern: dispatch(loading) -> await api() -> dispatch(loaded | failed).
// Return contract: value on success; null (fetches/checkout) or the
// error message (status updates/cancel) on failure.

// POST /api/v1/orders — items: [{ productId, quantity }], optional couponCode.
// Requires an auth token; the backend decrements stock on success.
// Returns the created order, or null on failure (see checkoutError).
export const checkoutOrder = () => async (dispatch, getState) => {
  dispatch(checkoutStarted())
  const state = getState()
  const items = state.cart.items.map((i) => ({
    productId: i.id,
    quantity: i.qty,
  }))
  try {
    const order = await api('/orders', {
      method: 'POST',
      body: { items, couponCode: state.cart.coupon?.code || undefined },
      token: state.auth.token,
    })
    dispatch(checkoutPlaced())
    // Stock changed on the backend — refresh catalog
    dispatch(fetchProducts())
    return order
  } catch (err) {
    dispatch(checkoutFailed(err.message))
    return null
  }
}

// GET /api/v1/orders — the signed-in user's orders.
export const fetchMyOrders = () => async (dispatch, getState) => {
  dispatch(myOrdersLoading())
  try {
    const data = await api('/orders?limit=50', {
      token: getState().auth.token,
    })
    dispatch(myOrdersLoaded(data.orders))
    return data.orders
  } catch (err) {
    dispatch(myOrdersFailed(err.message))
    return null
  }
}

// Admin: GET /api/v1/orders/all — every user's orders.
export const fetchAllOrders = () => async (dispatch, getState) => {
  dispatch(allOrdersLoading())
  try {
    const data = await api('/orders/all?limit=50', {
      token: getState().auth.token,
    })
    dispatch(allOrdersLoaded(data.orders))
    return data.orders
  } catch (err) {
    dispatch(allOrdersFailed(err.message))
    return null
  }
}

// Admin: PATCH /api/v1/orders/:id/status — returns null on success,
// the error message on failure.
export const updateOrderStatus =
  ({ id, status }) =>
  async (dispatch, getState) => {
    try {
      await api(`/orders/${id}/status`, {
        method: 'PATCH',
        body: { status },
        token: getState().auth.token,
      })
      dispatch(fetchAllOrders())
      return null
    } catch (err) {
      return err.message || 'Could not update status'
    }
  }

// POST /api/v1/orders/:id/cancel — returns null on success,
// the error message on failure.
export const cancelOrder = (id) => async (dispatch, getState) => {
  try {
    await api(`/orders/${id}/cancel`, {
      method: 'POST',
      token: getState().auth.token,
    })
    dispatch(fetchMyOrders())
    return null
  } catch (err) {
    return err.message || 'Could not cancel order'
  }
}

export default ordersSlice.reducer
