import type { Attribution } from '~/types'

// Query keys we capture. utm_* are the campaign tags; the *clid values are the
// per-click ids each ad platform appends, and are what makes a sheet row
// reconcilable with a platform report.
const UTM_KEYS = ['utm_source', 'utm_medium', 'utm_campaign', 'utm_content', 'utm_term'] as const
const CLICK_ID_KEYS = ['fbclid', 'gclid', 'ttclid', 'msclkid'] as const

const COOKIE_NAME = 'uva-attr'
const SESSION_KEY = 'uva-attr-last'

// Sheet cells choke on very long values and a click id is never legitimately
// this long - cap rather than truncate silently at the backend.
const MAX_VALUE_LEN = 200

function readParams(search: string): Attribution {
  const params = new URLSearchParams(search)
  const out: Attribution = {}
  for (const key of [...UTM_KEYS, ...CLICK_ID_KEYS]) {
    const value = params.get(key)?.trim()
    if (value) out[key] = value.slice(0, MAX_VALUE_LEN)
  }
  return out
}

// Direct/organic arrivals carry no tags at all. Distinguishing "no tags" from
// "tags present" is what keeps first-touch meaningful: a visitor who lands from
// an ad and later returns directly must keep the ad as their first touch.
function hasAny(attr: Attribution): boolean {
  return Object.keys(attr).length > 0
}

export function useAttribution() {
  // 90 days: longer than a typical consideration window for a €20-60 purchase,
  // short enough that a stale campaign doesn't get credit a season later.
  const firstTouch = useCookie<Attribution | null>(COOKIE_NAME, {
    maxAge: 60 * 60 * 24 * 90,
    sameSite: 'lax',
    default: () => null,
  })

  // Records the landing tags. First-touch is written once and never overwritten;
  // last-touch lives in sessionStorage so a second campaign click in the same
  // visit is still visible without destroying the original attribution.
  function capture(search?: string): void {
    if (!import.meta.client) return
    // window.location, not route.query: on the prerendered static build the
    // route query can still be empty at mount. Same trap documented in
    // pages/aitah/index.vue.
    const attr = readParams(search ?? window.location.search)
    if (!hasAny(attr)) return

    if (!firstTouch.value || !hasAny(firstTouch.value)) {
      firstTouch.value = { ...attr, landedAt: new Date().toISOString() }
    }

    try {
      sessionStorage.setItem(SESSION_KEY, JSON.stringify(attr))
    } catch {
      // sessionStorage unavailable (private mode) - first-touch cookie still set
    }
  }

  function lastTouch(): Attribution {
    if (!import.meta.client) return {}
    try {
      const raw = sessionStorage.getItem(SESSION_KEY)
      return raw ? (JSON.parse(raw) as Attribution) : {}
    } catch {
      return {}
    }
  }

  // Flattened for the sheet POSTs: one column per key, `last_utm_source` only
  // when it differs from first touch, so the common case stays narrow.
  function attrPayload(): Record<string, string> {
    const first = firstTouch.value ?? {}
    const last = lastTouch()
    const payload: Record<string, string> = {}

    for (const key of [...UTM_KEYS, ...CLICK_ID_KEYS]) {
      if (first[key]) payload[key] = String(first[key])
    }
    if (first.landedAt) payload.firstTouchAt = String(first.landedAt)

    for (const key of UTM_KEYS) {
      if (last[key] && last[key] !== first[key]) payload[`last_${key}`] = String(last[key])
    }

    return payload
  }

  return { firstTouch, capture, lastTouch, attrPayload }
}
