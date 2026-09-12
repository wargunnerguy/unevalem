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
    // eslint-disable-next-line prefer-rest-params - GA requires the arguments object
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

  // Opt-in debug: load any page with ?ga_debug=1 to have the session appear in
  // GA4 → Admin → DebugView. Far more reliable for "is the tag alive?" than
  // Realtime, which only shows the last 30 minutes and needs live traffic.
  const debugMode = new URLSearchParams(window.location.search).has('ga_debug')

  // send_page_view stays ON - do not disable it again.
  //
  // It used to be off, on the assumption that the router hook below also covers
  // the initial route. It does not, reliably: afterEach is registered while
  // plugins run, but Nuxt performs its own initial navigation inside the
  // `app:created` hook, so whether the hook ever observes that first navigation
  // depends on framework init order rather than on anything here. When it does
  // not, the landing page_view is never emitted and gtag sends no request at
  // all - a visitor who lands and leaves without navigating is invisible, and
  // GA looks completely dead. That was live on unevalem.ee.
  //
  // The title race that motivated the manual hook does not apply to the first
  // load: the prerendered HTML already carries the correct <title> before gtag
  // reads it. That bug only ever affected client-side navigation.
  //
  // (No anonymize_ip - that is a Universal Analytics parameter; GA4 ignores it
  // and always anonymises.)
  window.gtag('js', new Date())
  window.gtag('config', gaId, debugMode ? { debug_mode: true } : {})

  const script = document.createElement('script')
  script.async = true
  script.src = `https://www.googletagmanager.com/gtag/js?id=${gaId}`
  document.head.appendChild(script)

  // Resolves once the new page's <title> has actually been written to the DOM.
  //
  // ⚠️ This matters more than it looks. router.afterEach fires BEFORE Vue
  // renders the incoming page, and useHead applies the title later still, on
  // its own DOM flush after paint. gtag auto-collects page_title from
  // document.title at send time - so sending immediately (or even after one
  // nextTick, which is too early; measured) filed every internal navigation
  // under the PREVIOUS page's title. GA4's "Pages and screens" report keys on
  // title by default, which made all in-site navigation look like the homepage.
  //
  // nextTick covers the render queue; the two rAFs carry us past the paint the
  // head flush rides on. Falls back to sending anyway if the title never
  // changes - some pages legitimately share a title.
  function afterTitleSettles(previousTitle: string): Promise<void> {
    return nextTick().then(
      () =>
        new Promise((resolve) => {
          let frames = 0
          const tick = () => {
            if (document.title !== previousTitle || frames++ >= 3) return resolve()
            requestAnimationFrame(tick)
          }
          requestAnimationFrame(tick)
        }),
    )
  }

  // GA4 auto-sends a page_view only for the first load; the site navigates
  // client-side, so emit one on each route change.
  //
  // gtag has already sent the landing page_view itself. If afterEach *does* also
  // fire for Nuxt's initial navigation we would double-count it - so the very
  // first hook call is dropped, and only when it is still on the landing URL.
  // Both conditions matter: dropping unconditionally would lose a real pageview
  // in the case where the hook never sees the initial navigation at all.
  const landingLocation = window.location.href
  let firstHookCall = true

  useRouter().afterEach(async () => {
    const isFirstHookCall = firstHookCall
    firstHookCall = false

    const titleBefore = document.title
    await afterTitleSettles(titleBefore)

    if (isFirstHookCall && window.location.href === landingLocation) return

    // GA4 parameters, not the Universal Analytics `page_path`: GA4 ignores that
    // one and derives the page from page_location.
    window.gtag('event', 'page_view', {
      page_location: window.location.href,
      page_title: document.title,
    })
  })
})
