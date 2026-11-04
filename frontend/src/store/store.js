import { configureStore } from '@reduxjs/toolkit'
import productsReducer from './productsSlice'
import cartReducer from './cartSlice'
import wishlistReducer from './wishlistSlice'
import authReducer from './authSlice'
import ordersReducer from './ordersSlice'

// One store, five slices. No persistence — everything resets on refresh.
const store = configureStore({
  reducer: {
    products: productsReducer,
    cart: cartReducer,
    wishlist: wishlistReducer,
    auth: authReducer,
    orders: ordersReducer,
  },
})

export default store
