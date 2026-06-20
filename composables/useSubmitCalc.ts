import type { UserProfile, CalcType } from '~/types'

export function useSubmitCalc() {
  const config = useRuntimeConfig()

  function submit(calcType: CalcType, answers: Partial<UserProfile>, topProduct: string) {
    const url = config.public.sheetsApiUrl
    if (!url) return

    const sheet = `${calcType}_responses`
    const payload = {
      sheet,
      data: {
        timestamp:     new Date().toISOString(),
        calcType,
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
        backPain:      answers.backPain      ?? '',
        mattressAge:   answers.mattressAge   ?? '',
        topProduct,
      },
    }

    // no-cors: Apps Script redirects prevent reading the response body, but the
    // POST still lands. Perfect for fire-and-forget submission logging.
    fetch(url, {
      method:  'POST',
      mode:    'no-cors',
      headers: { 'Content-Type': 'text/plain' },
      body:    JSON.stringify(payload),
    }).catch(() => {})
  }

  return { submit }
}
