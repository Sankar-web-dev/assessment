const Review = require("../models/review.model");
const Product = require("../models/product.model");

// Create a new review
exports.createReview = async (req, res, next) => {
    try {
        const { productId, rating, title, comment } = req.body;
        const userId = req.user.id;

        // Check if product exists
        const product = await Product.findById(productId);
        if (!product) {
            return res.status(404).json({ message: "Product not found" });
        }

        // Check if user already reviewed this product
        const existingReview = await Review.findOne({ user: userId, product: productId });
        if (existingReview) {
            return res.status(400).json({ message: "You have already reviewed this product" });
        }

        // Check if user has purchased this product (optional - you can implement this if you have order data)
        const isVerifiedPurchase = false; // You can add logic to check orders here

        const review = await Review.create({
            user: userId,
            product: productId,
            rating,
            title,
            comment,
            isVerifiedPurchase
        });

        // Update product's rating and review count
        await updateProductRating(productId);

        const populatedReview = await Review.findById(review._id)
            .populate("user", "name email")
            .populate("product", "name");

        res.status(201).json(populatedReview);
    } catch (error) {
        console.error('Error creating review:', error);
        next(error);
    }
};

// Get all reviews for a specific product
exports.getProductReviews = async (req, res, next) => {
    try {
        const { productId } = req.params;
        const page = parseInt(req.query.page) || 1;
        const limit = parseInt(req.query.limit) || 10;
        const skip = (page - 1) * limit;

        const reviews = await Review.find({ product: productId })
            .populate("user", "name email")
            .sort({ createdAt: -1 })
            .skip(skip)
            .limit(limit);

        const total = await Review.countDocuments({ product: productId });

        res.status(200).json({
            reviews,
            pagination: {
                page,
                limit,
                total,
                pages: Math.ceil(total / limit)
            }
        });
    } catch (error) {
        next(error);
    }
};

// Get all reviews by the current user
exports.getUserReviews = async (req, res, next) => {
    try {
        const userId = req.user.id;
        const page = parseInt(req.query.page) || 1;
        const limit = parseInt(req.query.limit) || 10;
        const skip = (page - 1) * limit;

        const reviews = await Review.find({ user: userId })
            .populate("product", "name price images")
            .sort({ createdAt: -1 })
            .skip(skip)
            .limit(limit);

        const total = await Review.countDocuments({ user: userId });

        res.status(200).json({
            reviews,
            pagination: {
                page,
                limit,
                total,
                pages: Math.ceil(total / limit)
            }
        });
    } catch (error) {
        next(error);
    }
};

// Get a single review by ID
exports.getReviewById = async (req, res, next) => {
    try {
        const { id } = req.params;
        const review = await Review.findById(id)
            .populate("user", "name email")
            .populate("product", "name");

        if (!review) {
            return res.status(404).json({ message: "Review not found" });
        }

        res.status(200).json(review);
    } catch (error) {
        next(error);
    }
};

// Update a review (only by the review owner)
exports.updateReview = async (req, res, next) => {
    try {
        const { id } = req.params;
        const { rating, title, comment } = req.body;
        const userId = req.user.id;

        const review = await Review.findById(id);
        if (!review) {
            return res.status(404).json({ message: "Review not found" });
        }

        // Check if user owns this review
        if (review.user.toString() !== userId) {
            return res.status(403).json({ message: "You can only update your own reviews" });
        }

        review.rating = rating || review.rating;
        review.title = title || review.title;
        review.comment = comment || review.comment;

        await review.save();

        // Update product's rating
        await updateProductRating(review.product);

        const populatedReview = await Review.findById(review._id)
            .populate("user", "name email")
            .populate("product", "name");

        res.status(200).json(populatedReview);
    } catch (error) {
        next(error);
    }
};

// Delete a review (only by the review owner or admin)
exports.deleteReview = async (req, res, next) => {
    try {
        const { id } = req.params;
        const userId = req.user.id;
        const userRole = req.user.role;

        const review = await Review.findById(id);
        if (!review) {
            return res.status(404).json({ message: "Review not found" });
        }

        // Check if user owns this review or is admin
        if (review.user.toString() !== userId && userRole !== "admin") {
            return res.status(403).json({ message: "You can only delete your own reviews" });
        }

        const productId = review.product;
        await Review.findByIdAndDelete(id);

        // Update product's rating
        await updateProductRating(productId);

        res.status(200).json({ message: "Review deleted successfully" });
    } catch (error) {
        next(error);
    }
};

// Helper function to update product's average rating and review count
async function updateProductRating(productId) {
    try {
        const reviews = await Review.find({ product: productId });
        const reviewCount = reviews.length;

        if (reviewCount === 0) {
            await Product.findByIdAndUpdate(productId, {
                rating: 0,
                reviewCount: 0
            });
            return;
        }

        const totalRating = reviews.reduce((sum, review) => sum + review.rating, 0);
        const averageRating = totalRating / reviewCount;

        await Product.findByIdAndUpdate(productId, {
            rating: Math.round(averageRating * 10) / 10, // Round to 1 decimal
            reviewCount
        });
    } catch (error) {
        console.error("Error updating product rating:", error);
    }
}
