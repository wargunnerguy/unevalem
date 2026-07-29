// Anonymous session id, nothing more. The variant-assignment half of this
// composable was removed: the variant was written into every analytics row but
// rendered nowhere (pages/index.vue computed a label it never used), and at this
// site's completion volume no split test could reach significance. The sheet
// column it occupied is better spent on utm_campaign. Reintroduce a real split
// test only alongside the traffic to power one.
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

  return { sessionId }
}
