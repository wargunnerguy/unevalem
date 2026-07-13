import type { UserProfile, CalculatorResult, CalcType } from '~/types'

export function useAnalytics() {
  const { variant, sessionId } = useABTest()
  const config = useRuntimeConfig()

  const submitted = useState('analytics-submitted', () => false)

  function resetSubmitted() {
    submitted.value = false
  }

  async function submitCalcResult(
    answers: Partial<UserProfile>,
    result: CalculatorResult,
    calcType: CalcType,
  ) {
    if (submitted.value) return
    submitted.value = true

    const url = config.public.sheetsApiUrl as string
    if (!url || !import.meta.client) return

    const payload = {
      action:        'submit_calc',
      calcType,
      sessionId:     sessionId.value,
      variant:       variant.value,
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

    const payload = { action: 'post_view', slug, viewedAt: new Date().toISOString() }
    fetch(url, { method: 'POST', mode: 'no-cors', body: JSON.stringify(payload) })
      .catch(() => { /* fire-and-forget */ })
  }

  return { submitCalcResult, resetSubmitted, trackPostView }
}
