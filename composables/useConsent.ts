export interface ConsentState {
  analytics: boolean
  ads: boolean
}

// v2. The old `uva-consent` cookie held a single 'granted' | 'denied' string
// covering analytics only, on the premise that the site would never run ads.
// That premise no longer holds, and a stored 'granted' must NOT be read as
// permission to run advertising storage - hence a new cookie name rather than
// a migration. Visitors holding the old cookie are asked once more.
const COOKIE = 'uva-consent-v2'

export function useConsent() {
  const consent = useCookie<ConsentState | null>(COOKIE, {
    maxAge: 60 * 60 * 24 * 365,
    sameSite: 'lax',
    default: () => null,
  })

  // `null` = undecided, banner shows.
  const decided = computed(() => consent.value !== null)
  const analyticsGranted = computed(() => consent.value?.analytics === true)
  const adsGranted = computed(() => consent.value?.ads === true)

  function push(state: ConsentState) {
    consent.value = state
    if (import.meta.client && typeof window.gtag === 'function') {
      window.gtag('consent', 'update', {
        analytics_storage: state.analytics ? 'granted' : 'denied',
        ad_storage:         state.ads ? 'granted' : 'denied',
        ad_user_data:       state.ads ? 'granted' : 'denied',
        ad_personalization: state.ads ? 'granted' : 'denied',
      })
    }
  }

  return {
    consent,
    decided,
    analyticsGranted,
    adsGranted,
    // Reject must be exactly as easy as accept - one click, same prominence.
    acceptAll:      () => push({ analytics: true,  ads: true }),
    necessaryOnly:  () => push({ analytics: false, ads: false }),
    // "Seaded": analytics on, advertising off. The middle option people
    // actually want, rather than a settings panel nobody opens.
    analyticsOnly:  () => push({ analytics: true,  ads: false }),
    set: push,
  }
}
