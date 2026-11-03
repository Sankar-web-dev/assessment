export const THEME_KEY = 'voltnex-theme'

export const getTheme = () => document.documentElement.dataset.theme || 'dark'

export const applyTheme = (theme) => {
  document.documentElement.dataset.theme = theme
  localStorage.setItem(THEME_KEY, theme)
}
