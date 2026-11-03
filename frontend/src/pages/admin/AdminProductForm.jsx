import { useEffect, useState } from 'react'
import { Link, useNavigate, useParams } from 'react-router-dom'
import { useDispatch, useSelector } from 'react-redux'
import { fetchProducts, fetchCategories } from '../../store/productsSlice'
import { createProductApi, updateProductApi } from '../../api/adminApi'
import { selectAllProducts, selectAllCategories } from '../../store/selectors'

const EMPTY = {
  name: '',
  categoryId: '',
  price: '',
  comparePrice: '',
  stock: '',
  rating: '',
  brand: '',
  image: '',
  description: '',
  isFeatured: false,
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
  const [submitError, setSubmitError] = useState('')
  const [saving, setSaving] = useState(false)
  const [notFound, setNotFound] = useState(false)

  useEffect(() => {
    if (listStatus === 'idle') dispatch(fetchProducts())
    if (categories.length === 0) dispatch(fetchCategories())
  }, [dispatch, listStatus, categories.length])

  // Prefill when editing
  useEffect(() => {
    if (!isEdit) return
    const existing = products.find((p) => String(p.id) === String(id))
    if (existing) {
      setForm({
        name: existing.title ?? '',
        categoryId: existing.categoryId ?? '',
        price: existing.sellingPrice ?? existing.price ?? '',
        comparePrice: existing.comparePrice || '',
        stock: existing.stock ?? '',
        rating: existing.rating ?? '',
        brand: existing.brand ?? '',
        image: existing.images?.[0] ?? '',
        description: existing.description ?? '',
        isFeatured: !!existing.isFeatured,
      })
    } else if (listStatus === 'succeeded') {
      setNotFound(true)
    }
  }, [isEdit, id, products, listStatus])

  const set = (key) => (e) =>
    setForm((f) => ({
      ...f,
      [key]: e.target.type === 'checkbox' ? e.target.checked : e.target.value,
    }))

  const validate = () => {
    const errs = {}
    if (!form.name.trim()) errs.name = 'Name is required'
    if (!form.categoryId) errs.categoryId = 'Category is required'
    if (form.price === '' || Number(form.price) <= 0)
      errs.price = 'Price must be greater than 0'
    if (form.comparePrice !== '' && Number(form.comparePrice) < Number(form.price))
      errs.comparePrice = 'Must be greater than or equal to price'
    if (form.stock === '' || Number(form.stock) < 0)
      errs.stock = 'Stock must be 0 or more'
    setErrors(errs)
    return Object.keys(errs).length === 0
  }

  const submit = async (e) => {
    e.preventDefault()
    if (!validate()) return
    setSaving(true)
    setSubmitError('')
    const payload = {
      name: form.name.trim(),
      description: form.description.trim() || 'No description provided.',
      category: form.categoryId, // backend expects the category ObjectId
      price: Number(form.price), // selling price
      comparePrice: Number(form.comparePrice) || 0, // original price → discount
      stock: Number(form.stock),
      rating: form.rating === '' ? 0 : Number(form.rating),
      brand: form.brand.trim() || undefined,
      images: form.image.trim() ? [form.image.trim()] : [],
      isFeatured: form.isFeatured,
    }
    try {
      if (isEdit) {
        await dispatch(updateProductApi(id, payload))
      } else {
        await dispatch(createProductApi(payload))
      }
      navigate('/admin/products')
    } catch (err) {
      setSubmitError(err.message)
    } finally {
      setSaving(false)
    }
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
          <label className="caption" htmlFor="f-name">
            Name
          </label>
          <input
            id="f-name"
            className={`input${errors.name ? ' input--error' : ''}`}
            value={form.name}
            onChange={set('name')}
            placeholder="Product name"
          />
          {errors.name && <p className="field-error">{errors.name}</p>}
        </div>

        <div className="admin__field">
          <label className="caption" htmlFor="f-category">
            Category
          </label>
          <select
            id="f-category"
            className={`input${errors.categoryId ? ' input--error' : ''}`}
            value={form.categoryId}
            onChange={set('categoryId')}
          >
            <option value="">Select category</option>
            {categories.map((c) => (
              <option key={c._id} value={c._id}>
                {c.name}
              </option>
            ))}
          </select>
          {errors.categoryId && (
            <p className="field-error">{errors.categoryId}</p>
          )}
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
            <label className="caption" htmlFor="f-compare">
              Compare price (original)
            </label>
            <input
              id="f-compare"
              type="number"
              min="0"
              step="0.01"
              className={`input${errors.comparePrice ? ' input--error' : ''}`}
              value={form.comparePrice}
              onChange={set('comparePrice')}
              placeholder="Optional — creates the discount"
            />
            {errors.comparePrice && (
              <p className="field-error">{errors.comparePrice}</p>
            )}
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
            placeholder="Kadai Basics"
          />
        </div>

        <div className="admin__field">
          <label className="caption" htmlFor="f-image">
            Image URL
          </label>
          <input
            id="f-image"
            className="input"
            value={form.image}
            onChange={set('image')}
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

        <label className="admin__switch" htmlFor="f-featured">
          <input
            id="f-featured"
            type="checkbox"
            checked={form.isFeatured}
            onChange={set('isFeatured')}
          />
          <span>Featured product</span>
        </label>

        {submitError && <p className="field-error">{submitError}</p>}

        <div className="admin__form-actions">
          <button type="submit" className="btn btn--primary" disabled={saving}>
            {saving ? 'Saving…' : isEdit ? 'Save changes' : 'Add product'}
          </button>
          <Link to="/admin/products" className="btn btn--ghost">
            Cancel
          </Link>
        </div>
      </form>
    </div>
  )
}
