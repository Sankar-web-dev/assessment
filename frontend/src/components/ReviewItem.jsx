import RatingStars from './RatingStars';
import './ReviewItem.css';

export default function ReviewItem({ review, isOwner, onEdit, onDelete }) {
  const date = new Date(review.createdAt).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });

  return (
    <div className="review-item">
      <div className="review-item__header">
        <div className="review-item__user">
          <div className="review-item__avatar">
            {review.user?.name?.charAt(0).toUpperCase() || 'U'}
          </div>
          <div className="review-item__user-info">
            <div className="review-item__name">{review.user?.name || 'Anonymous'}</div>
            <div className="review-item__date">{date}</div>
          </div>
        </div>
        {review.isVerifiedPurchase && (
          <span className="review-item__verified">Verified Purchase</span>
        )}
      </div>

      <div className="review-item__rating">
        <RatingStars rating={review.rating} />
      </div>

      <h4 className="review-item__title">{review.title}</h4>
      <p className="review-item__comment">{review.comment}</p>

      {isOwner && (
        <div className="review-item__actions">
          <button
            className="review-item__btn review-item__btn--edit"
            onClick={() => onEdit(review)}
          >
            Edit
          </button>
          <button
            className="review-item__btn review-item__btn--delete"
            onClick={() => onDelete(review._id)}
          >
            Delete
          </button>
        </div>
      )}
    </div>
  );
}
