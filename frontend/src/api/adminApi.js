import { api } from './client'
import {
  fetchProducts,
  fetchCategories,
  fetchCoupons,
} from '../store/productsSlice'

// Admin CRUD thunks. Each performs the API write (Bearer token required)
// and then refreshes the corresponding slice data so UI stays in sync.
// Errors propagate as Error objects — callers should try/catch.

export const createProductApi = (payload) => async (dispatch, getState) => {
  await api('/products', {
    method: 'POST',
    body: payload,
    token: getState().auth.token,
  })
  await dispatch(fetchProducts())
}

export const updateProductApi = (id, payload) => async (dispatch, getState) => {
  await api(`/products/${id}`, {
    method: 'PUT',
    body: payload,
    token: getState().auth.token,
  })
  await dispatch(fetchProducts())
}

export const deleteProductApi = (id) => async (dispatch, getState) => {
  await api(`/products/${id}`, {
    method: 'DELETE',
    token: getState().auth.token,
  })
  await dispatch(fetchProducts())
}

export const createCategoryApi = (payload) => async (dispatch, getState) => {
  await api('/categories', {
    method: 'POST',
    body: payload,
    token: getState().auth.token,
  })
  await dispatch(fetchCategories())
}

export const updateCategoryApi = (id, payload) => async (dispatch, getState) => {
  await api(`/categories/${id}`, {
    method: 'PUT',
    body: payload,
    token: getState().auth.token,
  })
  await dispatch(fetchCategories())
}

export const deleteCategoryApi = (id) => async (dispatch, getState) => {
  await api(`/categories/${id}`, {
    method: 'DELETE',
    token: getState().auth.token,
  })
  await dispatch(fetchCategories())
}

export const createCouponApi = (payload) => async (dispatch, getState) => {
  await api('/coupons', {
    method: 'POST',
    body: payload,
    token: getState().auth.token,
  })
  await dispatch(fetchCoupons())
}

export const updateCouponApi = (id, payload) => async (dispatch, getState) => {
  await api(`/coupons/${id}`, {
    method: 'PUT',
    body: payload,
    token: getState().auth.token,
  })
  await dispatch(fetchCoupons())
}

export const deleteCouponApi = (id) => async (dispatch, getState) => {
  await api(`/coupons/${id}`, {
    method: 'DELETE',
    token: getState().auth.token,
  })
  await dispatch(fetchCoupons())
}
