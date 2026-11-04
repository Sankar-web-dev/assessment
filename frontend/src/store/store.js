import { configureStore } from '@reduxjs/toolkit'
import productsReducer from './productsSlice'
import cartReducer from './cartSlice'
import wishlistReducer from './wishlistSlice'
import authReducer from './authSlice'
import ordersReducer from './ordersSlice'

// One store, five slices. Auth is persisted so a refresh stays signed in;
// cart/orders/products/wishlist stay session-only by design.
const store = configureStore({
  reducer: {
    products: productsReducer,
    cart: cartReducer,
    wishlist: wishlistReducer,
    auth: authReducer,
    orders: ordersReducer,
  },
})

// Sync the auth session to localStorage on every change (login/logout).
store.subscribe(() => {
  const { token, user } = store.getState().auth
  localStorage.setItem('voltnex-auth', JSON.stringify({ token, user }))
})

export default store
