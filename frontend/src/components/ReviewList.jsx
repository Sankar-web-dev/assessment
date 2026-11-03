import ReviewItem from './ReviewItem';
import './ReviewList.css';

export default function ReviewList({ reviews, currentUserId, onEdit, onDelete, loading }) {
  if (loading) {
    return (
      <div className="review-list">
        <div className="review-list__loading">Loading reviews...</div>
      </div>
    );
  }

  if (!reviews || reviews.length === 0) {
    return (
      <div className="review-list">
        <div className="review-list__empty">No reviews yet. Be the first to review!</div>
      </div>
    );
  }

  return (
    <div className="review-list">
      {reviews.map((review) => (
        <ReviewItem
          key={review._id}
          review={review}
          isOwner={review.user?._id === currentUserId || String(review.user?._id) === String(currentUserId)}
          onEdit={onEdit}
          onDelete={onDelete}
        />
      ))}
    </div>
  );
}
