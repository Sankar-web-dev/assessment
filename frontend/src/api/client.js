// Note: avoid ports 6000–6063 — Chrome blocks them as "unsafe ports"
// (ERR_UNSAFE_PORT) even though the server works fine.
const BASE_URL =
  import.meta.env.VITE_API_URL || 'http://localhost:4000/api/v1'

// Thin fetch wrapper for the Kadai backend (doodlebackend, /api/v1).
export async function api(path, { method = 'GET', body, token } = {}) {
  let data = {}
  try {
    const res = await fetch(`${BASE_URL}${path}`, {
      method,
      headers: {
        'Content-Type': 'application/json',
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
      },
      body: body !== undefined ? JSON.stringify(body) : undefined,
    })
    data = await res.json().catch(() => ({}))
    if (!res.ok) {
      throw new Error(data.message || `Request failed (${res.status})`)
    }
    return data
  } catch (err) {
    // Network failure (backend down / wrong port)
    if (err instanceof TypeError) {
      throw new Error(
        'Cannot reach the Kadai API — is the backend running on ' + BASE_URL + '?',
      )
    }
    throw err
  }
}
