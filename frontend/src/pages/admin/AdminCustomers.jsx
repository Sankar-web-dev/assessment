import { useEffect, useState } from 'react'
import { useSelector } from 'react-redux'
import { api } from '../../api/client'

// Admin: list every registered customer (GET /api/v1/users, admin only).
export default function AdminCustomers() {
  const token = useSelector((s) => s.auth.token)
  const [users, setUsers] = useState([])
  const [status, setStatus] = useState('loading') // loading | succeeded | failed
  const [error, setError] = useState('')

  useEffect(() => {
    api('/users', { token })
      .then((data) => {
        setUsers(data.filter((u) => u.role !== 'admin'))
        setStatus('succeeded')
      })
      .catch(() => setStatus('failed'))
  }, [token])

  // PATCH /users/:id/status — flips isActive; deactivated users can't sign in.
  const toggle = async (u, isActive) => {
    setError('')
    try {
      await api(`/users/${u._id}/status`, {
        method: 'PATCH',
        body: { isActive },
        token,
      })
      setUsers((list) =>
        list.map((x) => (x._id === u._id ? { ...x, isActive } : x)),
      )
    } catch (err) {
      setError(err.message)
    }
  }

  return (
    <div className="admin__panel">
      <div className="admin__panel-head">
        <div>
          <h2 className="admin__panel-title">Customers</h2>
          <p className="muted">{users.length} registered customers</p>
        </div>
      </div>

      {error && <p className="field-error">{error}</p>}

      <div className="admin__table-wrap">
        <table className="admin__table">
          <thead>
            <tr>
              <th>Name</th>
              <th>Email</th>
              <th>Role</th>
              <th>Status</th>
              <th>Joined</th>
            </tr>
          </thead>
          <tbody>
            {users.map((u) => (
              <tr key={u._id}>
                <td>{u.name}</td>
                <td>{u.email}</td>
                <td>
                  <span
                    className={`chip${u.role === 'admin' ? ' chip--active' : ''}`}
                  >
                    {u.role}
                  </span>
                </td>
                <td>
                  <label className="admin__switch">
                    <input
                      type="checkbox"
                      checked={u.isActive}
                      onChange={(e) => toggle(u, e.target.checked)}
                    />
                    <span
                      className={
                        u.isActive ? 'admin__status--on' : 'admin__status--off'
                      }
                    >
                      {u.isActive ? 'Active' : 'Disabled'}
                    </span>
                  </label>
                </td>
                <td>
                  {u.createdAt
                    ? new Date(u.createdAt).toLocaleDateString()
                    : '—'}
                </td>
              </tr>
            ))}
            {status === 'loading' && (
              <tr>
                <td colSpan={5} className="muted" style={{ textAlign: 'center' }}>
                  Loading customers…
                </td>
              </tr>
            )}
            {status === 'succeeded' && users.length === 0 && (
              <tr>
                <td colSpan={5} className="muted" style={{ textAlign: 'center' }}>
                  No customers yet.
                </td>
              </tr>
            )}
            {status === 'failed' && (
              <tr>
                <td colSpan={5} className="muted" style={{ textAlign: 'center' }}>
                  Could not load customers — try signing in again.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  )
}
