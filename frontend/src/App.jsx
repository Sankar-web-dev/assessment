import { BrowserRouter, Routes, Route } from 'react-router-dom'
import { Provider } from 'react-redux'
import { PersistGate } from 'redux-persist/integration/react'
import store, { persistor } from './store/store'
import { ToastProvider } from './components/Toast'
import Header from './components/Header'
import Footer from './components/Footer'
import ProductListPage from './pages/ProductListPage'
import ProductDetailPage from './pages/ProductDetailPage'
import CartPage from './pages/CartPage'
import AdminLayout from './pages/admin/AdminLayout'
import AdminProducts from './pages/admin/AdminProducts'
import AdminProductForm from './pages/admin/AdminProductForm'
import AdminCategories from './pages/admin/AdminCategories'
import AdminCoupons from './pages/admin/AdminCoupons'
import { Navigate } from 'react-router-dom'

export default function App() {
  return (
    <Provider store={store}>
      <PersistGate loading={null} persistor={persistor}>
        <BrowserRouter>
          <ToastProvider>
            <div className="app">
              <Header />
              <main className="app__main">
                <Routes>
                  <Route path="/" element={<ProductListPage />} />
                  <Route path="/product/:id" element={<ProductDetailPage />} />
                  <Route path="/cart" element={<CartPage />} />
                  <Route path="/admin" element={<AdminLayout />}>
                    <Route index element={<Navigate to="/admin/products" replace />} />
                    <Route path="products" element={<AdminProducts />} />
                    <Route path="products/new" element={<AdminProductForm />} />
                    <Route path="products/:id/edit" element={<AdminProductForm />} />
                    <Route path="categories" element={<AdminCategories />} />
                    <Route path="coupons" element={<AdminCoupons />} />
                  </Route>
                  <Route path="*" element={<ProductListPage />} />
                </Routes>
              </main>
              <Footer />
            </div>
          </ToastProvider>
        </BrowserRouter>
      </PersistGate>
    </Provider>
  )
}

