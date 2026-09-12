# CLAUDE.md - Unevalem Project Bible

> Read this file completely at the start of every session before touching any code.
> It describes **how the project is now**, not how it got here. Where a past
> mistake is still easy to repeat, it is recorded under "Traps" at the end -
> those are the only historical notes kept, and they are kept because the code
> alone does not explain why it is shaped that way.
>
> Last full revision: 2026-08-12.

---

## What Unevalem Is

**Unevalem** (Estonian: "sleep formula") is an Estonian-language sleep education
site with a small shop attached. Philosophy: **educate first, sell second**. If
someone learns here and buys a competitor's pillow, that is fine. Trust and
authority over hard selling.

The site is built around **three sleep calculators** (the funnel), a **sleep
blog** fed from Google Sheets, an **interactive quiz**, and a **small shop**.

- **Domain:** unevalem.ee
- **Language:** all UI copy in Estonian. Code, comments and identifiers in English.
- **Audience:** Estonian adults 25-55.
- **Owner:** Costlio OÜ, registrikood 14562345, unevalem@gmail.com.
  **Not VAT-registered** - never render "sisaldab käibemaksu" or "km-ga";
  prices are final. Delivery promise everywhere: 2-5 tööpäeva.

---

## Tech Stack (locked - do not change without discussion)

| Layer | Technology |
|-------|-----------|
| Framework | Nuxt 3 (Vue 3, TypeScript, `nuxt generate` → static) |
| Styling | Tailwind CSS via `@nuxtjs/tailwindcss` |
| Icons | `@nuxt/icon` |
| Utilities | `@vueuse/core` |
| Fonts | **Plus Jakarta Sans** (headings) + **Inter** (body) via `@nuxtjs/google-fonts` |
| Content backend | Google Sheets, read through an **Apps Script Web App** at build time |
| Hosting | GitHub Pages, custom domain unevalem.ee |
| Build/Deploy | GitHub Actions - push to `main`, plus daily cron `0 4 * * *` UTC (06:00 EET) |
| Analytics | Plausible + GA4 (`G-D921C30JEQ`), Consent Mode v2 |
| Payments | Maksekeskus / MakeCommerce behind an adapter in `scripts/apps-script.gs` |

**No server, no database.** Everything is static files on GitHub Pages. The only
backend is the Apps Script Web App in front of the spreadsheet. `server/api/*`
routes exist only to serve the build-time JSON during dev and prerender - they
do not exist on the static host, which is why page keys must never include a
query string (see Traps).

---

## Environments and Branching

**There are exactly two environments: local, and unevalem.ee.**

- Develop against `npm run dev`.
- Verify with a local production build (recipe below).
- Feature work gets its own `feat/*` branch so it can be parked, reviewed or
  dropped as a unit, then merges straight to `main`.
- `main` → unevalem.ee via `.github/workflows/deploy.yml`. It is the only
  deployment workflow.

There is **no `dev` integration branch and no staging tier**. test.unevalem.ee
was retired on 2026-07-30 (GitHub Pages has no auth on any free plan, so a
hosted staging site could not be restricted to one reviewer). `dev` and
`feat/funnel-readiness` were fully merged and deleted on 2026-08-12.

**Local production review** (bash / Git Bash):
```bash
npm ci
NUXT_PUBLIC_SITE_URL=http://localhost:4000 \
NUXT_PUBLIC_GA_ID= \
NUXT_PUBLIC_PLAUSIBLE_DOMAIN=localhost \
npm run build:full
npx serve .output/public -l 4000     # not `nuxt dev` - prerendered output differs
```

Verify before trusting it: `.output/public/index.html` must not contain
`G-D921C30JEQ`, and its `data-domain` must not be `unevalem.ee`.

`NUXT_PUBLIC_SITE_URL` also tags calculator and newsletter rows as non-production
in the sheet (`isProdSite` in `utils/site.ts`) and keeps localhost out of the
sitemap.

