import { createSlice } from '@reduxjs/toolkit'
import { api } from '../api/client'
import { normalizeProduct } from '../utils/normalize'

const initialState = {
  items: [],
  status: 'idle', // idle | loading | succeeded | failed
  error: null,
  categories: [],
  categoriesStatus: 'idle',
  coupons: [],
  couponsStatus: 'idle',
  detail: { data: null, status: 'idle', error: null },
  search: '',
}

const productsSlice = createSlice({
  name: 'products',
  initialState,
  reducers: {
    setSearch(state, action) {
      state.search = action.payload
    },
    clearDetail(state) {
      state.detail = { data: null, status: 'idle', error: null }
    },
    // Plain status actions — the thunks below dispatch these.
    productsLoading(state) {
      state.status = 'loading'
      state.error = null
    },
    productsLoaded(state, action) {
      state.status = 'succeeded'
      state.items = action.payload
    },
    productsFailed(state, action) {
      state.status = 'failed'
      state.error = action.payload || 'Could not load products.'
    },
    categoriesLoading(state) {
      state.categoriesStatus = 'loading'
    },
    categoriesLoaded(state, action) {
      state.categoriesStatus = 'succeeded'
      state.categories = action.payload
    },
    categoriesFailed(state) {
      state.categoriesStatus = 'failed'
    },
    couponsLoading(state) {
      state.couponsStatus = 'loading'
    },
    couponsLoaded(state, action) {
      state.couponsStatus = 'succeeded'
      state.coupons = action.payload
    },
    couponsFailed(state) {
      state.couponsStatus = 'failed'
    },
    detailLoading(state) {
      state.detail = { data: null, status: 'loading', error: null }
    },
    detailLoaded(state, action) {
      state.detail = { data: action.payload, status: 'succeeded', error: null }
    },
    detailFailed(state, action) {
      state.detail = {
        data: null,
        status: 'failed',
        error: action.payload || 'Could not load product.',
      }
    },
  },
})

export const {
  setSearch,
  clearDetail,
  productsLoading,
  productsLoaded,
  productsFailed,
  categoriesLoading,
  categoriesLoaded,
  categoriesFailed,
  couponsLoading,
  couponsLoaded,
  couponsFailed,
  detailLoading,
  detailLoaded,
  detailFailed,
} = productsSlice.actions

// ---- Plain thunks (async action creators) --------------------
// Pattern: dispatch(loading) -> await api() -> dispatch(loaded | failed).
// Each returns the data on success, null on failure.

// GET /api/v1/products -> { products, pagination }
export const fetchProducts = () => async (dispatch) => {
  dispatch(productsLoading())
  try {
    const data = await api('/products?limit=50')
    const items = data.products.map(normalizeProduct)
    dispatch(productsLoaded(items))
    return items
  } catch (err) {
    dispatch(productsFailed(err.message))
    return null
  }
}

// GET /api/v1/categories -> [{ _id, name, slug }]
export const fetchCategories = () => async (dispatch) => {
  dispatch(categoriesLoading())
  try {
    const categories = await api('/categories')
    dispatch(categoriesLoaded(categories))
    return categories
  } catch {
    dispatch(categoriesFailed())
    return null
  }
}

// GET /api/v1/products/:id -> product
export const fetchProductById = (id) => async (dispatch) => {
  dispatch(detailLoading())
  try {
    const product = normalizeProduct(await api(`/products/${id}`))
    dispatch(detailLoaded(product))
    return product
  } catch (err) {
    dispatch(detailFailed(err.message))
    return null
  }
}

// Admin-only: requires an auth token (401 without login).
export const fetchCoupons = () => async (dispatch, getState) => {
  dispatch(couponsLoading())
  try {
    const coupons = await api('/coupons', { token: getState().auth.token })
    dispatch(couponsLoaded(coupons))
    return coupons
  } catch {
    dispatch(couponsFailed())
    return null
  }
}

export default productsSlice.reducer
