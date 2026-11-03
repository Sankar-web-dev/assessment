import { useEffect } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useDispatch, useSelector } from 'react-redux'
import { fetchProducts } from '../../store/productsSlice'
import { deleteProduct, restoreProduct } from '../../store/adminSlice'
import { selectAllProducts } from '../../store/selectors'
import { discountedPrice, money } from '../../utils/money'
import Icon from '../../components/Icon'

export default function AdminProducts() {
  const dispatch = useDispatch()
  const navigate = useNavigate()
  const products = useSelector(selectAllProducts)
  const deletedIds = useSelector((s) => s.admin.deletedIds)
  const customProducts = useSelector((s) => s.admin.customProducts)
  const isCustom = (id) => customProducts.some((c) => c.id === id)
  const allApiItems = useSelector((s) => s.products.items)
  const status = useSelector((s) => s.products.status)

  useEffect(() => {
    if (status === 'idle') dispatch(fetchProducts())
  }, [dispatch, status])

  const deleted = allApiItems.filter((p) => deletedIds.includes(p.id))

  return (
    <div className="admin__panel">
      <div className="admin__panel-head">
        <div>
          <h2 className="admin__panel-title">Products</h2>
          <p className="muted">{products.length} live products</p>
        </div>
        <Link to="/admin/products/new" className="btn btn--primary">
          <Icon name="plus" size={16} />
          Add product
        </Link>
      </div>

      <div className="admin__table-wrap">
        <table className="admin__table">
          <thead>
            <tr>
              <th>Product</th>
              <th>Category</th>
              <th>Price</th>
              <th>Stock</th>
              <th>Source</th>
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
                  {p.category}
                </td>
                <td>
                  {money(discountedPrice(p))}
                  {p.discountPercentage > 0 && (
                    <s className="muted"> {money(p.price)}</s>
                  )}
                </td>
                <td>{p.stock}</td>
                <td>
                  <span className={`chip${isCustom(p.id) ? ' chip--active' : ''}`}>
                    {isCustom(p.id) ? 'Custom' : 'API'}
                  </span>
                </td>
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
                    onClick={() => dispatch(deleteProduct(p.id))}
                  >
                    Delete
                  </button>
                </td>
              </tr>
            ))}
            {deleted.map((p) => (
              <tr key={p.id} className="admin__row--deleted">
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
                <td className="caption">{p.category}</td>
                <td>{money(p.price)}</td>
                <td>{p.stock}</td>
                <td>
                  <span className="chip">Deleted</span>
                </td>
                <td className="admin__col-actions">
                  <button
                    type="button"
                    className="btn btn--secondary btn--sm"
                    onClick={() => dispatch(restoreProduct(p.id))}
                  >
                    Restore
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}
