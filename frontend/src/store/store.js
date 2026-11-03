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
import storage from 'redux-persist/lib/storage'
import productsReducer from './productsSlice'
import cartReducer from './cartSlice'
import adminReducer from './adminSlice'

const cartPersistConfig = {
  key: 'kadai-cart',
  storage,
  whitelist: ['items', 'coupon'],
}

const adminPersistConfig = {
  key: 'kadai-admin',
  storage,
}

const store = configureStore({
  reducer: {
    products: productsReducer,
    cart: persistReducer(cartPersistConfig, cartReducer),
    admin: persistReducer(adminPersistConfig, adminReducer),
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
