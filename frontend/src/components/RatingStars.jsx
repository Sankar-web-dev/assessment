import './RatingStars.css'

function Star({ color }) {
  return (
    <svg
      width="14"
      height="14"
      viewBox="0 0 24 24"
      fill={color}
      aria-hidden="true"
    >
      <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
    </svg>
  )
}

export default function RatingStars({ rating = 0 }) {
  const pct = Math.max(0, Math.min(100, (rating / 5) * 100))
  const row = (color) => (
    <span className="stars__row">
      {Array.from({ length: 5 }, (_, i) => (
        <Star key={i} color={color} />
      ))}
    </span>
  )
  return (
    <span className="stars" aria-label={`Rated ${rating} out of 5`}>
      {row('var(--color-gray-300)')}
      <span className="stars__fill" style={{ width: `${pct}%` }}>
        {row('var(--color-warning-700)')}
      </span>
    </span>
  )
}
