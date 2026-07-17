export function useTheme() {
  // Dark is the site default; a stored manual choice is the only thing that
  // overrides it. (Was time-based auto-dark — replaced 2026-07-17.)
  const isDark = useState<boolean>('theme-dark', () => true)

  function initTheme() {
    if (!import.meta.client) return
    const stored = localStorage.getItem('unevalem-theme')
    const dark = stored !== null ? stored === 'dark' : true
    isDark.value = dark
    document.documentElement.classList.toggle('dark', dark)
  }

  function setTheme(dark: boolean) {
    if (!import.meta.client) return
    isDark.value = dark
    document.documentElement.classList.toggle('dark', dark)
    localStorage.setItem('unevalem-theme', dark ? 'dark' : 'light')
  }

  function toggleTheme() {
    setTheme(!isDark.value)
  }

  return { isDark, initTheme, setTheme, toggleTheme }
}
