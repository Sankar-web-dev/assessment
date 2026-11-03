import Icon from './Icon'
import './Pagination.css'

export default function Pagination({ page, pageCount, onChange }) {
  if (pageCount <= 1) return null

  const pages = Array.from({ length: pageCount }, (_, i) => i + 1)

  return (
    <nav className="pagination" aria-label="Pagination">
      <button
        type="button"
        className="pagination__btn"
        onClick={() => onChange(page - 1)}
        disabled={page <= 1}
        aria-label="Previous page"
      >
        <Icon name="chevronLeft" size={16} />
      </button>

      {pages.map((p) => (
        <button
          key={p}
          type="button"
          className={`pagination__btn${p === page ? ' pagination__btn--active' : ''}`}
          onClick={() => onChange(p)}
          aria-current={p === page ? 'page' : undefined}
        >
          {p}
        </button>
      ))}

      <button
        type="button"
        className="pagination__btn"
        onClick={() => onChange(page + 1)}
        disabled={page >= pageCount}
        aria-label="Next page"
      >
        <Icon name="chevronRight" size={16} />
      </button>
    </nav>
  )
}
