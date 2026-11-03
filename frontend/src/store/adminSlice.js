import { createSlice } from '@reduxjs/toolkit'

// Admin-managed data. Persisted via redux-persist and merged with
// dummyjson API data through selectors.
const initialState = {
  customProducts: [], // products created in admin
  productOverrides: {}, // id -> edited copy of an API product
  deletedIds: [], // API product ids hidden from the store
  customCategories: [], // { slug, name }
  coupons: [{ code: 'SAVE10', percent: 10, active: true }],
}

const slugify = (text) =>
  String(text)
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)/g, '')

const adminSlice = createSlice({
  name: 'admin',
  initialState,
  reducers: {
    /* ---------- Products ---------- */
    addProduct(state, action) {
      state.customProducts.push({ ...action.payload, id: Date.now() })
    },
    updateProduct(state, action) {
      const product = action.payload
      const idx = state.customProducts.findIndex((p) => p.id === product.id)
      if (idx !== -1) state.customProducts[idx] = product
      else state.productOverrides[product.id] = product
    },
    deleteProduct(state, action) {
      const id = action.payload
      const idx = state.customProducts.findIndex((p) => p.id === id)
      if (idx !== -1) {
        state.customProducts.splice(idx, 1)
      } else {
        if (!state.deletedIds.includes(id)) state.deletedIds.push(id)
        delete state.productOverrides[id]
      }
    },
    restoreProduct(state, action) {
      const id = action.payload
      state.deletedIds = state.deletedIds.filter((d) => d !== id)
      delete state.productOverrides[id]
    },

    /* ---------- Categories ---------- */
    addCategory(state, action) {
      const name = String(action.payload.name || '').trim()
      if (!name) return
      const slug = action.payload.slug || slugify(name)
      const exists =
        state.customCategories.some((c) => c.slug === slug)
      if (!exists) state.customCategories.push({ slug, name })
    },
    updateCategory(state, action) {
      const { slug, name } = action.payload
      const cat = state.customCategories.find((c) => c.slug === slug)
      if (cat) cat.name = String(name).trim() || cat.name
    },
    deleteCategory(state, action) {
      const slug = action.payload
      state.customCategories = state.customCategories.filter(
        (c) => c.slug !== slug,
      )
    },

    /* ---------- Coupons ---------- */
    addCoupon(state, action) {
      const code = String(action.payload.code || '')
        .trim()
        .toUpperCase()
      if (!code || state.coupons.some((c) => c.code === code)) return
      state.coupons.push({
        code,
        percent: Number(action.payload.percent) || 0,
        active: action.payload.active !== false,
      })
    },
    updateCoupon(state, action) {
      const { code, percent, active } = action.payload
      const coupon = state.coupons.find((c) => c.code === code)
      if (!coupon) return
      if (percent !== undefined) coupon.percent = Number(percent) || 0
      if (active !== undefined) coupon.active = active
    },
    deleteCoupon(state, action) {
      const code = String(action.payload).toUpperCase()
      state.coupons = state.coupons.filter((c) => c.code !== code)
    },
  },
})

export const {
  addProduct,
  updateProduct,
  deleteProduct,
  restoreProduct,
  addCategory,
  updateCategory,
  deleteCategory,
  addCoupon,
  updateCoupon,
  deleteCoupon,
} = adminSlice.actions

export default adminSlice.reducer
