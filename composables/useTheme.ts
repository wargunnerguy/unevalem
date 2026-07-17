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

  let transitionTimer: ReturnType<typeof setTimeout> | null = null

  function setTheme(dark: boolean) {
    if (!import.meta.client) return
    const root = document.documentElement
    // Ease every themed color for the duration of the switch (CSS in
    // main.css scoped to html.theme-transition), then drop the class so
    // normal interactions stay snappy.
    root.classList.add('theme-transition')
    if (transitionTimer) clearTimeout(transitionTimer)
    transitionTimer = setTimeout(() => root.classList.remove('theme-transition'), 500)

    isDark.value = dark
    root.classList.toggle('dark', dark)
    localStorage.setItem('unevalem-theme', dark ? 'dark' : 'light')
  }

  function toggleTheme() {
    setTheme(!isDark.value)
  }

  return { isDark, initTheme, setTheme, toggleTheme }
}
