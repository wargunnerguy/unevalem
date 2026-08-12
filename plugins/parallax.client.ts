// Drives the 5-layer sleep-pattern texture (assets/css/main.css). Three motions
// are summed per layer so the background reads as alive rather than pasted on:
//
//   • parallax — each layer is pushed up by a different fraction of the scroll,
//     so the icons pass the content at five depths (this was the original job);
//   • wander   — a slow two-sine drift on both axes. No two layers share a
//     period and none of the periods are harmonics, so they never re-sync into
//     a visible beat; the second, faster sine is what turns a smooth glide into
//     a slight wiggle;
//   • sway     — a sideways lean proportional to scroll speed that eases back to
//     rest a moment after scrolling stops, like air dragging on the layers.
//
// Amplitude scales with nearness: far icons barely stir, the front fog bank
// moves most. Everything stays perfectly still under prefers-reduced-motion.

interface Layer {
  /** --sleep-x<key> / --sleep-y<key> in main.css */
  key: string
  /** fraction of scroll distance this layer is displaced by */
  parallax: number
  /** resting x offset — must match the fallback in main.css */
  baseX: number
  ampX: number
  ampY: number
  /** seconds for one wander cycle */
  periodX: number
  periodY: number
  phase: number
  /** how strongly this layer answers scroll speed */
  sway: number
}

const LAYERS: Layer[] = [
  { key: '1', parallax: 0.10, baseX: 50,  ampX: 5,  ampY: 3, periodX: 71, periodY: 53, phase: 0,   sway: 0.25 }, // far icons
  { key: '5', parallax: 0.18, baseX: 260, ampX: 13, ampY: 5, periodX: 97, periodY: 61, phase: 1.1, sway: 0.45 }, // deep fog
  { key: '2', parallax: 0.25, baseX: 120, ampX: 8,  ampY: 5, periodX: 59, periodY: 43, phase: 2.3, sway: 0.6 },  // mid icons
  { key: '4', parallax: 0.38, baseX: 140, ampX: 19, ampY: 7, periodX: 83, periodY: 47, phase: 3.7, sway: 1 },    // front fog
  { key: '3', parallax: 0.45, baseX: 0,   ampX: 11, ampY: 7, periodX: 41, periodY: 37, phase: 5,   sway: 1 },    // near icons
]

const TAU = Math.PI * 2

/** Big slow sine + a smaller 3.7×-faster one — glide with a wiggle on top. */
function wander(t: number, amp: number, period: number, phase: number) {
  return (
    Math.sin((TAU * t) / period + phase) * amp +
    Math.sin((TAU * t * 3.7) / period + phase * 2.3) * amp * 0.28
  )
}

export default defineNuxtPlugin(() => {
  // Respect users who asked for less motion — layers stay simply fixed.
  if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return

  const root = document.documentElement

  // Quantising the writes is what makes a permanent rAF loop cheap: these are
  // five large, blurred, fixed-attachment bitmaps, so every changed value costs
  // a repaint. The wander moves ~1–3 px/s, so rounding to half a pixel (a whole
  // one on phones, where the paint is comparatively dearer) drops the repaints
  // to a handful a second and stops them entirely at the turn of each sine —
  // all of it invisible at this speed.
  const step = window.matchMedia('(pointer: coarse)').matches ? 1 : 0.5
  const written = new Map<string, number>()

  function write(prop: string, value: number) {
    const q = Math.round(value / step) * step
    if (written.get(prop) === q) return
    written.set(prop, q)
    root.style.setProperty(prop, `${q}px`)
  }

  const start = performance.now()
  let lastScroll = window.scrollY
  let velocity = 0
  let sway = 0

  function frame(now: number) {
    const t = (now - start) / 1000
    const y = window.scrollY

    // Both the reading and the lean are smoothed, so the layers drift back to
    // rest over ~half a second instead of snapping when the scroll stops.
    velocity = velocity * 0.8 + (y - lastScroll) * 0.2
    lastScroll = y
    const target = Math.max(-14, Math.min(14, velocity * 0.6))
    sway += (target - sway) * 0.08

    for (const l of LAYERS) {
      write(`--sleep-x${l.key}`, l.baseX + wander(t, l.ampX, l.periodX, l.phase) + sway * l.sway)
      write(`--sleep-y${l.key}`, -y * l.parallax + wander(t, l.ampY, l.periodY, l.phase + 1.7))
    }

    requestAnimationFrame(frame)
  }

  // rAF is throttled to a stop on hidden tabs by the browser, so no extra
  // visibility handling is needed here.
  requestAnimationFrame(frame)
})
