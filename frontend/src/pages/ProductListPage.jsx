import { useEffect, useMemo, useState } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { useLocation, useSearchParams } from 'react-router-dom'
import { fetchProducts, fetchCategories, setSearch } from '../store/productsSlice'
import { selectAllProducts, selectAllCategories } from '../store/selectors'
import { discountedPrice } from '../utils/money'
import ProductCard from '../components/ProductCard'
import SkeletonCard from '../components/SkeletonCard'
import FiltersSidebar from '../components/FiltersSidebar'
import Pagination from '../components/Pagination'
import Icon from '../components/Icon'
import './ProductListPage.css'

const PAGE_SIZE = 8

const SORTS = [
  { value: 'featured', label: 'Popularity' },
  { value: 'deals', label: 'Best deals' },
  { value: 'price-asc', label: 'Price: Low to High' },
  { value: 'price-desc', label: 'Price: High to Low' },
  { value: 'rating-desc', label: 'Rating: High to Low' },
]

const EMPTY_FILTERS = { categories: [], minPrice: '', maxPrice: '', minRating: 0 }

const QUICK_TABS = [
  { key: 'all', label: 'All', icon: 'grid' },
  { key: 'electronics', label: 'Electronics', icon: 'monitor' },
  { key: 'gaming', label: 'Gaming', icon: 'gamepad' },
  { key: 'deals', label: 'Deals', icon: 'tag' },
]

// Search-driven category cards (matches the reference's type tiles)
const POPULAR = [
  { label: 'Laptops', q: 'laptop' },
  { label: 'Headphones', q: 'headphone' },
  { label: 'Keyboards', q: 'keyboard' },
  { label: 'Gaming', q: 'gaming' },
  { label: 'Mice', q: 'mouse' },
  { label: 'Monitors', q: 'monitor' },
]

export default function ProductListPage() {
  const dispatch = useDispatch()
  const items = useSelector(selectAllProducts)
  const categories = useSelector(selectAllCategories)
  const { status, error, search } = useSelector((s) => s.products)
  const [searchParams] = useSearchParams()
  const location = useLocation()

  const [draft, setDraft] = useState(EMPTY_FILTERS)
  const [applied, setApplied] = useState(EMPTY_FILTERS)
  const [sort, setSort] = useState('featured')
  const [page, setPage] = useState(1)
  const [filtersOpen, setFiltersOpen] = useState(false)

  useEffect(() => {
    if (status === 'idle') dispatch(fetchProducts())
    if (categories.length === 0) dispatch(fetchCategories())
  }, [dispatch, status, categories.length])

  // Header nav drives filters through the URL (?q=, ?cat=, ?sort=).
  /* eslint-disable react-hooks/set-state-in-effect */
  useEffect(() => {
    const q = searchParams.get('q')
    const cat = searchParams.get('cat')
    const sortParam = searchParams.get('sort')
    if (q !== null) dispatch(setSearch(q))
    if (cat) {
      setApplied((a) => ({ ...a, categories: [cat] }))
      setDraft((d) => ({ ...d, categories: [cat] }))
    }
    if (sortParam === 'deals') setSort('deals')
    setPage(1)
    if (searchParams.get('view') === 'products') {
      document
        .getElementById('products')
        ?.scrollIntoView({ behavior: 'smooth' })
    }
    if (location.hash === '#about') {
      setTimeout(
        () =>
          document
            .getElementById('about')
            ?.scrollIntoView({ behavior: 'smooth' }),
        50,
      )
    }
  }, [searchParams, location.hash, dispatch])
  /* eslint-enable react-hooks/set-state-in-effect */

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
      case 'deals':
        list = [...list].sort(
          (a, b) => (b.discountPercentage || 0) - (a.discountPercentage || 0),
        )
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
    dispatch(setSearch(''))
    setPage(1)
  }

  const quickTab = (key) => {
    if (key === 'all') {
      setDraft(EMPTY_FILTERS)
      setApplied(EMPTY_FILTERS)
      dispatch(setSearch(''))
      setSort('featured')
    } else if (key === 'deals') {
      setApplied((a) => ({ ...a, categories: [] }))
      setDraft((d) => ({ ...d, categories: [] }))
      setSort('deals')
    } else {
      setApplied((a) => ({ ...a, categories: [key] }))
      setDraft((d) => ({ ...d, categories: [key] }))
      if (sort === 'deals') setSort('featured')
    }
    setPage(1)
  }

  const tabActive = (key) =>
    key === 'all'
      ? applied.categories.length === 0 && sort !== 'deals' && !search.trim()
      : key === 'deals'
        ? sort === 'deals'
        : applied.categories.includes(key)

  const catName = (slug) =>
    categories.find((c) => c.slug === slug)?.name ?? slug

  const typeImage = (q) =>
    items.find((p) => p.title.toLowerCase().includes(q))?.thumbnail

  const searchType = (q) => {
    setApplied(EMPTY_FILTERS)
    setDraft(EMPTY_FILTERS)
    dispatch(setSearch(q))
    setPage(1)
    document.getElementById('products')?.scrollIntoView({ behavior: 'smooth' })
  }

  const featured =
    items.find((p) => p.isFeatured && p.category === 'gaming') ||
    items.find((p) => p.isFeatured) ||
    items[0]

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
            <span className="hero__pill">Up to 50% OFF</span>
            <h1 className="hero__title">
              Upgrade
              <span className="hero__title-grad">Your Tech</span>
            </h1>
            <p className="hero__text">
              Smart Choices. Better Performance.
            </p>
            <a href="#products" className="btn hero__cta">
              Shop Now
              <Icon name="arrowRight" size={16} />
            </a>
            <div className="hero__dots" aria-hidden="true">
              <span className="hero__dot is-active" />
              <span className="hero__dot" />
              <span className="hero__dot" />
            </div>
          </div>
          <div className="hero__art">
            {featured && (
              <img src={featured.thumbnail} alt={featured.title} />
            )}
          </div>
        </section>

        {/* Popular categories */}
        <section className="cats">
          <div className="cats__head">
            <h2 className="cats__title">Popular Categories</h2>
            <a href="#products" className="cats__all">
              View All
              <Icon name="arrowRight" size={14} />
            </a>
          </div>
          <div className="cats__row">
            {POPULAR.map((t) => (
              <button
                key={t.label}
                type="button"
                className="cats__card"
                onClick={() => searchType(t.q)}
              >
                <span className="cats__img">
                  {typeImage(t.q) ? (
                    <img src={typeImage(t.q)} alt={t.label} loading="lazy" />
                  ) : (
                    <Icon name="gamepad" size={28} />
                  )}
                </span>
                <span className="cats__name">{t.label}</span>
              </button>
            ))}
          </div>
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
              <div className="ptabs" role="tablist" aria-label="Quick filters">
                {QUICK_TABS.map((t) => (
                  <button
                    key={t.key}
                    type="button"
                    className={`ptabs__tab${tabActive(t.key) ? ' is-active' : ''}`}
                    onClick={() => quickTab(t.key)}
                  >
                    <Icon name={t.icon} size={16} />
                    {t.label}
                  </button>
                ))}
              </div>
              <label className="catalog__sort">
                <span className="muted">Sort by:</span>
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

            <p className="muted catalog__count">
              Showing {pageItems.length} of {filtered.length} product
              {filtered.length === 1 ? '' : 's'}
            </p>

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
