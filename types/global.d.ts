export {}

declare global {
  interface Window {
    dataLayer: unknown[]
    gtag: (...args: unknown[]) => void
    // Defined only by the real gtag.js. Tracker blockers answer that URL with a
    // no-op stub that leaves this undefined while `gtag` above still looks
    // callable — which makes it the only reliable "is GA actually alive?"
    // check. See utils/ga.ts.
    google_tag_manager?: Record<string, unknown>
    // Meta Pixel. Present only after advertising consent loads the script;
    // every call site must check before using it.
    fbq?: (...args: unknown[]) => void
  }
}
