// What the Apps Script backend needs in order to re-send a conversion to GA4
// over the Measurement Protocol when the browser could not send it itself.
//
// Why this exists: tracker blockers do not fail loudly. uBlock Origin, AdGuard
// and Brave Shields do not block googletagmanager.com - they answer it with a
// neutered 200 stub that defines a no-op `gtag`. So `typeof window.gtag` stays
// "function", every client-side event silently evaporates, and nothing in the
// page can tell. 15-30% of visitors are affected, and that share is higher for
// paid traffic than for organic.
//
// `window.google_tag_manager` is the honest signal: only the real library ever
// defines it. A stub never does.

const GTAG_GRACE_MS = 3000

/**
 * Was the real GA library prevented from loading?
 *
 * The `performance.now()` guard matters: gtag.js is loaded async, so a page
 * that is only a second old may legitimately not have it yet. Claiming
 * "blocked" then would make the server re-send an event the browser is about
 * to send too, double-counting it. Before the grace period we say "not
 * blocked" and accept losing the rare conversion completed within 3 seconds -
 * an undercount is recoverable, a double count silently corrupts the funnel.
 */
export function isGaBlocked(): boolean {
  if (!import.meta.client) return false
  if (performance.now() < GTAG_GRACE_MS) return false
  return typeof window.google_tag_manager === 'undefined'
}

function readCookie(name: string): string {
  if (!import.meta.client) return ''
  const escaped = name.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')
  const match = document.cookie.match(new RegExp('(?:^|; )' + escaped + '=([^;]*)'))
  return match ? decodeURIComponent(match[1]) : ''
}

export interface GaTransport {
  /** True when the real gtag.js never ran - the server should re-send. */
  gaBlocked: boolean
  /** GA4 client id, so a server event joins the visitor's existing session. */
  gaClientId: string
  /** GA4 session id, same purpose. */
  gaSessionId: string
}

/**
 * Reads GA4's own identifiers out of its cookies so a server-sent event can be
 * attributed to the same user and session as the browser's events.
 *
 * When GA is blocked both come back empty - the cookies were never written.
 * That is expected: the server falls back to the `uva-sid` session cookie as
 * client_id, which recovers the conversion but cannot stitch it to a web
 * session. A counted conversion under a synthetic user beats a lost one.
 */
export function gaTransport(measurementId?: string): GaTransport {
  if (!import.meta.client) {
    return { gaBlocked: false, gaClientId: '', gaSessionId: '' }
  }

  // _ga = "GA1.1.<clientId>" where clientId is itself dotted ("12345.67890").
  const ga = readCookie('_ga')
  const gaClientId = ga ? ga.split('.').slice(2).join('.') : ''

  // _ga_<streamId> = "GS1.1.<sessionId>.<hitCount>..." - stream id is the
  // measurement id without its "G-" prefix.
  const streamId = (measurementId ?? '').replace(/^G-/, '')
  const streamCookie = streamId ? readCookie('_ga_' + streamId) : ''
  const gaSessionId = streamCookie ? (streamCookie.split('.')[2] ?? '') : ''

  return { gaBlocked: isGaBlocked(), gaClientId, gaSessionId }
}
