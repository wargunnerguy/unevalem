import type { UserProfile, CalculatorResult, CalcType } from '~/types'

// GA4 custom event, no-op when gtag is absent (GA disabled or blocked).
// Consent Mode v2 handles the cookie side: when analytics_storage is denied
// the hit goes out cookieless, so no extra gating is needed here.
export function gaEvent(name: string, params: Record<string, string | number> = {}) {
  if (!import.meta.client || typeof window.gtag !== 'function') return
  window.gtag('event', name, params)
}

export function useAnalytics() {
  const { sessionId } = useABTest()
  const { attrPayload } = useAttribution()
  const config = useRuntimeConfig()

  // Which deployment a row came from, so staging test rows stay filterable in
  // the same sheet the production site writes to (they share one backend).
  const env = (config.public.siteUrl as string).includes('test.') ? 'staging' : 'prod'

  const submitted = useState('analytics-submitted', () => false)

  function resetSubmitted() {
    submitted.value = false
  }

  async function submitCalcResult(
    answers: Partial<UserProfile>,
    result: CalculatorResult,
    calcType: CalcType,
    prefilledFrom = '',
  ) {
    if (submitted.value) return
    submitted.value = true

    const url = config.public.sheetsApiUrl as string
    if (!url || !import.meta.client) return

    const payload = {
      action:        'submit_calc',
      calcType,
      sessionId:     sessionId.value,
      env,
      // Which pain page (if any) sent this visitor into the calculator with
      // answers pre-filled — lets prefilled sessions be excluded when reading
      // the raw answer distribution.
      prefilledFrom,
      position:        answers.position        ?? '',
      bodyType:        answers.bodyType        ?? '',
      neckPain:        answers.neckPain        ?? '',
      sweating:        answers.sweating        ?? '',
      temp:            answers.temp            ?? '',
      blanketWeight:   answers.blanketWeight   ?? '',
      partner:         answers.partner         ?? '',
      allergies:       answers.allergies       ?? '',
      pillowAge:       answers.pillowAge       ?? '',
      backPain:        answers.backPain        ?? '',
      mattressAge:     answers.mattressAge     ?? '',
      complaint:       answers.complaint       ?? '',
      age:             answers.age             ?? '',
      pillowCount:     answers.pillowCount     ?? '',
      sleepQuality:    answers.sleepQuality    ?? '',
      currentMattress: answers.currentMattress ?? '',
      roomTemp:        answers.roomTemp        ?? '',
      problemSeason:   answers.problemSeason   ?? '',
      rec0:          result.recommendations[0]?.id ?? '',
      currentScore:  result.currentScore,
      improvedScore: result.improvedScore,
      completedAt:   new Date().toISOString(),
      // Campaign attribution. The sheet — not the ad pixel — is the reliable
      // source here: with ad consent opt-in, a large share of EU visitors
      // decline and pixel coverage is permanently partial. Don't expect these
      // counts to reconcile with Meta's.
      ...attrPayload(),
    }

    if (import.meta.dev) {
      console.group('[useAnalytics] submitCalcResult')
      console.log('Payload:', payload)
      console.groupEnd()
    }

    try {
      await fetch(url, { method: 'POST', mode: 'no-cors', body: JSON.stringify(payload) })
      if (import.meta.dev) console.log('[useAnalytics] POST sent ✓')
    } catch (err) {
      if (import.meta.dev) console.warn('[useAnalytics] POST failed:', err)
    }
  }

  // Fire-and-forget post-view ping so the Apps Script can tally which articles
  // draw the most interest (used to rank posts on the homepage). Deduped per
  // browser session per slug so refreshes don't inflate the count. No cookies,
  // no PII — just an anonymous increment, same channel as submitCalcResult.
  function trackPostView(slug: string) {
    if (!import.meta.client || !slug) return
    const url = config.public.sheetsApiUrl as string
    if (!url) return

    const key = `uva-viewed-${slug}`
    try {
      if (sessionStorage.getItem(key)) return
      sessionStorage.setItem(key, '1')
    } catch {
      // sessionStorage unavailable (private mode edge cases) — still send once
    }

    // No attribution fields here on purpose: post_stats is an aggregate
    // slug→count tally with no per-visit row to hang them on, so they would be
    // sent and discarded. Campaign attribution for article reads comes from the
    // GA4 page_view instead.
    const payload = { action: 'post_view', slug, viewedAt: new Date().toISOString() }
    fetch(url, { method: 'POST', mode: 'no-cors', body: JSON.stringify(payload) })
      .catch(() => { /* fire-and-forget */ })
  }

  return { submitCalcResult, resetSubmitted, trackPostView }
}
