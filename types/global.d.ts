export {}

declare global {
  interface Window {
    dataLayer: unknown[]
    gtag: (...args: unknown[]) => void
    // Meta Pixel. Present only after advertising consent loads the script;
    // every call site must check before using it.
    fbq?: (...args: unknown[]) => void
  }
}
