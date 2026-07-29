// Captures campaign tags on arrival, whatever the landing route. Runs as a
// plugin rather than from a page so /probleem/*, /artiklid/* and the homepage
// are all covered without repeating the call.
//
// No consent gate: this writes a first-party cookie holding the campaign the
// visitor arrived from, which is the site's own record of its own traffic, not
// a third-party identifier. It sets nothing until an ad tag is actually present
// in the URL — a direct visitor gets no cookie at all.
export default defineNuxtPlugin(() => {
  const { capture } = useAttribution()

  capture()

  // Client-side navigation keeps the SPA alive across routes; a second campaign
  // link followed in-session still needs recording for last-touch.
  useRouter().afterEach((to) => {
    const qIndex = to.fullPath.indexOf('?')
    if (qIndex >= 0) capture(to.fullPath.slice(qIndex))
  })
})
