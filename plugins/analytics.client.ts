// Google Analytics 4 with Consent Mode v2. Loads only when NUXT_PUBLIC_GA_ID is
// set. Everything is denied by default — GA runs cookieless (modeled pings) and
// sets no cookies until the visitor accepts via the consent banner. See
// composables/useConsent.ts and components/layout/CookieConsent.vue.
export default defineNuxtPlugin(() => {
  const gaId = useRuntimeConfig().public.gaId as string
  if (!gaId) return

  const { consent } = useConsent()

  window.dataLayer = window.dataLayer || []
  window.gtag = function gtag() {
    // eslint-disable-next-line prefer-rest-params — GA requires the arguments object
    window.dataLayer.push(arguments)
  }

  // Deny all storage by default; a prior "granted" choice re-enables analytics.
  window.gtag('consent', 'default', {
    ad_storage: 'denied',
    ad_user_data: 'denied',
    ad_personalization: 'denied',
    analytics_storage: 'denied',
  })
  if (consent.value === 'granted') {
    window.gtag('consent', 'update', { analytics_storage: 'granted' })
  }

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
