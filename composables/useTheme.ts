export function useTheme() {
  const isDark = useState<boolean>('theme-dark', () => false)

  function shouldAutoDark(): boolean {
    const hour = new Date().getHours()
    return hour >= 21 || hour < 7
  }

  function initTheme() {
    if (!import.meta.client) return
    const stored = localStorage.getItem('unevalem-theme')
    // Manual preference wins; if none stored, use time-based default (dark 21:00–06:59)
    const dark = stored !== null ? stored === 'dark' : shouldAutoDark()
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
