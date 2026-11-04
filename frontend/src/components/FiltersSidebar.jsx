import { useSelector } from 'react-redux'
import { selectAllCategories } from '../store/selectors'
import RatingStars from './RatingStars'
import './FiltersSidebar.css'

export const RATING_OPTIONS = [
  { value: 4, label: '4 stars & above' },
  { value: 3, label: '3 stars & above' },
  { value: 0, label: 'Any rating' },
]

const PRICE_RANGES = [
  { label: 'All prices', min: '', max: '' },
  { label: '₹0 – ₹50', min: '0', max: '50' },
  { label: '₹50 – ₹100', min: '50', max: '100' },
  { label: '₹100+', min: '100', max: '' },
]

export default function FiltersSidebar({ filters, onChange, onClear }) {
  const categories = useSelector(selectAllCategories)

  const toggleCategory = (slug) => {
    const next = filters.categories.includes(slug)
      ? filters.categories.filter((c) => c !== slug)
      : [...filters.categories, slug]
    onChange({ ...filters, categories: next })
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
          <li>
            <label className="filters__option">
              <input
                type="radio"
                name="category-all"
                checked={filters.categories.length === 0}
                onChange={() => onChange({ ...filters, categories: [] })}
              />
              <span>All products</span>
            </label>
          </li>
          {categories.map((c) => (
            <li key={c.slug}>
              <label className="filters__option">
                <input
                  type="checkbox"
                  checked={filters.categories.includes(c.slug)}
                  onChange={() => toggleCategory(c.slug)}
                />
                <span>{c.name}</span>
              </label>
            </li>
          ))}
        </ul>
      </section>

      <section className="filters__group">
        <h3 className="caption filters__label">Price Range</h3>
        <ul className="filters__list">
          {PRICE_RANGES.map((r) => (
            <li key={r.label}>
              <label className="filters__option">
                <input
                  type="radio"
                  name="price-range"
                  checked={
                    filters.minPrice === r.min && filters.maxPrice === r.max
                  }
                  onChange={() =>
                    onChange({ ...filters, minPrice: r.min, maxPrice: r.max })
                  }
                />
                <span>{r.label}</span>
              </label>
            </li>
          ))}
        </ul>
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
                  checked={filters.minRating === r.value}
                  onChange={() => onChange({ ...filters, minRating: r.value })}
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

    </aside>
  )
}
