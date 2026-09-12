import type { ConsentState } from '~/composables/useConsent'

// Meta Pixel, loaded ONLY after explicit advertising consent. There is no
// server, so no Conversions API - browser-only coverage is accepted, and the
// Google Sheet remains the more complete attribution record.
//
// Optimise toward Lead, not Purchase, for the first campaign cycle: with
// nothing purchasable there are no purchase events, and Meta's optimiser would
// never exit the learning phase.
const GA_TO_META: Record<string, string> = {
  lead: 'Lead',
  quiz_completed: 'CompleteRegistration',
  calc_result_shown: 'ViewContent',
}

function loadPixel(pixelId: string) {
  if (window.fbq) return
  /* eslint-disable */
  const fbq: any = function (...args: unknown[]) {
    ;(fbq as any).callMethod ? (fbq as any).callMethod.apply(fbq, args) : (fbq as any).queue.push(args)
  }
  fbq.queue = []
  fbq.loaded = true
  fbq.version = '2.0'
  window.fbq = fbq
  /* eslint-enable */

  const script = document.createElement('script')
  script.async = true
  script.src = 'https://connect.facebook.net/en_US/fbevents.js'
  document.head.appendChild(script)

  window.fbq('init', pixelId)
  window.fbq('track', 'PageView')
}

export default defineNuxtPlugin(() => {
  const pixelId = useRuntimeConfig().public.metaPixelId as string
  if (!pixelId) return

  const { consent, adsGranted } = useConsent()

  function start() {
    loadPixel(pixelId)

    useRouter().afterEach(() => {
      if (window.fbq) window.fbq('track', 'PageView')
    })

    // Mirror the GA events we already fire, rather than instrumenting twice.
    window.addEventListener('unevalem:ga-event', ((e: CustomEvent<{ name: string }>) => {
      const metaEvent = GA_TO_META[e.detail?.name]
      if (metaEvent && window.fbq) window.fbq('track', metaEvent)
    }) as EventListener)
  }

  if (adsGranted.value) {
    start()
    return
  }

  // Not granted yet: wait for the banner choice rather than loading and hoping.
  const stop = watch(consent, (value: ConsentState | null) => {
    if (value?.ads) {
      start()
      stop()
    }
  })
})
