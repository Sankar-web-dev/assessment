import { configureStore } from '@reduxjs/toolkit'
import productsReducer from './productsSlice'
import cartReducer from './cartSlice'
import authReducer from './authSlice'
import ordersReducer from './ordersSlice'

// One store, four slices. No persistence — everything resets on refresh.
const store = configureStore({
  reducer: {
    products: productsReducer,
    cart: cartReducer,
    auth: authReducer,
    orders: ordersReducer,
  },
})

export default store
