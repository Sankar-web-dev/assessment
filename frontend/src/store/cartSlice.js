import { createSlice } from '@reduxjs/toolkit'
import { api } from '../api/client'
import { selectSubtotal } from './selectors'

const initialState = {
  // [{ id, title, price, sellingPrice, discountPercentage, thumbnail, stock, category, qty }]
  items: [],
  coupon: null, // { code, percent }
  couponError: null,
}

const findItem = (state, id) => state.items.find((i) => i.id === id)

const cartSlice = createSlice({
  name: 'cart',
  initialState,
  reducers: {
    addToCart(state, action) {
      const { product, qty = 1 } = action.payload
      const item = findItem(state, product.id)
      if (item) {
        item.qty = Math.min(item.qty + qty, product.stock ?? item.qty + qty)
        return
      }
      state.items.push({
        id: product.id,
        title: product.title,
        price: product.price,
        sellingPrice: product.sellingPrice,
        discountPercentage: product.discountPercentage || 0,
        thumbnail: product.thumbnail,
        stock: product.stock,
        category: product.categoryName || product.category,
        qty: Math.min(qty, product.stock ?? qty),
      })
    },
    increase(state, action) {
      const item = findItem(state, action.payload)
      if (item && item.qty < (item.stock ?? Infinity)) item.qty += 1
    },
    decrease(state, action) {
      const item = findItem(state, action.payload)
      if (!item) return
      if (item.qty <= 1) {
        state.items = state.items.filter((i) => i.id !== action.payload)
      } else {
        item.qty -= 1
      }
    },
    removeItem(state, action) {
      state.items = state.items.filter((i) => i.id !== action.payload)
    },
    clearCart(state) {
      state.items = []
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

// POST /api/v1/coupons/validate — applies the coupon or stores the error.
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
