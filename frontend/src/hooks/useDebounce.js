import { useEffect, useState } from 'react'

// Returns the value after it has stayed unchanged for `delay` ms.
// Used so filtering waits until the user stops typing.
export default function useDebounce(value, delay = 300) {
  const [debounced, setDebounced] = useState(value)

  useEffect(() => {
    const t = setTimeout(() => setDebounced(value), delay)
    return () => clearTimeout(t)
  }, [value, delay])

  return debounced
}
