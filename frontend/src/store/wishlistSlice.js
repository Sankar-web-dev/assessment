import { createSlice } from '@reduxjs/toolkit'

// Wishlist items keyed by product id — stores a small product snapshot so a
// wishlist view can render without refetching.
const wishlistSlice = createSlice({
  name: 'wishlist',
  initialState: { items: {} },
  reducers: {
    toggleWishlist(state, action) {
      const p = action.payload
      if (state.items[p.id]) {
        delete state.items[p.id]
      } else {
        state.items[p.id] = {
          id: p.id,
          title: p.title,
          price: p.price,
          discountPercentage: p.discountPercentage || 0,
          thumbnail: p.thumbnail,
        }
      }
    },
    clearWishlist(state) {
      state.items = {}
    },
  },
})

export const { toggleWishlist, clearWishlist } = wishlistSlice.actions
export default wishlistSlice.reducer
