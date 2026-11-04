import { useState } from 'react';
import RatingStars from './RatingStars';
import './ReviewForm.css';

export default function ReviewForm({ productId, initialReview, onSubmit, onCancel }) {
  const [rating, setRating] = useState(initialReview?.rating || 5);
  const [title, setTitle] = useState(initialReview?.title || '');
  const [comment, setComment] = useState(initialReview?.comment || '');
  const [hoverRating, setHoverRating] = useState(0);

  const handleSubmit = (e) => {
    e.preventDefault();
    onSubmit({
      productId,
      rating,
      title,
      comment,
    });
  };

  const handleRatingClick = (value) => {
    setRating(value);
  };

  return (
    <div className="review-form">
      <h3 className="review-form__title">
        {initialReview ? 'Edit Your Review' : 'Write a Review'}
      </h3>
      <form onSubmit={handleSubmit}>
        <div className="review-form__field">
          <label className="review-form__label">Rating</label>
          <div className="review-form__stars">
            {[1, 2, 3, 4, 5].map((value) => (
              <button
                key={value}
                type="button"
                className={`review-form__star ${
                  value <= (hoverRating || rating) ? 'review-form__star--active' : ''
                }`}
                onClick={() => handleRatingClick(value)}
                onMouseEnter={() => setHoverRating(value)}
                onMouseLeave={() => setHoverRating(0)}
              >
                ★
              </button>
            ))}
          </div>
        </div>

        <div className="review-form__field">
          <label className="review-form__label" htmlFor="title">
            Review Title
          </label>
          <input
            id="title"
            type="text"
            className="review-form__input"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="Summarize your review"
            required
          />
        </div>

        <div className="review-form__field">
          <label className="review-form__label" htmlFor="comment">
            Review
          </label>
          <textarea
            id="comment"
            className="review-form__textarea"
            value={comment}
            onChange={(e) => setComment(e.target.value)}
            placeholder="Share your experience with this product"
            rows={5}
            required
          />
        </div>

        <div className="review-form__actions">
          <button type="submit" className="review-form__btn review-form__btn--submit">
            {initialReview ? 'Update Review' : 'Submit Review'}
          </button>
          {onCancel && (
            <button
              type="button"
              className="review-form__btn review-form__btn--cancel"
              onClick={onCancel}
            >
              Cancel
            </button>
          )}
        </div>
      </form>
    </div>
  );
}
