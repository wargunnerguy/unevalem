export type CalcVariant = 'pillow' | 'blanket' | 'sleep'

const ALL_VARIANTS: CalcVariant[] = ['pillow', 'blanket', 'sleep']

function makeId(): string {
  return Array.from({ length: 12 }, () =>
    Math.floor(Math.random() * 36).toString(36),
  ).join('')
}

export function useABTest() {
  // Anonymous session ID — random, no PII, persists 30 days
  const sessionId = useCookie<string>('uva-sid', {
    default: makeId,
    maxAge: 60 * 60 * 24 * 30,
    sameSite: 'lax',
  })

  // Variant assigned once based on session ID hash, stable for 30 days
  const variant = useCookie<CalcVariant>('uva-variant', {
    default: () => {
      const hash = sessionId.value
        .split('')
        .reduce((acc, c) => acc + c.charCodeAt(0), 0)
      return ALL_VARIANTS[hash % ALL_VARIANTS.length]
    },
    maxAge: 60 * 60 * 24 * 30,
    sameSite: 'lax',
  })

  return { variant, sessionId }
}
