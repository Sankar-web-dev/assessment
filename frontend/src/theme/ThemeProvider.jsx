import { createContext, useContext, useState } from 'react'
import { getTheme, applyTheme } from '../theme'

const ThemeContext = createContext({
  theme: 'dark',
  setTheme: () => {},
  toggleTheme: () => {},
})

export function ThemeProvider({ children }) {
  const [theme, setThemeState] = useState(getTheme)

  const setTheme = (next) => {
    applyTheme(next) // syncs <html data-theme> + localStorage
    setThemeState(next)
  }
  const toggleTheme = () => setTheme(theme === 'dark' ? 'light' : 'dark')

  return (
    <ThemeContext.Provider value={{ theme, setTheme, toggleTheme }}>
      {children}
    </ThemeContext.Provider>
  )
}

export const useTheme = () => useContext(ThemeContext)
