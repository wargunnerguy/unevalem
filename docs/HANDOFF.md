# Session handoff - `feat/funnel-readiness`

Written for whoever picks this up next, human or agent. Read `CLAUDE.md` first; this file only
covers what changed on this branch and what a fresh session would otherwise have to rediscover.

Delete this file once you're caught up - it documents a moment, not the architecture.

---

## State

- **Branch:** `feat/funnel-readiness`, 7 commits, based on `ef83d46` (which was `origin/dev` HEAD).
- **Target:** PR into **`dev`**, never `main`. Per CLAUDE.md, `dev` auto-deploys to
  test.unevalem.ee; `main` is production (unevalem.ee).
- **Delivered as a git bundle**, not pushed: the cloud session that produced it had no git remote
  and its scoped `GITHUB_TOKEN` returned 403 for this repo ("GitHub access to this repository is
  not enabled for this session"). Nothing is wrong with the repo. If you start future cloud
  sessions with the environment *connected to* `wargunnerguy/unevalem`, pushing works normally.
- **Nothing here has been deployed or verified on staging yet.** All verification was against a
  local `nuxt generate` build served over HTTP, driven with Playwright.

### Why this branch exists

The owner is about to spend money on Meta ads, Google Search and organic social. The site could
not catch that traffic: no `utm_` handling anywhere, no email capture, ad traffic landing on a
generic "Leia endale parim padi" homepage, `ad_storage` hard-denied so Google Ads conversion
import silently could not work - and a social-proof toast inventing purchases that never happened.

### The 7 commits

| # | Commit | Substance |
|---|---|---|
| 1 | `8478fd9` honesty pass, staging isolation, UTM attribution | Unmounts `SocialProofToast`; empties `notifications.example.json`; drops the unsourced "60+ uneuuringut" claim; fixes mattress step-7 labels that contradicted their own values; derives Plausible domain / og:image / sitemap host from env; gives the staging generate step `SHEETS_API_URL`; adds `useAttribution` + plugin; rewrites `handleCalcSubmit` to a header map |
| 2 | `5eec85a` campaign landing pages | Sheet-driven `/probleem/:slug` with explicit prerender routes and an inline, pre-answered calculator. Also fixes the `fullPath` page-key bug below |
| 3 | `a08de14` quiet email capture | `LeadForm` at four placements, explicit unticked consent checkbox, `handleSubscribe` → `subscribers` tab, privacy policy updated in the same commit |
| 4 | `82df93e` consent v2 + Meta Pixel | `{ analytics, ads }` under `uva-consent-v2`, three-button banner, pixel gated on explicit ads consent |
| 5 | `33b1659` docs + myths filter | `docs/kampaaniad.md`; "Müüdid" tab in `PostGrid.vue` |
| 6 | `4d81b14` build artifact cleanup | See trap 3 |
| 7 | `0736743` GA4 page_view fix | See trap 4 |

---

## Traps - read these before touching anything

### 1. Never key a page on `route.fullPath`

`definePageMeta({ key: route => route.fullPath })` was on `pages/artiklid/[slug].vue`. Any query
string produced a different key, which discarded the prerendered payload and made `useFetch` call
`/api/posts` - a route that **does not exist on a static host**. The fetch 404'd, `post` resolved
null, and the not-found `navigateTo` fired.

**This was live in production.** Facebook appends `fbclid` to shared links, so every Facebook
click on an article was landing on `/artiklid` instead of the article. Every ad click would have
done the same.

Both `[slug].vue` pages now key on the slug param. Their redirects also now fire only when the
list actually loaded and the slug genuinely isn't in it - never on a failed fetch:

```ts
if (!pending.value && posts.value.length > 0 && !post.value) navigateTo('/artiklid')
```

Any new dynamic route must follow both halves of this.

### 2. `scripts/apps-script.gs` is a mirror, not the running code

The live backend is in the Unevalem Google account (spreadsheet → Extensions → Apps Script).
**Editing the repo file changes nothing until it is pasted there and redeployed.**

Two changes on this branch are inert until that happens:
- `handleCalcSubmit` rewritten from a positional `appendRow` to a header map. The old version
  wrote an 18-column header set at tab-creation time while the client already sent 25 fields, so
  **seven answers were silently dropped on every submission**: `complaint`, `age`, `pillowCount`,
  `sleepQuality`, `currentMattress`, `roomTemp`, `problemSeason`.
- `handleSubscribe`, which the newsletter form POSTs to. Without it, sign-ups go nowhere.

`subscribers` must **never** be added to `SHEET_MAP` - same rule as `orders` and `waitlist`.
Adding it would publish the mailing list over an unauthenticated GET.

### 3. A local build can corrupt `public/data/terminals.json`

`fetch-content.ts` refetches Omniva parcel terminals on every build and overwrites the committed
file. In the sandbox the feed came back truncated and the file went from **408 rows to 7** - which
would have emptied the checkout terminal dropdown in production. It nearly got committed.

The existing guard only rejects *zero* terminals (`if (!omniva.length) throw`), so a partial
response passes. **Never commit `terminals.json` from a local build.** A worthwhile small
follow-up: reject a response that is implausibly smaller than the file on disk.

Related: `public/data/*.json` are generated and gitignored - only `*.example.json` is committed.
`pains.json` was added to `.gitignore` on this branch. A stray `dist` symlink to `.output/public`
also got committed and had to be removed; it's gitignored now.

### 4. GA4 page_view fired before the title updated

`router.afterEach` runs before Vue renders the incoming page, and `useHead` applies the `<title>`
later still, on its own DOM flush after paint. gtag auto-collects `page_title` from
`document.title` at send time, so **every client-side navigation was filed under the previous
page's title** - and GA4's "Pages and screens" report keys on title by default, making all in-site
navigation look like the homepage.

One `nextTick` is *not* enough - measured, it still read the old title. The fix waits for the
title to actually change with a bounded rAF loop, and falls back to sending anyway when a title
legitimately doesn't change. The payload now sends GA4 parameters (`page_location`, `page_title`)
instead of `page_path`, which is a Universal Analytics field GA4 ignores.

Load any page with `?ga_debug=1` to set gtag `debug_mode` and see the session in
**GA4 → Admin → DebugView**. That is the reliable way to check the tag; Realtime only covers the
last 30 minutes and will be empty until there's live traffic.

---

## Verification that existed and is now gone

Four Playwright suites ran against a local `nuxt generate` build. They lived in the session
scratchpad and died with the container. Recreate them if you touch these areas - each one caught
a real defect:

1. **Attribution** - direct visit sets no cookie; a campaign landing writes first-touch; a second,
   different campaign does *not* overwrite it; last-touch lands in `sessionStorage`; a fresh
   browser gets its own first touch. Also asserts no social-proof toast renders after 8s.
2. **Pain pages** - headline present with **JavaScript disabled** at 390px (message match must
   survive first paint); blanket page opens the blanket flow with `sweating` pre-selected
   (`aria-pressed="true"`); a `lead`-type page embeds no calculator; campaign captured on landing.
3. **Routing regression** - `/probleem/*` and `/artiklid/*` with `fbclid` and `utm_*` stay put
   rather than redirecting. This is the trap-1 guard; keep it.
4. **Consent** - undecided grants analytics and denies ads and loads no pixel; "Ainult vajalikud"
   sets no `_fbp`; full consent loads the pixel; **a legacy `uva-consent=granted` cookie does not
   escalate to advertising consent**; "Ainult statistika" grants analytics only.

Two initial failures in these suites were bad assertions, not product bugs, and were corrected:
an unknown pain slug correctly 404s on a static host (it isn't prerendered), and the cookie banner
is a required `role="dialog"`, not a newsletter popup.

---

## Deliberately deferred

| Deferred | Why |
|---|---|
| OG image cards (~13 static PNGs at 1200×630) | Design work, not code. Soft blocker - do it during the first ad week. The site-wide `og:image` is still a letterboxed logo. |
| Shareable quiz-result routes (`/unetest/tulemus/[quiz]/[key]`) | Real value - query-encoded results cannot have their own preview on a static host, so per-band prerendered pages are the only honest option. Deferred to keep this PR reviewable. |
| GA4 `purchase` event + `gaEcommerce()` helper | Pointless until the supplier deal closes and something is buyable. `gaEvent`'s signature can't carry a GA4 `items` array; that needs a typed helper. |
| Any ESP (Brevo/MailerLite) | Zero subscribers. The Apps Script path suffices to ~300; the schema is CSV-export shaped. |
| Meta CAPI | No server exists. Browser-only pixel coverage accepted. |

**Optimise Meta toward `Lead`, not `Purchase`, for the first cycle.** With nothing purchasable
there are no purchase events and the optimiser never exits learning.

---

## Before the first euro of ad spend

Code is only half of it. These are sheet- and account-side:

- [ ] Create the `pains` tab. Columns and three ready rows: `public/data/pains.example.json`.
- [ ] Set `active` → `FALSE` on every fabricated row in `notifications`. The toast is unmounted in
      code, so this is belt-and-braces - but do it, because the component returns one day.
- [ ] Delete the stale English demo rows in `stats`.
- [ ] Check `calculatorCompletions.active` isn't the string `"TRUE "` with a trailing space -
      `fetch-content.ts:40` compares without trimming, so that reads as inactive.
- [ ] **Paste `scripts/apps-script.gs` into the Apps Script editor and redeploy** (see trap 2).
- [ ] Set `NUXT_PUBLIC_META_PIXEL_ID` as a repo variable and reference it in `deploy.yml`.
- [ ] Source or cut every `[VAJAB ALLIKAT]` figure in `docs/kampaaniad.md`. Section 2 of that file
      is the rule: every number in an ad traces to a row in the `sources` tab.

Then: `npm ci && npm run build:full`, confirm `.output/public/probleem/<slug>/index.html` exists
for every active pain - **a missing file means a paid click 404s** - and check staging sends
nothing to the production GA property or the `unevalem.ee` Plausible domain.
