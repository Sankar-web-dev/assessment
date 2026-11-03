import { useEffect, useMemo, useState } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { fetchProducts, fetchCategories } from '../store/productsSlice'
import { selectAllProducts, selectAllCategories } from '../store/selectors'
import { discountedPrice } from '../utils/money'
import ProductCard from '../components/ProductCard'
import SkeletonCard from '../components/SkeletonCard'
import FiltersSidebar, { RATING_OPTIONS } from '../components/FiltersSidebar'
import Pagination from '../components/Pagination'
import Icon from '../components/Icon'
import './ProductListPage.css'

const PAGE_SIZE = 8

const SORTS = [
  { value: 'featured', label: 'Featured' },
  { value: 'price-asc', label: 'Price: Low to High' },
  { value: 'price-desc', label: 'Price: High to Low' },
  { value: 'rating-desc', label: 'Rating: High to Low' },
]

const EMPTY_FILTERS = { categories: [], minPrice: '', maxPrice: '', minRating: 0 }

export default function ProductListPage() {
  const dispatch = useDispatch()
  const items = useSelector(selectAllProducts)
  const categories = useSelector(selectAllCategories)
  const { status, error, search } = useSelector((s) => s.products)

  const [draft, setDraft] = useState(EMPTY_FILTERS)
  const [applied, setApplied] = useState(EMPTY_FILTERS)
  const [sort, setSort] = useState('featured')
  const [page, setPage] = useState(1)
  const [filtersOpen, setFiltersOpen] = useState(false)

  useEffect(() => {
    if (status === 'idle') dispatch(fetchProducts())
    if (categories.length === 0) dispatch(fetchCategories())
  }, [dispatch, status, categories.length])

  const filtered = useMemo(() => {
    const min = parseFloat(applied.minPrice)
    const max = parseFloat(applied.maxPrice)
    const q = search.trim().toLowerCase()

    let list = items.filter((p) => {
      const price = discountedPrice(p)
      if (applied.categories.length && !applied.categories.includes(p.category))
        return false
      if (!Number.isNaN(min) && price < min) return false
      if (!Number.isNaN(max) && price > max) return false
      if (applied.minRating > 0 && p.rating < applied.minRating) return false
      if (
        q &&
        !`${p.title} ${p.brand ?? ''} ${p.category}`.toLowerCase().includes(q)
      )
        return false
      return true
    })

    switch (sort) {
      case 'price-asc':
        list = [...list].sort((a, b) => discountedPrice(a) - discountedPrice(b))
        break
      case 'price-desc':
        list = [...list].sort((a, b) => discountedPrice(b) - discountedPrice(a))
        break
      case 'rating-desc':
        list = [...list].sort((a, b) => b.rating - a.rating)
        break
      default:
        break
    }
    return list
  }, [items, applied, sort, search])

  const pageCount = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE))
  const safePage = Math.min(page, pageCount)
  const pageItems = filtered.slice(
    (safePage - 1) * PAGE_SIZE,
    safePage * PAGE_SIZE,
  )

  const applyFilters = () => {
    setApplied(draft)
    setPage(1)
    setFiltersOpen(false)
  }

  const clearFilters = () => {
    setDraft(EMPTY_FILTERS)
    setApplied(EMPTY_FILTERS)
    setPage(1)
  }

  const catName = (slug) =>
    categories.find((c) => c.slug === slug)?.name ?? slug

  const activeChips = [
    ...applied.categories.map((slug) => ({
      key: `cat-${slug}`,
      label: catName(slug),
      clear: () =>
        setApplied((a) => ({
          ...a,
          categories: a.categories.filter((c) => c !== slug),
        })),
    })),
    ...(applied.minRating > 0
      ? [
          {
            key: 'rating',
            label: `${applied.minRating} stars & up`,
            clear: () => setApplied((a) => ({ ...a, minRating: 0 })),
          },
        ]
      : []),
    ...(applied.minPrice !== '' || applied.maxPrice !== ''
      ? [
          {
            key: 'price',
            label: `$${applied.minPrice || '0'}–$${applied.maxPrice || '∞'}`,
            clear: () =>
              setApplied((a) => ({ ...a, minPrice: '', maxPrice: '' })),
          },
        ]
      : []),
  ]

  return (
    <div className="page">
      <div className="container">
        {/* Hero banner */}
        <section className="hero">
          <div className="hero__content">
            <span className="caption hero__eyebrow">This week only</span>
            <h1 className="hero__title">Shop smarter, save more</h1>
            <p className="hero__text">
              Use code <strong>SAVE10</strong> for 10% off your cart. Free
              shipping on orders of $50 or more.
            </p>
          </div>
          <a href="#products" className="btn hero__cta">
            Shop deals
          </a>
        </section>

        <div className="catalog" id="products">
          <button
            type="button"
            className="btn btn--ghost catalog__filters-toggle"
            onClick={() => setFiltersOpen((o) => !o)}
            aria-expanded={filtersOpen}
          >
            <Icon name="filter" size={16} />
            Filters
          </button>

          <div className={`catalog__sidebar${filtersOpen ? ' is-open' : ''}`}>
            <FiltersSidebar
              draft={draft}
              onChange={setDraft}
              onApply={applyFilters}
              onClear={clearFilters}
            />
          </div>

          <div className="catalog__main">
            <div className="catalog__toolbar">
              <div>
                <h2 className="catalog__title">All products</h2>
                <p className="muted catalog__count">
                  Showing {filtered.length} product
                  {filtered.length === 1 ? '' : 's'}
                </p>
              </div>
              <label className="catalog__sort">
                <span className="muted">Sort by</span>
                <select
                  className="input"
                  value={sort}
                  onChange={(e) => {
                    setSort(e.target.value)
                    setPage(1)
                  }}
                >
                  {SORTS.map((s) => (
                    <option key={s.value} value={s.value}>
                      {s.label}
                    </option>
                  ))}
                </select>
              </label>
            </div>

            {activeChips.length > 0 && (
              <div className="catalog__chips">
                <span className="muted">Active:</span>
                {activeChips.map((chip) => (
                  <span key={chip.key} className="chip chip--active">
                    {chip.label}
                    <button
                      type="button"
                      className="chip__close"
                      onClick={chip.clear}
                      aria-label={`Remove filter ${chip.label}`}
                    >
                      <Icon name="x" size={12} />
                    </button>
                  </span>
                ))}
              </div>
            )}

            {status === 'failed' ? (
              <div className="state-box state-box--error">
                <Icon name="alert" size={32} />
                <p>{error || 'Could not load products.'}</p>
                <button
                  type="button"
                  className="btn btn--danger"
                  style={{ background: 'var(--color-danger-700)', color: 'var(--color-white)' }}
                  onClick={() => dispatch(fetchProducts())}
                >
                  Retry
                </button>
              </div>
            ) : (
              <>
                <div className="catalog__grid">
                  {status === 'loading' || status === 'idle'
                    ? Array.from({ length: PAGE_SIZE }, (_, i) => (
                        <SkeletonCard key={i} />
                      ))
                    : pageItems.map((p) => (
                        <ProductCard key={p.id} product={p} />
                      ))}
                </div>

                {status === 'succeeded' && filtered.length === 0 && (
                  <div className="state-box">
                    <Icon name="search" size={32} />
                    <p>No products match your filters.</p>
                    <button
                      type="button"
                      className="btn btn--secondary"
                      onClick={clearFilters}
                    >
                      Clear filters
                    </button>
                  </div>
                )}

                <div className="catalog__pagination">
                  <Pagination
                    page={safePage}
                    pageCount={pageCount}
                    onChange={setPage}
                  />
                </div>
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
