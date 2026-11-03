import { createSlice } from '@reduxjs/toolkit'
import { api } from '../api/client'
import { selectSubtotal } from './selectors'

const initialState = {
  // keyed by product id: { id, title, price, discountPercentage, thumbnail, stock, category, qty }
  items: {},
  coupon: null, // { code, percent }
  couponError: null,
}

const cartSlice = createSlice({
  name: 'cart',
  initialState,
  reducers: {
    addToCart(state, action) {
      const { product, qty = 1 } = action.payload
      const existing = state.items[product.id]
      const nextQty = (existing?.qty || 0) + qty
      state.items[product.id] = {
        id: product.id,
        title: product.title,
        price: product.price,
        sellingPrice: product.sellingPrice,
        discountPercentage: product.discountPercentage || 0,
        thumbnail: product.thumbnail,
        stock: product.stock,
        category: product.categoryName || product.category,
        qty: Math.min(nextQty, product.stock ?? nextQty),
      }
    },
    increase(state, action) {
      const item = state.items[action.payload]
      if (item && item.qty < (item.stock ?? Infinity)) item.qty += 1
    },
    decrease(state, action) {
      const item = state.items[action.payload]
      if (!item) return
      if (item.qty <= 1) delete state.items[action.payload]
      else item.qty -= 1
    },
    removeItem(state, action) {
      delete state.items[action.payload]
    },
    clearCart(state) {
      state.items = {}
      state.coupon = null
      state.couponError = null
    },
    couponApplied(state, action) {
      state.coupon = action.payload // { code, percent }
      state.couponError = null
    },
    couponRejected(state, action) {
      state.coupon = null
      state.couponError = action.payload // 'Invalid coupon code'
    },
    removeCoupon(state) {
      state.coupon = null
      state.couponError = null
    },
  },
})

export const {
  addToCart,
  increase,
  decrease,
  removeItem,
  clearCart,
  couponApplied,
  couponRejected,
  removeCoupon,
} = cartSlice.actions

// Thunk: validate the entered code against the backend coupon API.
// POST /api/v1/coupons/validate -> { code, discountPercent, discount }
export const applyCoupon = (rawCode) => async (dispatch, getState) => {
  const code = String(rawCode || '').trim().toUpperCase()
  if (!code) {
    dispatch(removeCoupon())
    return
  }
  try {
    const data = await api('/coupons/validate', {
      method: 'POST',
      body: { code, subtotal: selectSubtotal(getState()) },
    })
    dispatch(couponApplied({ code: data.code, percent: data.discountPercent }))
  } catch (err) {
    dispatch(couponRejected(err.message || 'Invalid coupon code'))
  }
}

export default cartSlice.reducer
