const express = require('express');
const router = express.Router();
const reviewController = require('../controllers/review.controller');
const authMiddleware = require("../middleware/auth.middleware");

// Create a review (authenticated users only)
router.post('/', authMiddleware, reviewController.createReview);

// Get all reviews for a specific product (public)
router.get('/product/:productId', reviewController.getProductReviews);

// Get all reviews by the current user (authenticated)
router.get('/user', authMiddleware, reviewController.getUserReviews);

// Get a single review by ID (public)
router.get('/:id', reviewController.getReviewById);

// Update a review (only by the review owner)
router.put('/:id', authMiddleware, reviewController.updateReview);

// Delete a review (only by the review owner or admin)
router.delete('/:id', authMiddleware, reviewController.deleteReview);

module.exports = router;
