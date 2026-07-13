export type ConsentChoice = 'granted' | 'denied'

// Analytics cookie-consent state. `null` = undecided (banner shows). The choice
// is mirrored to Google Consent Mode so GA only sets cookies once granted.
export function useConsent() {
  const consent = useCookie<ConsentChoice | null>('uva-consent', {
    maxAge: 60 * 60 * 24 * 365,
    sameSite: 'lax',
    default: () => null,
  })

  function set(choice: ConsentChoice) {
    consent.value = choice
    if (import.meta.client && typeof window.gtag === 'function') {
      window.gtag('consent', 'update', { analytics_storage: choice })
    }
  }

  return {
    consent,
    grant: () => set('granted'),
    deny: () => set('denied'),
  }
}
