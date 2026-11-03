import { createSelector } from '@reduxjs/toolkit'
import { discountedPrice, round2 } from '../utils/money'

export const FREE_SHIPPING_THRESHOLD = 50
export const SHIPPING_FEE = 4.99

/* ============ Catalog selectors (backed by the API) ============ */

export const selectAllProducts = (state) => state.products.items
export const selectAllCategories = (state) => state.products.categories
export const selectCoupons = (state) => state.products.coupons

/* ============ Cart selectors ============ */

export const selectCartMap = (state) => state.cart.items
export const selectCoupon = (state) => state.cart.coupon
export const selectCouponError = (state) => state.cart.couponError

export const selectCartItems = createSelector([selectCartMap], (items) =>
  Object.values(items),
)

export const selectCartItemCount = createSelector([selectCartItems], (items) =>
  items.reduce((sum, i) => sum + i.qty, 0),
)

// Subtotal uses the discounted unit price for each line.
export const selectSubtotal = createSelector([selectCartItems], (items) =>
  round2(items.reduce((sum, i) => sum + discountedPrice(i) * i.qty, 0)),
)

export const selectCouponDiscount = createSelector(
  [selectSubtotal, selectCoupon],
  (subtotal, coupon) =>
    coupon ? round2((subtotal * coupon.percent) / 100) : 0,
)

// Shipping is FREE when the subtotal is $50 or more, otherwise $4.99.
// (matches the backend pricing rules in doodlebackend/utils/pricing.js)
export const selectShipping = createSelector([selectSubtotal], (subtotal) =>
  subtotal <= 0 ? 0 : subtotal >= FREE_SHIPPING_THRESHOLD ? 0 : SHIPPING_FEE,
)

export const selectTotal = createSelector(
  [selectSubtotal, selectCouponDiscount, selectShipping],
  (subtotal, discount, shipping) => round2(subtotal - discount + shipping),
)
