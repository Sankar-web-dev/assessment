import {
  createContext,
  useCallback,
  useContext,
  useRef,
  useState,
} from 'react'
import { Link } from 'react-router-dom'
import Icon from './Icon'

const ToastContext = createContext(() => {})

export const useToast = () => useContext(ToastContext)

export function ToastProvider({ children }) {
  const [toast, setToast] = useState(null)
  const timer = useRef(null)

  const showToast = useCallback((message, linkTo, linkLabel) => {
    clearTimeout(timer.current)
    setToast({ message, linkTo, linkLabel, key: Date.now() })
    timer.current = setTimeout(() => setToast(null), 3000)
  }, [])

  return (
    <ToastContext.Provider value={showToast}>
      {children}
      {toast && (
        <div className="toast" role="status" key={toast.key}>
          <Icon name="check" size={16} />
          <span>{toast.message}</span>
          {toast.linkTo && <Link to={toast.linkTo}>{toast.linkLabel}</Link>}
        </div>
      )}
    </ToastContext.Provider>
  )
}
