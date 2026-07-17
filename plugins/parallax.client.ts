// Drives the 3-layer sleep-pattern parallax (assets/css/main.css): each layer
// is viewport-fixed and gets pushed up by a different fraction of the scroll,
// so the icons move slower than the content at three depths.
export default defineNuxtPlugin(() => {
  // Respect users who asked for less motion — layers stay simply fixed.
  if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return

  const root = document.documentElement
  let ticking = false

  function update() {
    ticking = false
    const y = window.scrollY
    root.style.setProperty('--sleep-y1', `${-y * 0.10}px`) // far icons, slowest
    root.style.setProperty('--sleep-y2', `${-y * 0.25}px`) // mid icons
    root.style.setProperty('--sleep-y4', `${-y * 0.32}px`) // fog drift
    root.style.setProperty('--sleep-y3', `${-y * 0.45}px`) // near icons, fastest
  }

  window.addEventListener('scroll', () => {
    if (!ticking) {
      ticking = true
      requestAnimationFrame(update)
    }
  }, { passive: true })

  update()
})
