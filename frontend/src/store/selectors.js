import { discountedPrice, round2 } from '../utils/money'

export const FREE_SHIPPING_THRESHOLD = 50
export const SHIPPING_FEE = 4.99

// Catalog selectors — plain functions that read derived values from state.
export const selectAllProducts = (state) => state.products.items
export const selectAllCategories = (state) => state.products.categories
export const selectCoupons = (state) => state.products.coupons

// Cart selectors
export const selectCartItems = (state) => state.cart.items
export const selectCoupon = (state) => state.cart.coupon
export const selectCouponError = (state) => state.cart.couponError

export const selectCartItemCount = (state) =>
  state.cart.items.reduce((sum, i) => sum + i.qty, 0)

// Subtotal uses the discounted unit price for each line.
export const selectSubtotal = (state) =>
  round2(
    state.cart.items.reduce((sum, i) => sum + discountedPrice(i) * i.qty, 0),
  )

export const selectCouponDiscount = (state) =>
  state.cart.coupon
    ? round2((selectSubtotal(state) * state.cart.coupon.percent) / 100)
    : 0

// Shipping is FREE when the subtotal is ₹50 or more, otherwise ₹4.99.
// (matches the backend pricing rules in doodlebackend/utils/pricing.js)
export const selectShipping = (state) => {
  const subtotal = selectSubtotal(state)
  return subtotal <= 0 ? 0 : subtotal >= FREE_SHIPPING_THRESHOLD ? 0 : SHIPPING_FEE
}

export const selectTotal = (state) =>
  round2(
    selectSubtotal(state) -
      selectCouponDiscount(state) +
      selectShipping(state),
  )
