import { useEffect, useState } from 'react'
import { Link, useNavigate, useParams } from 'react-router-dom'
import { useDispatch, useSelector } from 'react-redux'
import { fetchProducts, fetchCategories } from '../../store/productsSlice'
import { addProduct, updateProduct } from '../../store/adminSlice'
import { selectAllProducts, selectAllCategories } from '../../store/selectors'

const EMPTY = {
  title: '',
  category: '',
  price: '',
  discountPercentage: '',
  stock: '',
  rating: '',
  brand: '',
  thumbnail: '',
  description: '',
}

export default function AdminProductForm() {
  const { id } = useParams()
  const isEdit = id !== undefined
  const dispatch = useDispatch()
  const navigate = useNavigate()

  const products = useSelector(selectAllProducts)
  const categories = useSelector(selectAllCategories)
  const listStatus = useSelector((s) => s.products.status)

  const [form, setForm] = useState(EMPTY)
  const [errors, setErrors] = useState({})
  const [notFound, setNotFound] = useState(false)

  useEffect(() => {
    if (listStatus === 'idle') dispatch(fetchProducts())
    if (categories.length === 0) dispatch(fetchCategories())
  }, [dispatch, listStatus, categories.length])

  // Prefill when editing
  useEffect(() => {
    if (!isEdit) return
    const existing = products.find((p) => p.id === Number(id))
    if (existing) {
      setForm({
        title: existing.title ?? '',
        category: existing.category ?? '',
        price: existing.price ?? '',
        discountPercentage: existing.discountPercentage ?? '',
        stock: existing.stock ?? '',
        rating: existing.rating ?? '',
        brand: existing.brand ?? '',
        thumbnail: existing.thumbnail ?? '',
        description: existing.description ?? '',
      })
    } else if (listStatus === 'succeeded') {
      setNotFound(true)
    }
  }, [isEdit, id, products, listStatus])

  const set = (key) => (e) =>
    setForm((f) => ({ ...f, [key]: e.target.value }))

  const validate = () => {
    const errs = {}
    if (!form.title.trim()) errs.title = 'Title is required'
    if (!form.category) errs.category = 'Category is required'
    if (form.price === '' || Number(form.price) <= 0)
      errs.price = 'Price must be greater than 0'
    if (form.stock === '' || Number(form.stock) < 0)
      errs.stock = 'Stock must be 0 or more'
    setErrors(errs)
    return Object.keys(errs).length === 0
  }

  const submit = (e) => {
    e.preventDefault()
    if (!validate()) return
    const existing = isEdit
      ? products.find((p) => p.id === Number(id))
      : undefined
    const thumb =
      form.thumbnail.trim() ||
      existing?.thumbnail ||
      'https://cdn.dummyjson.com/product-images/placeholder.webp'
    const payload = {
      // Keep API fields we don't expose in the form (reviews, dimensions…).
      ...existing,
      title: form.title.trim(),
      category: form.category,
      price: Number(form.price),
      discountPercentage: Number(form.discountPercentage) || 0,
      stock: Number(form.stock),
      rating: form.rating === '' ? 0 : Number(form.rating),
      brand: form.brand.trim() || undefined,
      thumbnail: thumb,
      images: existing?.images?.length ? existing.images : [thumb],
      description: form.description.trim() || 'No description provided.',
      reviews: existing?.reviews ?? [],
      availabilityStatus:
        Number(form.stock) === 0
          ? 'Out of Stock'
          : Number(form.stock) < 10
            ? 'Low Stock'
            : 'In Stock',
    }
    if (isEdit) {
      dispatch(updateProduct({ ...payload, id: Number(id) }))
    } else {
      dispatch(addProduct(payload))
    }
    navigate('/admin/products')
  }

  if (notFound) {
    return (
      <div className="state-box">
        <p>Product not found.</p>
        <Link to="/admin/products" className="btn btn--secondary">
          Back to products
        </Link>
      </div>
    )
  }

  return (
    <div className="admin__panel admin__panel--narrow">
      <div className="admin__panel-head">
        <h2 className="admin__panel-title">
          {isEdit ? 'Edit product' : 'Add product'}
        </h2>
        <Link to="/admin/products" className="btn btn--ghost btn--sm">
          Cancel
        </Link>
      </div>

      <form className="admin__form" onSubmit={submit} noValidate>
        <div className="admin__field">
          <label className="caption" htmlFor="f-title">
            Title
          </label>
          <input
            id="f-title"
            className={`input${errors.title ? ' input--error' : ''}`}
            value={form.title}
            onChange={set('title')}
            placeholder="Product name"
          />
          {errors.title && <p className="field-error">{errors.title}</p>}
        </div>

        <div className="admin__field">
          <label className="caption" htmlFor="f-category">
            Category
          </label>
          <select
            id="f-category"
            className={`input${errors.category ? ' input--error' : ''}`}
            value={form.category}
            onChange={set('category')}
          >
            <option value="">Select category</option>
            {categories.map((c) => (
              <option key={c.slug} value={c.slug}>
                {c.name}
              </option>
            ))}
          </select>
          {errors.category && <p className="field-error">{errors.category}</p>}
        </div>

        <div className="admin__grid-2">
          <div className="admin__field">
            <label className="caption" htmlFor="f-price">
              Price (USD)
            </label>
            <input
              id="f-price"
              type="number"
              min="0"
              step="0.01"
              className={`input${errors.price ? ' input--error' : ''}`}
              value={form.price}
              onChange={set('price')}
              placeholder="0.00"
            />
            {errors.price && <p className="field-error">{errors.price}</p>}
          </div>
          <div className="admin__field">
            <label className="caption" htmlFor="f-discount">
              Discount %
            </label>
            <input
              id="f-discount"
              type="number"
              min="0"
              max="100"
              step="0.01"
              className="input"
              value={form.discountPercentage}
              onChange={set('discountPercentage')}
              placeholder="0"
            />
          </div>
        </div>

        <div className="admin__grid-2">
          <div className="admin__field">
            <label className="caption" htmlFor="f-stock">
              Stock
            </label>
            <input
              id="f-stock"
              type="number"
              min="0"
              className={`input${errors.stock ? ' input--error' : ''}`}
              value={form.stock}
              onChange={set('stock')}
              placeholder="0"
            />
            {errors.stock && <p className="field-error">{errors.stock}</p>}
          </div>
          <div className="admin__field">
            <label className="caption" htmlFor="f-rating">
              Rating (0–5)
            </label>
            <input
              id="f-rating"
              type="number"
              min="0"
              max="5"
              step="0.1"
              className="input"
              value={form.rating}
              onChange={set('rating')}
              placeholder="0"
            />
          </div>
        </div>

        <div className="admin__field">
          <label className="caption" htmlFor="f-brand">
            Brand
          </label>
          <input
            id="f-brand"
            className="input"
            value={form.brand}
            onChange={set('brand')}
            placeholder="Brand name"
          />
        </div>

        <div className="admin__field">
          <label className="caption" htmlFor="f-thumb">
            Image URL
          </label>
          <input
            id="f-thumb"
            className="input"
            value={form.thumbnail}
            onChange={set('thumbnail')}
            placeholder="https://…"
          />
        </div>

        <div className="admin__field">
          <label className="caption" htmlFor="f-desc">
            Description
          </label>
          <textarea
            id="f-desc"
            className="input admin__textarea"
            rows={4}
            value={form.description}
            onChange={set('description')}
            placeholder="Product description"
          />
        </div>

        <div className="admin__form-actions">
          <button type="submit" className="btn btn--primary">
            {isEdit ? 'Save changes' : 'Add product'}
          </button>
          <Link to="/admin/products" className="btn btn--ghost">
            Cancel
          </Link>
        </div>
      </form>
    </div>
  )
}
