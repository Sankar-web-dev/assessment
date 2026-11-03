import { useEffect, useState } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { fetchCategories, fetchProducts } from '../../store/productsSlice'
import {
  addCategory,
  updateCategory,
  deleteCategory,
} from '../../store/adminSlice'
import { selectAllCategories, selectAllProducts } from '../../store/selectors'
import Icon from '../../components/Icon'

export default function AdminCategories() {
  const dispatch = useDispatch()
  const categories = useSelector(selectAllCategories)
  const products = useSelector(selectAllProducts)
  const status = useSelector((s) => s.products.categoriesStatus)
  const listStatus = useSelector((s) => s.products.status)

  const [newName, setNewName] = useState('')
  const [editing, setEditing] = useState(null) // slug being edited
  const [editName, setEditName] = useState('')
  const [error, setError] = useState('')

  useEffect(() => {
    if (status === 'idle') dispatch(fetchCategories())
    if (listStatus === 'idle') dispatch(fetchProducts())
  }, [dispatch, status, listStatus])

  const usageCount = (slug) =>
    products.filter((p) => p.category === slug).length

  const submit = (e) => {
    e.preventDefault()
    const name = newName.trim()
    if (!name) return
    const slug = name
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/(^-|-$)/g, '')
    if (categories.some((c) => c.slug === slug)) {
      setError('Category already exists')
      return
    }
    dispatch(addCategory({ name, slug }))
    setNewName('')
    setError('')
  }

  return (
    <div className="admin__panel">
      <div className="admin__panel-head">
        <div>
          <h2 className="admin__panel-title">Categories</h2>
          <p className="muted">{categories.length} categories</p>
        </div>
      </div>

      <form className="admin__inline-form" onSubmit={submit}>
        <input
          className={`input${error ? ' input--error' : ''}`}
          placeholder="New category name"
          value={newName}
          onChange={(e) => {
            setNewName(e.target.value)
            setError('')
          }}
        />
        <button type="submit" className="btn btn--primary">
          <Icon name="plus" size={16} />
          Add category
        </button>
      </form>
      {error && <p className="field-error">{error}</p>}

      <div className="admin__table-wrap">
        <table className="admin__table">
          <thead>
            <tr>
              <th>Name</th>
              <th>Slug</th>
              <th>Products</th>
              <th>Source</th>
              <th className="admin__col-actions">Actions</th>
            </tr>
          </thead>
          <tbody>
            {categories.map((c) => (
              <tr key={c.slug}>
                <td>
                  {editing === c.slug ? (
                    <input
                      className="input"
                      style={{ height: 'var(--control-sm)', width: 200 }}
                      value={editName}
                      onChange={(e) => setEditName(e.target.value)}
                      autoFocus
                    />
                  ) : (
                    <strong>{c.name}</strong>
                  )}
                </td>
                <td className="muted">{c.slug}</td>
                <td>{usageCount(c.slug)}</td>
                <td>
                  <span className={`chip${c.source === 'custom' ? ' chip--active' : ''}`}>
                    {c.source === 'custom' ? 'Custom' : 'API'}
                  </span>
                </td>
                <td className="admin__col-actions">
                  {c.source === 'custom' ? (
                    editing === c.slug ? (
                      <>
                        <button
                          type="button"
                          className="btn btn--primary btn--sm"
                          onClick={() => {
                            dispatch(
                              updateCategory({ slug: c.slug, name: editName }),
                            )
                            setEditing(null)
                          }}
                        >
                          Save
                        </button>
                        <button
                          type="button"
                          className="btn btn--ghost btn--sm"
                          onClick={() => setEditing(null)}
                        >
                          Cancel
                        </button>
                      </>
                    ) : (
                      <>
                        <button
                          type="button"
                          className="btn btn--ghost btn--sm"
                          onClick={() => {
                            setEditing(c.slug)
                            setEditName(c.name)
                          }}
                        >
                          Edit
                        </button>
                        <button
                          type="button"
                          className="btn btn--danger btn--sm"
                          onClick={() => dispatch(deleteCategory(c.slug))}
                        >
                          Delete
                        </button>
                      </>
                    )
                  ) : (
                    <span className="muted" style={{ fontSize: 12 }}>
                      From API
                    </span>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}
