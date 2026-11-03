import { useSelector } from 'react-redux'
import { selectAllCategories } from '../store/selectors'
import RatingStars from './RatingStars'
import './FiltersSidebar.css'

export const RATING_OPTIONS = [
  { value: 4, label: '4 stars & up' },
  { value: 3, label: '3 stars & up' },
  { value: 0, label: 'Any rating' },
]

export default function FiltersSidebar({ draft, onChange, onApply, onClear }) {
  const categories = useSelector(selectAllCategories)

  const toggleCategory = (slug) => {
    const next = draft.categories.includes(slug)
      ? draft.categories.filter((c) => c !== slug)
      : [...draft.categories, slug]
    onChange({ ...draft, categories: next })
  }

  return (
    <aside className="filters">
      <div className="filters__head">
        <h2 className="filters__title">Filters</h2>
        <button type="button" className="filters__clear" onClick={onClear}>
          Clear all
        </button>
      </div>

      <section className="filters__group">
        <h3 className="caption filters__label">Category</h3>
        <ul className="filters__list">
          {categories.map((c) => (
            <li key={c.slug}>
              <label className="filters__option">
                <input
                  type="checkbox"
                  checked={draft.categories.includes(c.slug)}
                  onChange={() => toggleCategory(c.slug)}
                />
                <span>{c.name}</span>
              </label>
            </li>
          ))}
        </ul>
      </section>

      <section className="filters__group">
        <h3 className="caption filters__label">Price</h3>
        <div className="filters__price">
          <input
            type="number"
            className="input"
            placeholder="Min"
            min="0"
            value={draft.minPrice}
            onChange={(e) => onChange({ ...draft, minPrice: e.target.value })}
            aria-label="Minimum price"
          />
          <span className="muted">to</span>
          <input
            type="number"
            className="input"
            placeholder="Max"
            min="0"
            value={draft.maxPrice}
            onChange={(e) => onChange({ ...draft, maxPrice: e.target.value })}
            aria-label="Maximum price"
          />
        </div>
      </section>

      <section className="filters__group">
        <h3 className="caption filters__label">Customer rating</h3>
        <ul className="filters__list">
          {RATING_OPTIONS.map((r) => (
            <li key={r.value}>
              <label className="filters__option">
                <input
                  type="radio"
                  name="min-rating"
                  checked={draft.minRating === r.value}
                  onChange={() => onChange({ ...draft, minRating: r.value })}
                />
                <span className="filters__rating">
                  {r.value > 0 && <RatingStars rating={r.value} />}
                  {r.label}
                </span>
              </label>
            </li>
          ))}
        </ul>
      </section>

      <button
        type="button"
        className="btn btn--primary btn--block"
        onClick={onApply}
      >
        Apply filters
      </button>
    </aside>
  )
}
