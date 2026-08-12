import type { UserProfile, CalculatorResult, CalcType } from '~/types'
import { isProdSite } from '~/utils/site'
import { gaTransport } from '~/utils/ga'
/**
 * The answer fields a given calculator actually asks about, keyed by name so
 * the Apps Script's header mapping puts each in its own column.
 *
 * The caller supplies `stepKeys` because the questions now come from the sheet
 * (useCalculators). Adding or removing a question in the sheet therefore also
 * adds or removes its response column, with no code change here — and removes
 * the risk of this list drifting from the one the UI rendered.
 */
function answersForCalc(answers: Partial<UserProfile>, stepKeys: readonly string[]): Record<string, string> {
  const source = answers as Record<string, string | undefined>
  return Object.fromEntries(stepKeys.map(key => [key, source[key] ?? '']))
}

// GA4 custom event, no-op when gtag is absent (GA disabled or blocked).
// Consent Mode v2 handles the cookie side: when analytics_storage is denied
// the hit goes out cookieless, so no extra gating is needed here.
export function gaEvent(name: string, params: Record<string, string | number> = {}) {
  if (!import.meta.client) return
  if (typeof window.gtag === 'function') window.gtag('event', name, params)
  // Broadcast so the Meta pixel can mirror the events we already fire without
  // every call site having to know whether a pixel exists. The listener is only
  // attached after advertising consent, so this is a no-op otherwise.
  window.dispatchEvent(new CustomEvent('unevalem:ga-event', { detail: { name, params } }))
}

export function useAnalytics() {
  const { sessionId } = useABTest()
  const { attrPayload } = useAttribution()
  const { analyticsGranted, adsGranted } = useConsent()
  const config = useRuntimeConfig()

  // Which deployment a row came from, so test rows stay filterable in the same
  // sheet the production site writes to (every environment shares one backend).
  // Allowlist, not a 'test.' denylist: staging is retired and review now happens
  // on localhost, which the old check silently filed as production.
  const env = isProdSite(config.public.siteUrl as string) ? 'prod' : 'test'

  const submitted = useState('analytics-submitted', () => false)

  function resetSubmitted() {
    submitted.value = false
  }

  async function submitCalcResult(
    answers: Partial<UserProfile>,
    result: CalculatorResult,
    calcType: CalcType,
    stepKeys: readonly string[],
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
      // Only the answers THIS calculator asks for. Sending all eighteen every
      // time gave each *_responses tab ten permanently empty columns —
      // handleCalcSubmit creates a column for any key it sees, so an always-''
      // field is an always-blank column. Deleting them in the sheet without
      // this change would only bring them back on the next submission.
      ...answersForCalc(answers, stepKeys),
      rec0:          result.recommendations[0]?.id ?? '',
      currentScore:  result.currentScore,
      improvedScore: result.improvedScore,
      completedAt:   new Date().toISOString(),
      // Campaign attribution. The sheet — not the ad pixel — is the reliable
      // source here: with ad consent opt-in, a large share of EU visitors
      // decline and pixel coverage is permanently partial. Don't expect these
      // counts to reconcile with Meta's.
      ...attrPayload(),
      // Lets the Apps Script re-send this conversion to GA4 over the
      // Measurement Protocol when a tracker blocker stopped the browser from
      // reporting it. It only does so when gaBlocked is true, so a visitor
      // whose gtag.js loaded normally is never counted twice.
      ...gaTransport(config.public.gaId as string),
      analyticsConsent: analyticsGranted.value,
      adsConsent:       adsGranted.value,
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
