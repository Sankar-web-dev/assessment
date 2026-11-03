import { useEffect, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useDispatch, useSelector } from 'react-redux'
import { fetchProducts } from '../../store/productsSlice'
import { deleteProductApi } from '../../api/adminApi'
import { selectAllProducts } from '../../store/selectors'
import { discountedPrice, money } from '../../utils/money'
import Icon from '../../components/Icon'

export default function AdminProducts() {
  const dispatch = useDispatch()
  const navigate = useNavigate()
  const products = useSelector(selectAllProducts)
  const status = useSelector((s) => s.products.status)
  const [error, setError] = useState('')

  useEffect(() => {
    if (status === 'idle') dispatch(fetchProducts())
  }, [dispatch, status])

  const remove = async (p) => {
    setError('')
    try {
      await dispatch(deleteProductApi(p.id))
    } catch (err) {
      setError(err.message)
    }
  }

  return (
    <div className="admin__panel">
      <div className="admin__panel-head">
        <div>
          <h2 className="admin__panel-title">Products</h2>
          <p className="muted">{products.length} active products</p>
        </div>
        <Link to="/admin/products/new" className="btn btn--primary">
          <Icon name="plus" size={16} />
          Add product
        </Link>
      </div>

      {error && <p className="field-error">{error}</p>}

      <div className="admin__table-wrap">
        <table className="admin__table">
          <thead>
            <tr>
              <th>Product</th>
              <th>Category</th>
              <th>Price</th>
              <th>Stock</th>
              <th className="admin__col-actions">Actions</th>
            </tr>
          </thead>
          <tbody>
            {products.map((p) => (
              <tr key={p.id}>
                <td>
                  <div className="admin__product">
                    <span className="admin__thumb">
                      {p.thumbnail ? (
                        <img src={p.thumbnail} alt="" />
                      ) : (
                        <Icon name="image" size={16} />
                      )}
                    </span>
                    <span className="admin__product-name">{p.title}</span>
                  </div>
                </td>
                <td className="caption" style={{ textTransform: 'uppercase' }}>
                  {p.categoryName || p.category}
                </td>
                <td>
                  {money(discountedPrice(p))}
                  {p.discountPercentage > 0 && (
                    <s className="muted"> {money(p.price)}</s>
                  )}
                </td>
                <td>{p.stock}</td>
                <td className="admin__col-actions">
                  <button
                    type="button"
                    className="btn btn--ghost btn--sm"
                    onClick={() => navigate(`/admin/products/${p.id}/edit`)}
                  >
                    Edit
                  </button>
                  <button
                    type="button"
                    className="btn btn--danger btn--sm"
                    onClick={() => remove(p)}
                  >
                    Delete
                  </button>
                </td>
              </tr>
            ))}
            {products.length === 0 && status === 'succeeded' && (
              <tr>
                <td colSpan={5} className="muted" style={{ textAlign: 'center' }}>
                  No products — add one or run the backend seed.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  )
}
