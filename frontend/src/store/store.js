import { configureStore } from '@reduxjs/toolkit'
import {
  persistStore,
  persistReducer,
  FLUSH,
  REHYDRATE,
  PAUSE,
  PERSIST,
  PURGE,
  REGISTER,
} from 'redux-persist'
import productsReducer from './productsSlice'
import cartReducer from './cartSlice'
import authReducer from './authSlice'
import ordersReducer from './ordersSlice'

// localStorage adapter for redux-persist. Defined explicitly instead of
// importing 'redux-persist/lib/storage' — its CJS default export fails to
// unwrap under Vite, producing "storage.getItem is not a function".
const storage = {
  getItem: (key) => Promise.resolve(localStorage.getItem(key)),
  setItem: (key, value) => Promise.resolve(localStorage.setItem(key, value)),
  removeItem: (key) => Promise.resolve(localStorage.removeItem(key)),
}

const cartPersistConfig = {
  key: 'kadai-cart',
  storage,
  whitelist: ['items', 'coupon'],
}

const authPersistConfig = {
  key: 'kadai-auth',
  storage,
  whitelist: ['token', 'user'],
}

const store = configureStore({
  reducer: {
    products: productsReducer,
    cart: persistReducer(cartPersistConfig, cartReducer),
    auth: persistReducer(authPersistConfig, authReducer),
    orders: ordersReducer,
  },
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      serializableCheck: {
        ignoredActions: [FLUSH, REHYDRATE, PAUSE, PERSIST, PURGE, REGISTER],
      },
    }),
})

export const persistor = persistStore(store)
export default store