Local review hits the **production** Apps Script backend - same sheet, same
`orders` tab, same MK credentials. Harmless while `MK_ENV=test`; revisit before
switching Maksekeskus to live.

---

## Project Structure

```
unevalem/
├── CLAUDE.md
├── nuxt.config.ts                   ← prerender routes read posts.json + pains.json
├── app.vue
│
├── pages/
│   ├── index.vue                    ← landing; calculator is the hero
│   ├── artiklid/{index,[slug]}.vue  ← blog
│   ├── unetest/index.vue            ← quiz
│   ├── pood/index.vue               ← shop
│   ├── kassa/index.vue              ← checkout
│   ├── aitah/index.vue              ← post-payment, polls order_status
│   ├── tellimus/index.vue           ← buyer order lookup
│   ├── probleem/[slug].vue          ← campaign landing pages (from `pains` tab)
│   └── {meist,muugitingimused,privaatsus}/index.vue
│
├── components/
│   ├── calculator/{SleepCalculator,CalculatorStep,CalculatorResult}.vue
│   ├── lead/LeadForm.vue            ← newsletter, 4 placements
│   ├── shop/{...}.vue
│   ├── blog/{PostCard,PostGrid}.vue
│   ├── social/SocialProofToast.vue  ← EXISTS BUT UNMOUNTED (see Honesty)
│   └── layout/{AppHeader,AppFooter,CookieConsent}.vue
│
├── composables/
│   ├── useCalculator.ts             ← step state, skip logic
│   ├── useCalcSession.ts            ← cross-calculator funnel state (cookie)
│   ├── useCalculators.ts            ← the sheet-driven question definitions
│   ├── useAnalytics.ts              ← gaEvent + sheet submissions
│   ├── useAttribution.ts, useConsent.ts, useCart.ts, usePosts.ts, …
│
├── utils/
│   ├── calculator.ts                ← pure recommendation engine
│   ├── calc-schema.ts               ← answer keys + allowed values (the contract)
│   ├── copy.ts                      ← Estonian UI chrome; never hardcode in .vue
│   ├── products.ts, affinity.ts, ga.ts, site.ts
│
├── scripts/
│   ├── fetch-content.ts             ← Sheets → public/data/*.json
│   ├── apps-script.gs               ← MIRROR of the live backend (paste to deploy)
│   ├── check-influence.ts           ← every question must change the result
│   ├── export-calculators.ts        ← one-shot copy.ts → sheet migration
│   └── *-import.tsv                 ← seed data for the Apps Script importers
│
└── public/data/                     ← generated at build; *.example.json committed
```

---

## Design System

Tokens in `assets/css/main.css`, mapped into Tailwind under `theme.extend.colors`:

```css
--color-midnight:  #0D1B2A;   --color-dusk:      #1B2D45;
--color-lavender:  #B8A9C9;   --color-moonlight: #F0EDF5;
--color-foam:      #FFFFFF;   --color-gold:      #C9A96E;
--color-muted:     #7B8794;   --color-success:   #4CAF7D;
```

**Light/dark is done with semantic surface classes, not colour utilities.**
Once the themes diverged, the same Tailwind colour meant different things per
section - in light mode the hero band is page-toned with dark text while the
value band below stays deep teal with light text, and no single `text-foam`
override expresses both. So text colour travels with its surface
(`hero-band`/`hero-title` and friends). Dark is the default: `nuxt.config`
stamps `class="dark"` and an inline script strips it before first paint when the
stored choice is light - hence base values on `:root`, overridden under
`html.dark`.

Header colour must land **on** the palette ramp (midnight → dusk → lavender →
moonlight). An invented in-between reads as foreign no matter how well it
measures. Ink is per-theme rather than tinted: between roughly #26707F and
#3591A5 neither white nor dark ink reaches 4.5:1.

**Tone of voice:** informal "sina", never "teie". No urgency, no countdowns, no
"Osta kohu!". Science made accessible. A well-informed friend, not a salesperson.

---

## The Calculators

