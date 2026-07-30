// Is this build the real unevalem.ee, or a review build?
//
// Every environment POSTs to the same Apps Script backend and the same sheet,
// so each row carries an `env` marker to keep review data out of the real
// numbers. This is an allowlist on purpose: the previous check looked for
// 'test.' in the site URL, which meant a localhost review build was filed as
// production. Anything that is not the production host is a review build.
export function isProdSite(siteUrl?: string): boolean {
  if (!siteUrl) return false
  try {
    const host = new URL(siteUrl).hostname
    return host === 'unevalem.ee' || host === 'www.unevalem.ee'
  } catch {
    return false
  }
}
