const mongoose = require("mongoose");

const reviewSchema = new mongoose.Schema({
    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
        required: [true, "User is required"]
    },
    product: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Product",
        required: [true, "Product is required"]
    },
    rating: {
        type: Number,
        required: [true, "Rating is required"],
        min: 1,
        max: 5
    },
    title: {
        type: String,
        required: [true, "Review title is required"],
        trim: true
    },
    comment: {
        type: String,
        required: [true, "Review comment is required"],
        trim: true
    },
    isVerifiedPurchase: {
        type: Boolean,
        default: false
    }
},
{
    timestamps: true,
});

// Ensure one review per user per product
reviewSchema.index({ user: 1, product: 1 }, { unique: true });

const Review = mongoose.model("Review", reviewSchema);
module.exports = Review;