**Three sequential 8-step calculators** - pillow → blanket → mattress - chained
by `useCalcSession`. (There is no single 5-step flow; that was the original 2024
design and is long gone.)

### Where the questions live

**In the `calculators` and `calc_questions` sheet tabs**, since 2026-08-12,
assembled at build time into `public/data/calculators.json`, served by
`/api/calculators`, read through `useCalculators()`. The Estonian is editable
without a developer.

**What is NOT editable in the sheet:** each question's `answerKey` and the value
half of each option (`Label|value`). Those are the contract with
`utils/calculator.ts` - the engine branches on them, `useCalcSession` matches
them when prefilling a later calculator, and they name the columns in each
`<calcType>_responses` tab. The allowed set is `utils/calc-schema.ts`, and
`fetch-content.ts` validates every sheet row against it and **fails the build**
on a mismatch. That is deliberate: a bad value throws nowhere at runtime, it
just makes the engine silently ignore that answer for everyone.

`utils/copy.ts` keeps only the calculator **chrome** - `heroTitle`,
`progressLabel`, `timeLeft`, `session.*`, `result.*`.

### Rules the questions must obey

- **Every step must visibly influence the result** - score, `profileSummary`,
  tips or product tags. `scripts/check-influence.ts` enforces this: it varies
  each question with the others held fixed and counts distinct outcomes, exiting
  non-zero if any question changes nothing. Run it after touching the engine or
  the sheet.
- **Answered questions are never re-asked.** `reset()` starts at the first
  unanswered step and advance/back hop over prefilled ones, so the funnel asks
  18 questions rather than 24 and the mattress calculator asks 4 rather than 8.
  The visible counter and progress bar count only steps actually asked.

### Result screen order

Score + `profileSummary` (advice) first, tips next, **products last** in a
compact section. Never restore a product-first layout.

Recommendations only suggest products matching ≥1 profile tag. **A zero-product
result is a valid, intended outcome** - `result.noProductsYet` covers it.

---

## Google Sheets Schema

One Apps Script Web App fronts everything:

```bash
SHEETS_API_URL=https://script.google.com/macros/s/AKfycbxacVFUEpBK1rpkOwUF8_-0YHgtizXqz0TE9NosgsARQiNHbMeFOZ4sxt7dD48023DNpQ/exec
```

`${SHEETS_API_URL}?sheet=<name>` returns that tab as JSON. `SHEET_MAP` in
`apps-script.gs` is the allowlist; an unknown tab returns `{"error":…}`, which
`tryFetchSheet` treats as absent.

**`orders`, `subscribers` and `waitlist` hold PII and are deliberately NOT in
`SHEET_MAP`. Never add them.**

| Tab | Contents |
|---|---|
| `posts` | id, slug, title, excerpt, content (Markdown), category, publishDate, tags, coverImage, status, isFeatured, readingTimeMin, diveDeeper *(legacy)*, **proofread** |
| `sources` | slug → title, url. One row per citation; titles stay in the study's original language |
| `notifications` | id, text, type, active *(component unmounted - see Honesty)* |
| `stats` | key, value, displayText, active. Includes `calculatorVersion` |
| `inventory` | products, incl. an `available` column - only explicit TRUE is purchasable |
| `tips` | daily sleep tips |
| `quizzes` / `quiz_questions` / `quiz_results` | the unetest quiz |
| `calculators` / `calc_questions` | the three calculators |
| `pains` | campaign landing pages for `/probleem/<slug>` |
| `post_stats` | slug → views |

### The `proofread` gate

Articles are AI-drafted; nothing goes live until a person has read and corrected
it. A post publishes only when `status = published` **AND** `proofread` is
non-empty and not `FALSE`. Enforced in `fetch-content.ts`.

These are two distinct states and the build log distinguishes them - "not
proofread by a human yet" is not the same as "status: draft". Don't conflate
them when reporting.

**This gate is the site's real bottleneck.** As of 2026-08-12, 4 of 22 articles
are live. It also throttles the myth quiz, whose questions link to their article.
The gate is correct and should not be loosened.

