import './ProductCard.css'

export default function SkeletonCard() {
  return (
    <div className="card-skeleton" aria-hidden="true">
      <div className="skeleton card-skeleton__media" />
      <div className="card-skeleton__body">
        <div className="skeleton" style={{ height: 12, width: '40%' }} />
        <div className="skeleton" style={{ height: 16, width: '90%' }} />
        <div className="skeleton" style={{ height: 12, width: '60%' }} />
        <div className="skeleton" style={{ height: 16, width: '35%' }} />
        <div className="skeleton" style={{ height: 44, width: '100%' }} />
      </div>
    </div>
  )
}
