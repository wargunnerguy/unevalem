import type { UserProfile, CalculatorResult } from '~/types'

export function useAnalytics() {
  const { variant, sessionId } = useABTest()
  const config = useRuntimeConfig()

  // Persists across HMR cycles — prevents duplicate submissions if the component
  // remounts while step is already 11 (e.g. during active development)
  const submitted = useState('analytics-submitted', () => false)

  function resetSubmitted() {
    submitted.value = false
  }

  async function submitCalcResult(
    answers: Partial<UserProfile>,
    result: CalculatorResult,
  ) {
    if (submitted.value) return
    submitted.value = true

    const url = config.public.sheetsApiUrl as string
    if (!url || !import.meta.client) return

    const payload = {
      action:        'submit_calc',
      sessionId:     sessionId.value,
      variant:       variant.value,
      position:      answers.position      ?? '',
      bodyType:      answers.bodyType      ?? '',
      neckPain:      answers.neckPain      ?? '',
      sweating:      answers.sweating      ?? '',
      temp:          answers.temp          ?? '',
      blanketWeight: answers.blanketWeight ?? '',
      partner:       answers.partner       ?? '',
      allergies:     answers.allergies     ?? '',
      pillowAge:     answers.pillowAge     ?? '',
      complaint:     answers.complaint     ?? '',
      pillow:        result.recommendations.find(r => r.category === 'pillow')?.id  ?? '',
      blanket:       result.recommendations.find(r => r.category === 'blanket')?.id ?? '',
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
      await fetch(url, {
        method: 'POST',
        mode:   'no-cors',
        body:   JSON.stringify(payload),
      })
      if (import.meta.dev) console.log('[useAnalytics] POST sent ✓')
    } catch (err) {
      if (import.meta.dev) console.warn('[useAnalytics] POST failed:', err)
    }
  }

  return { submitCalcResult, resetSubmitted }
}