### Content conventions

- Post titles prefixed `MÜÜT: ` mark myth-busting content. Parsed once in
  `usePosts.ts` (`/^MÜÜT:\s*/i`), which sets `isMyth` and strips the prefix.
  Rendered as a `✕ MÜÜT` pill, never as title text.
- **Do not trust the Apps Script to filter drafts** - it returns them.
  `fetch-content.ts` filters `status === 'published'` before writing
  `posts.json`, which is the single choke point every consumer reads. Keep the
  filter even if the script is fixed.

---

## Content Fetch (`scripts/fetch-content.ts`)

```bash
npm run fetch-content     # Sheets → public/data/*.json
npm run build:full        # fetch-content && nuxt generate  ← always use this
```

- **Sheet requests are issued one at a time.** They used to run as one
  `Promise.all` of twelve, which the Apps Script throttled; retries then
  collided with each other and the daily cron failed roughly as often as it
  succeeded. Backoff is exponential with jitter. Costs ~10s; do not
  re-parallelise it.
- **A failed required sheet kills the build.** Example data must never ship to
  production - it did once (run 29510944443), publishing 5 dummy articles.
- No `SHEETS_API_URL` → copies `*.example.json` → `*.json` and exits 0, so
  `npm run dev` works without credentials.
- `fetch-content` must run **before** `generate`: `nuxt.config.ts` reads
  `posts.json` and `pains.json` to build `nitro.prerender.routes`. `crawlLinks`
  alone is not enough - `PostGrid` paginates, so the crawler only ever finds the
  first page of articles and the rest 404 while still appearing in the sitemap.

---

## Shop

/pood → `useCart` (localStorage `uva-cart`, **ids + qty only** - prices are
never trusted from the client) → CartDrawer → /kassa (name, email, phone, Omniva
terminal, note) → Apps Script `create_order` (server-side price lookup from
`inventory`, rejects unknown/inactive/unavailable) → Maksekeskus redirect →
/aitah?ref=<uuid> polls `order_status` and shows only the server-verified status.

- `available` blank/missing ⇒ waitlist mode ("Anna teada, kui saadaval").
- **Parcel terminals are fetched at BUILD time** (browser CORS blocks carrier
  APIs) into `public/data/terminals.json`, ~437 Omniva rows. SmartPost has no
  public feed since the rebrand; checkout shows a carrier only if
  `terminals.json` has rows for it.
- Payment creds live in Script Properties (`MK_SHOP_ID`, `MK_SECRET_KEY`,
  `MK_ENV=test|live`), never in code. Callbacks verify
  `MAC = UPPER(HEX(SHA512(json+secret)))` **before** any state change,
  are idempotent on duplicate COMPLETED, and only COMPLETED ⇒ PAID ⇒ emails.

---

## Honesty Rules (non-negotiable)

These exist because the site's whole positioning is trust, and because
fabricated social proof is a per-se unfair commercial practice under
Omnibus-amended EU Directive 2005/29/EC Annex I once ads drive traffic.

- **No fabricated social proof.** `SocialProofToast` is **unmounted** -
  `app.vue` does not render it. Every notification row described a purchase that
  never happened. The component, composable and tab all remain; remount **only**
  when real orders can feed it, never with hand-written rows.
  `notifications.example.json` is `[]` because it is the production fallback.
- **No invented counters or ratings.** No "60+ uuringut" unless a `sources` row
  backs it. Keep claims qualitative otherwise.
- **Every recommendation surface** shows `disclosure.short` plus a badge -
  "Unevalemi toode" or "Väline pood", derived from the storeUrl host by
  `isExternalStore`.
- **Every number in an ad traces to a `sources` row.** See `docs/kampaaniad.md`.
- **No popup, interstitial or gate on the newsletter.** The ads promise
  "e-posti ei küsi" and that must stay literally true.

---

## Newsletter

