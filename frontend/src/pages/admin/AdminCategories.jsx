import { useEffect, useState } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { fetchCategories, fetchProducts } from '../../store/productsSlice'
import {
  createCategoryApi,
  updateCategoryApi,
  deleteCategoryApi,
} from '../../api/adminApi'
import { selectAllCategories, selectAllProducts } from '../../store/selectors'
import Icon from '../../components/Icon'

export default function AdminCategories() {
  const dispatch = useDispatch()
  const categories = useSelector(selectAllCategories)
  const products = useSelector(selectAllProducts)
  const catStatus = useSelector((s) => s.products.categoriesStatus)
  const listStatus = useSelector((s) => s.products.status)

  const [newName, setNewName] = useState('')
  const [editing, setEditing] = useState(null) // category _id being edited
  const [editName, setEditName] = useState('')
  const [error, setError] = useState('')

  useEffect(() => {
    if (catStatus === 'idle') dispatch(fetchCategories())
    if (listStatus === 'idle') dispatch(fetchProducts())
  }, [dispatch, catStatus, listStatus])

  const usageCount = (slug) =>
    products.filter((p) => p.category === slug).length

  const submit = async (e) => {
    e.preventDefault()
    const name = newName.trim()
    if (!name) return
    setError('')
    try {
      await dispatch(createCategoryApi({ name }))
      setNewName('')
    } catch (err) {
      setError(err.message)
    }
  }

  const saveEdit = async (c) => {
    setError('')
    try {
      await dispatch(updateCategoryApi(c._id, { name: editName.trim() }))
      setEditing(null)
    } catch (err) {
      setError(err.message)
    }
  }

  const remove = async (c) => {
    setError('')
    try {
      await dispatch(deleteCategoryApi(c._id))
    } catch (err) {
      // e.g. "Category has N product(s) and cannot be deleted"
      setError(err.message)
    }
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
              <th className="admin__col-actions">Actions</th>
            </tr>
          </thead>
          <tbody>
            {categories.map((c) => (
              <tr key={c._id}>
                <td>
                  {editing === c._id ? (
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
                <td className="admin__col-actions">
                  {editing === c._id ? (
                    <>
                      <button
                        type="button"
                        className="btn btn--primary btn--sm"
                        onClick={() => saveEdit(c)}
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
                          setEditing(c._id)
                          setEditName(c.name)
                        }}
                      >
                        Edit
                      </button>
                      <button
                        type="button"
                        className="btn btn--danger btn--sm"
                        onClick={() => remove(c)}
                      >
                        Delete
                      </button>
                    </>
                  )}
                </td>
              </tr>
            ))}
            {categories.length === 0 && catStatus === 'succeeded' && (
              <tr>
                <td colSpan={4} className="muted" style={{ textAlign: 'center' }}>
                  No categories yet — add one above.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  )
}
