import { createSlice, createAsyncThunk } from '@reduxjs/toolkit'

const API = 'https://dummyjson.com'

async function getJson(url) {
  const res = await fetch(url)
  if (!res.ok) throw new Error(`Request failed (${res.status})`)
  return res.json()
}

export const fetchProducts = createAsyncThunk(
  'products/fetchProducts',
  async (_, { rejectWithValue }) => {
    try {
      const data = await getJson(`${API}/products?limit=0`)
      return data.products
    } catch (err) {
      return rejectWithValue(err.message)
    }
  },
)

export const fetchCategories = createAsyncThunk(
  'products/fetchCategories',
  async (_, { rejectWithValue }) => {
    try {
      return await getJson(`${API}/products/categories`)
    } catch (err) {
      return rejectWithValue(err.message)
    }
  },
)

export const fetchProductById = createAsyncThunk(
  'products/fetchProductById',
  async (id, { rejectWithValue }) => {
    try {
      return await getJson(`${API}/products/${id}`)
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