`components/lead/LeadForm.vue`, four placements: calculator result, footer, quiz
result, article end. Writes to a `subscribers` tab.

**Consent is the submit itself - there is no checkbox.** ESS §103¹ requires
prior consent for direct e-marketing but does not prescribe a mechanism; GDPR
Art 4(11) and Recital 32 accept "conduct which clearly indicates in this
context", and submitting a single-purpose form via a button labelled "Telli" is
that. The checkbox restated a decision the button already made and cost sign-ups
for it.

What consent must still be is **informed**, which `headingGeneric` + `promise`
above the button carry: what arrives, how often, that nothing is sold. Keep
those three facts whatever the wording. `consentText` records the whole visible
context verbatim with a version - consent you cannot evidence is not consent.

**If this form ever gains a second purpose** (bundled with an order, gating a
result), the separate checkbox has to come back.

---

## Analytics

Plausible + GA4 (`G-D921C30JEQ`), Consent Mode v2. `gaEvent()` in
`useAnalytics.ts`; funnel, shop, scroll and quiz events instrumented.

- **`send_page_view` stays ON.** gtag sends the landing page_view; the router
  hook sends each client-side navigation and drops its own first call only when
  still on the landing URL, so the two cannot double-count.
- **Consent v2** - `uva-consent-v2` holds `{ analytics, ads }`. Advertising
  storage is opt-IN and denied by default; analytics is opt-out. Three-button
  banner, reject as easy as accept.
- **Attribution** - `useAttribution` writes first-touch utm_*/fbclid/gclid/ttclid
  to a 90d `uva-attr` cookie (last-touch in sessionStorage). `attrPayload()`
  flows into `submit_calc` and `create_order`. **The sheet, not the pixel, is the
  reliable record** - don't try to reconcile them.
- **Meta Pixel** no-ops unless ads are granted and `NUXT_PUBLIC_META_PIXEL_ID`
  is set. **Optimise toward `Lead`, not `Purchase`,** while nothing is purchasable.

### Server-side conversion recovery

15-30% of visitors run a tracker blocker, more on paid traffic. Blockers do not
fail loudly: they answer `gtag/js` with a neutered **200** carrying a no-op
`gtag`, so `typeof window.gtag === 'function'` stays true and events silently
evaporate. **`window.google_tag_manager` is the only honest check** - that is
what `isGaBlocked()` in `utils/ga.ts` tests.

Blocked visitors still reach the Apps Script backend, so conversions are re-sent
from there over the GA4 Measurement Protocol (`gaSendServerEvent_`), wired into
`handleCalcSubmit` (`submit_calc`), `handleSubscribe` (`lead`) and the payment
callback (`purchase`).

- **Only fires when the client reports `gaBlocked: true`** - otherwise the
  browser already sent it and both would count.
- `isGaBlocked()` has a **3-second grace period**; gtag.js is async and a
  one-second-old page may legitimately not have it yet. An undercount is
  recoverable, a double count silently corrupts the funnel.
- `purchase` is **not** a fallback - the browser can never send it. Payment
  confirmation is a server-to-server callback while the visitor is still on the
  provider's domain. The `orders` tab's `gaMeta` column (16) holds the
  checkout's transport data for the callback to read back.
- Needs Script Properties `GA_MEASUREMENT_ID` and `GA_API_SECRET`. Verify with
  `gaDebugPing()` - a real MP send always returns 204 even for a payload GA
  discards, so the debug endpoint is the only one that tells you anything.
- **Ordinary pageviews stay under-reported and that is fine.** Only conversions
  are recovered. When GA and the sheet disagree on volume, the sheet is right.

---

## Campaign Landing Pages

`pages/probleem/[slug].vue`, driven by the `pains` tab (slug, eyebrow, headline,
subhead, bodyMd, ctaType, ctaLabel, prefill, relatedSlugs, ogImage, metaTitle,
metaDescription, active, noindex).

