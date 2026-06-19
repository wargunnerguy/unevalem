export function useTheme() {
  const isDark = useState<boolean>('theme-dark', () => false)

  function initTheme() {
    if (!import.meta.client) return
    const stored = localStorage.getItem('unevalem-theme')
    const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches
    const dark = stored !== null ? stored === 'dark' : prefersDark
    isDark.value = dark
    document.documentElement.classList.toggle('dark', dark)
  }

  function toggleTheme() {
    if (!import.meta.client) return
    isDark.value = !isDark.value
    document.documentElement.classList.toggle('dark', isDark.value)
    localStorage.setItem('unevalem-theme', isDark.value ? 'dark' : 'light')
  }

  return { isDark, initTheme, toggleTheme }
}
