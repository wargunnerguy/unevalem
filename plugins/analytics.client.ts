// Google Analytics 4 with Consent Mode v2. Loads only when NUXT_PUBLIC_GA_ID
// is set.
//
// Analytics storage stays opt-out (granted until the visitor declines) so GA
// works on arrival. Advertising storage is opt-IN, denied by default: it cannot
// be defensibly pre-granted under EDPB/AKI guidance, and it is what Google Ads
// conversion import and remarketing depend on. See composables/useConsent.ts.
export default defineNuxtPlugin(() => {
  const gaId = useRuntimeConfig().public.gaId as string
  if (!gaId) return

  const { consent } = useConsent()
  const decided = consent.value

  window.dataLayer = window.dataLayer || []
  window.gtag = function gtag() {
    // eslint-disable-next-line prefer-rest-params — GA requires the arguments object
    window.dataLayer.push(arguments)
  }

  window.gtag('consent', 'default', {
    // Undecided → analytics granted (cookieless until the visitor chooses),
    // advertising denied. An explicit choice overrides both.
    analytics_storage: decided ? (decided.analytics ? 'granted' : 'denied') : 'granted',
    ad_storage:         decided?.ads ? 'granted' : 'denied',
    ad_user_data:       decided?.ads ? 'granted' : 'denied',
    ad_personalization: decided?.ads ? 'granted' : 'denied',
  })

  // With ad_storage denied, these keep conversion measurement working without
  // cookies: gclid is carried in the URL rather than a cookie, and requests are
  // stripped of identifiers.
  window.gtag('set', 'url_passthrough', true)
  window.gtag('set', 'ads_data_redaction', true)

  // send_page_view off: the router hook below fires on the initial route too,
  // so letting config also send one would double-count every landing.
  window.gtag('js', new Date())
  window.gtag('config', gaId, { anonymize_ip: true, send_page_view: false })

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