Routes are added to `nitro.prerender.routes` by `painRoutes()` - without that
every ad click 404s, since nothing on the site links to them. The headline must
mirror the ad's wording verbatim and is rendered **server-side**, never inside
`ClientOnly`. `SleepCalculator` takes `calcType` / `prefill` / `prefilledFrom`
props so the calculator embeds inline rather than being linked.

---

## Apps Script Admin Helpers

`scripts/apps-script.gs` is a **mirror**, not the running code. Edit here, paste
into the editor, save. Editor-run helpers need no redeploy; changing
`doGet`/`doPost` behaviour does.

| Helper | Does |
|---|---|
| `importSources()` | seeds the `sources` tab from `scripts/sources-import.tsv` |
| `importCalculators()` | one-shot seed of `calculators` + `calc_questions`; refuses to run if they exist |
| `setupShop()` | adds `available`, creates `waitlist` + `orders` |
| `reportEmptyCalcColumns()` | **dry run** - lists always-blank `*_responses` columns |
| `deleteEmptyCalcColumns()` | deletes them, right-to-left, protecting sparse attribution columns |
| `gaDebugPing()` | validates the Measurement Protocol setup |

**Column cleanup order matters:** deploy the site first. The client must stop
sending a key before its column is deleted, or `handleCalcSubmit` recreates it.

**Never delete or insert columns in `orders`** - `setOrderStatus_` and
`handlePaymentCallback` address it positionally. Append only.

---

## Coding Standards

- TypeScript only, no `.js`. No `any`; interfaces in `types/index.ts`.
- **All Estonian copy in `utils/copy.ts`** or the sheet - never hardcoded in `.vue`.
- Composables for shared state; no prop drilling. No Pinia.
- `public/data/*.json` is the only runtime data source - never call Sheets from the browser.
- Mobile-first (390px), then scale up.
- Accessibility: keyboard-navigable, 4.5:1 contrast, proper `aria-` labels.
- Auto-imports are on - don't import `ref`, `computed`, etc.

---

## Traps

Things that have already gone wrong here and would go wrong the same way again.

**Page keys must NOT be `route.fullPath`.** Any query string produces a
different key, which discards the prerendered payload and makes `useFetch` call
`/api/*` - routes that don't exist on a static host. The fetch 404s and the
not-found redirect fires. This was live: Facebook appends `fbclid`, so every
Facebook click on an article landed on `/artiklid`. Both `[slug].vue` pages key
on the slug param, and their redirects fire only when the list actually loaded
without the slug - never on a failed fetch.

**`@vueuse/useStorage` is NOT auto-imported in `composables/*.ts`** during SSR
(only in `.vue`). Import it explicitly or every page 500s at prerender.

**A local `build:full` overwrites `public/data/terminals.json`, which IS
committed** (unlike the other generated JSON). A truncated Omniva response
passes the `if (!omniva.length)` guard and would empty the checkout dropdown in
production. After any local build: `git diff --stat public/data/terminals.json`
- if it shrank, `git checkout --` it.

**PowerShell deletes an env var when you assign `''`.** `$env:NUXT_PUBLIC_GA_ID = ''`
removes it, and `nuxt.config.ts` then falls back to the production GA id - so
the obvious translation of the review recipe sends review traffic to the live
property. Use
`[Environment]::SetEnvironmentVariable('NUXT_PUBLIC_GA_ID', '', 'Process')`.

**Backticks inside double-quoted `git commit -m` get command-substituted** by
bash. Use single quotes or a heredoc.

**Nuxt won't `generate` while `nuxt dev` holds the lock.** Stop the dev server
first - but stop *that process*, not every `node.exe` on the machine.

**For "analytics shows nothing", ask for the browser's console state FIRST**
(`typeof window.gtag`, `window.google_tag_manager`, the Network status of
`gtag/js`, console errors). Reasoning from source cannot see a browser
extension. This cost four wrong turns once; the answer was a tracker blocker in
the owner's own browser.

---

*Update this file whenever a significant architectural decision is made. Prefer
rewriting the affected section over appending an update log - a "superseded"
block still gets read as current.*
