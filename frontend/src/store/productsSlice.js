import { createSlice, createAsyncThunk } from '@reduxjs/toolkit'
import { api } from '../api/client'
import { normalizeProduct } from '../utils/normalize'

export const fetchProducts = createAsyncThunk(
  'products/fetchProducts',
  async (_, { rejectWithValue }) => {
    try {
      // GET /api/v1/products -> { products, pagination }
      const data = await api('/products?limit=50')
      return data.products.map(normalizeProduct)
    } catch (err) {
      return rejectWithValue(err.message)
    }
  },
)

export const fetchCategories = createAsyncThunk(
  'products/fetchCategories',
  async (_, { rejectWithValue }) => {
    try {
      // GET /api/v1/categories -> [{ _id, name, slug }]
      return await api('/categories')
    } catch (err) {
      return rejectWithValue(err.message)
    }
  },
)

export const fetchProductById = createAsyncThunk(
  'products/fetchProductById',
  async (id, { rejectWithValue }) => {
    try {
      // GET /api/v1/products/:id -> product
      return normalizeProduct(await api(`/products/${id}`))
    } catch (err) {
      return rejectWithValue(err.message)
    }
  },
)

// Admin-only: requires an auth token (401 without login).
export const fetchCoupons = createAsyncThunk(
  'products/fetchCoupons',
  async (_, { getState, rejectWithValue }) => {
    try {
      return await api('/coupons', { token: getState().auth.token })
    } catch (err) {
      return rejectWithValue(err.message)
    }
  },
)

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
  },
  extraReducers: (builder) => {
    builder
      // Product list
      .addCase(fetchProducts.pending, (state) => {
        state.status = 'loading'
        state.error = null
      })
      .addCase(fetchProducts.fulfilled, (state, action) => {
        state.status = 'succeeded'
        state.items = action.payload
      })
      .addCase(fetchProducts.rejected, (state, action) => {
        state.status = 'failed'
        state.error = action.payload || 'Could not load products.'
      })
      // Categories
      .addCase(fetchCategories.pending, (state) => {
        state.categoriesStatus = 'loading'
      })
      .addCase(fetchCategories.fulfilled, (state, action) => {
        state.categoriesStatus = 'succeeded'
        state.categories = action.payload
      })
      .addCase(fetchCategories.rejected, (state) => {
        state.categoriesStatus = 'failed'
      })
      // Coupons (admin)
      .addCase(fetchCoupons.pending, (state) => {
        state.couponsStatus = 'loading'
      })
      .addCase(fetchCoupons.fulfilled, (state, action) => {
        state.couponsStatus = 'succeeded'
        state.coupons = action.payload
      })
      .addCase(fetchCoupons.rejected, (state) => {
        state.couponsStatus = 'failed'
      })
      // Product detail
      .addCase(fetchProductById.pending, (state) => {
        state.detail = { data: null, status: 'loading', error: null }
      })
      .addCase(fetchProductById.fulfilled, (state, action) => {
        state.detail = { data: action.payload, status: 'succeeded', error: null }
      })
      .addCase(fetchProductById.rejected, (state, action) => {
        state.detail = {
          data: null,
          status: 'failed',
          error: action.payload || 'Could not load product.',
        }
      })
  },
})

export const { setSearch, clearDetail } = productsSlice.actions
export default productsSlice.reducer
