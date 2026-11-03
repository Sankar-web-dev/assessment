import { api } from './client';

// Create a new review
export const createReview = async (reviewData, token) => {
  return api('/reviews', {
    method: 'POST',
    body: reviewData,
    token,
  });
};

// Get all reviews for a specific product
export const getProductReviews = async (productId, page = 1, limit = 10) => {
  return api(`/reviews/product/${productId}?page=${page}&limit=${limit}`);
};

// Get all reviews by the current user
export const getUserReviews = async (token, page = 1, limit = 10) => {
  return api(`/reviews/user?page=${page}&limit=${limit}`, { token });
};

// Get a single review by ID
export const getReviewById = async (reviewId) => {
  return api(`/reviews/${reviewId}`);
};

// Update a review
export const updateReview = async (reviewId, reviewData, token) => {
  return api(`/reviews/${reviewId}`, {
    method: 'PUT',
    body: reviewData,
    token,
  });
};

// Delete a review
export const deleteReview = async (reviewId, token) => {
  return api(`/reviews/${reviewId}`, {
    method: 'DELETE',
    token,
  });
};
