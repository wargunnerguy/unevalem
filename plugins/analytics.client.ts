// Google Analytics 4 with Consent Mode v2. Loads only when NUXT_PUBLIC_GA_ID is
// set. Opt-out model: analytics is granted by default (so GA works immediately
// and Realtime populates) and only disabled if the visitor explicitly opts out
// via the banner. Ad/advertising storage stays denied always — we never run
// ads. See composables/useConsent.ts and components/layout/CookieConsent.vue.
export default defineNuxtPlugin(() => {
  const gaId = useRuntimeConfig().public.gaId as string
  if (!gaId) return

  const { consent } = useConsent()

  window.dataLayer = window.dataLayer || []
  window.gtag = function gtag() {
    // eslint-disable-next-line prefer-rest-params — GA requires the arguments object
    window.dataLayer.push(arguments)
  }

  // Analytics granted unless the visitor explicitly opted out; ad storage never used.
  window.gtag('consent', 'default', {
    ad_storage: 'denied',
    ad_user_data: 'denied',
    ad_personalization: 'denied',
    analytics_storage: consent.value === 'denied' ? 'denied' : 'granted',
  })

  window.gtag('js', new Date())
  window.gtag('config', gaId, { anonymize_ip: true })

  const script = document.createElement('script')
  script.async = true
  script.src = `https://www.googletagmanager.com/gtag/js?id=${gaId}`
  document.head.appendChild(script)

  // GA4 auto-sends a page_view only for the first load; the site navigates
  // client-side, so emit one on each route change.
  useRouter().afterEach((to) => {
    window.gtag('event', 'page_view', { page_path: to.fullPath })
  })
})
