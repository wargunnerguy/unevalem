# CLAUDE.md — Unevalem Project Bible

> Read this file completely at the start of every session before touching any code.
> This is the single source of truth for all decisions already made.

---

## What Is Unevalem

**Unevalem** (Estonian: "sleep formula") is an Estonian-language sleep education website.
Philosophy: **educate first, sell second**. Be the #1 sleep resource in Estonia. If someone
learns here and buys a competitor's pillow, that is fine. Trust and authority over hard selling.

The site is built around a **Fit Calculator** (funnel hero), a **sleep blog** (posts from
Google Sheets), **interactive quizzes**, and subtle **social proof notifications**.

**Target domain:** unevalem.ee
**Language:** All UI copy in Estonian. Codebase, comments, variable names in English.
**Audience:** Estonian adults, 25–55, interested in sleep quality.

---

## Tech Stack (locked — do not change without discussion)

| Layer | Technology | Notes |
|-------|-----------|-------|
| Framework | **Nuxt (latest stable)** | Vue 3, TypeScript, `nuxt generate` for static output |
| Styling | **Tailwind CSS** | via `@nuxtjs/tailwindcss` |
| Icons | **@nuxt/icon** | |
| Animation | **Vue `<Transition>`** built-in | For calculator step slides; upgrade to `@vueuse/motion` if needed |
| Utilities | **@vueuse/core** | composable utilities |
| Content backend | **Google Sheets API v4** | Fetched at build time only, never at runtime |
| Hosting | **GitHub Pages** | Static output, custom domain unevalem.ee |
| Build/Deploy | **GitHub Actions** | Daily cron + on push to main |
| Rebuild schedule | Daily cron `0 4 * * *` (UTC) = 06:00 EET | |
| Analytics | **Plausible** | GDPR-friendly, no cookie banner needed |
| Fonts | **DM Serif Display + Inter** | via `@nuxtjs/google-fonts` |

**No server, no API routes, no database.** Everything is static files on GitHub Pages.
The only "backend" is Google Sheets, read at build time to generate JSON files.

---

## Project Structure

```
unevalem/
├── CLAUDE.md                        ← you are here — always read first
├── nuxt.config.ts
├── tailwind.config.ts
├── tsconfig.json
├── package.json
│
├── app.vue                          ← root app shell with <NuxtPage />
│
├── pages/
│   ├── index.vue                    ← landing page (calculator is the hero)
│   ├── artiklid/
│   │   ├── index.vue                ← blog post listing
│   │   └── [slug].vue               ← individual blog post
│   └── viktoriin/
│       └── index.vue                ← quizzes & games
│
├── components/
│   ├── calculator/
│   │   ├── SleepCalculator.vue      ← orchestrates the full 5-step flow
│   │   ├── CalculatorStep.vue       ← single step (question + options)
│   │   └── CalculatorResult.vue     ← result: score, recommendations, tips
│   ├── social/
│   │   └── SocialProofToast.vue     ← rotating bottom-left notifications
│   ├── blog/
│   │   ├── PostCard.vue
│   │   └── PostGrid.vue
│   └── layout/
│       ├── AppHeader.vue
│       └── AppFooter.vue
│
├── composables/
│   ├── useCalculator.ts             ← calculator state (step, answers, result)
│   ├── usePosts.ts                  ← fetch + filter blog posts from static JSON
│   └── useNotifications.ts          ← rotating social proof toast logic
│
├── utils/
│   ├── calculator.ts                ← pure recommendation engine (no Vue deps)
│   └── copy.ts                      ← ALL Estonian UI strings — never hardcode
│
├── types/
│   └── index.ts                     ← shared TypeScript interfaces
│
├── assets/
│   └── css/
│       └── main.css                 ← CSS custom properties + global styles
│
├── public/
│   └── data/                        ← generated at build time, served as static JSON
│       ├── posts.json               ← real data (from Sheets, gitignored)
│       ├── notifications.json       ← real data (from Sheets, gitignored)
│       ├── stats.json               ← real data (from Sheets, gitignored)
│       ├── posts.example.json       ← sample data for dev (committed to git)
│       ├── notifications.example.json
│       └── stats.example.json
│
├── scripts/
│   └── fetch-content.ts             ← Google Sheets → public/data/*.json
│
└── .github/
    └── workflows/
        └── deploy.yml               ← build + deploy to GitHub Pages
```

---

## nuxt.config.ts

```typescript
export default defineNuxtConfig({
  compatibilityDate: '2024-11-01',
  devtools: { enabled: true },

  modules: [
    '@nuxtjs/tailwindcss',
    '@nuxt/icon',
    '@nuxtjs/google-fonts',
    '@vueuse/nuxt',
  ],

  googleFonts: {
    families: {
      'DM+Serif+Display': { ital: [0, 1] },
      'Inter': [300, 400, 500, 600],
    },
    display: 'swap',
  },

  css: ['~/assets/css/main.css'],

  // Static generation for GitHub Pages
  nitro: {
    preset: 'static',
  },

  // If using custom domain (unevalem.ee), baseURL is '/'.
  // If deploying to username.github.io/unevalem/ without custom domain,
  // set NUXT_APP_BASE_URL=/unevalem/ in the GitHub Actions environment.
  app: {
    baseURL: process.env.NUXT_APP_BASE_URL ?? '/',
  },

  // Runtime config (public = exposed to client)
  runtimeConfig: {
    public: {
      siteUrl: process.env.NUXT_PUBLIC_SITE_URL ?? 'https://unevalem.ee',
    },
  },
})
```

---

## Design System

### Color Palette (`assets/css/main.css`)

```css
:root {
  --color-midnight:  #0D1B2A;   /* deep navy — primary dark background */
  --color-dusk:      #1B2D45;   /* secondary dark — cards, toasts */
  --color-lavender:  #B8A9C9;   /* soft purple — accent */
  --color-moonlight: #F0EDF5;   /* near-white — page background */
  --color-foam:      #FFFFFF;
  --color-gold:      #C9A96E;   /* warm gold — CTA buttons only */
  --color-muted:     #7B8794;   /* secondary text */
  --color-success:   #4CAF7D;   /* positive result states */
}

body {
  background-color: var(--color-moonlight);
  color: var(--color-midnight);
  font-family: 'Inter', sans-serif;
}
```

Map these to Tailwind in `tailwind.config.ts` under `theme.extend.colors`:
```typescript
colors: {
  midnight: 'var(--color-midnight)',
  dusk: 'var(--color-dusk)',
  lavender: 'var(--color-lavender)',
  moonlight: 'var(--color-moonlight)',
  foam: 'var(--color-foam)',
  gold: 'var(--color-gold)',
  muted: 'var(--color-muted)',
  success: 'var(--color-success)',
}
```

### Typography
- **Headings:** `DM Serif Display` — elegant, trustworthy, serif warmth
- **Body:** `Inter` — clean, readable at small sizes
- **Pull quotes / accents:** `DM Serif Display` italic

### Tone of Voice
- Informal **"sina" form** (never formal "teie")
- No aggressive urgency — no "Osta kohe!", no countdown timers
- Understanding language: "Leia oma unelahendus", "Vaata, mis sulle sobib"
- Science made accessible: "Teadlased on avastanud..." not jargon
- Warm but knowledgeable — a well-informed friend, not a salesperson

---

## The Fit Calculator

The calculator is the **hero of the landing page** — visible immediately without scrolling.
No long intro copy above it. The page opens and the calculator is right there.

### Flow
- **5 steps**, one question per screen
- **Progress bar** at top (Step X of 5, or dots)
- **Slide animation** between steps (Vue `<Transition name="slide">`)
- Steps 1–4: selecting an option **auto-advances** (no Next button)
- Step 5: multi-select, requires explicit **"Kuva minu valem"** button
- **Back button** available on all steps ≥ 2

### Calculator State (`composables/useCalculator.ts`)

```typescript
// State shape
const step = ref(1)          // 1–5, then 6 = result
const answers = ref<Partial<UserProfile>>({})
const result = ref<CalculatorResult | null>(null)

// Actions
function selectOption(key: keyof UserProfile, value: any) { ... }
function goBack() { ... }
function submitIssues() { ... }  // called on step 5 submit
function reset() { ... }
```

### Step 1 — Sleep Position
**Question:** `"Kuidas sa tavaliselt magad?"`

| Icon | Label | Value |
|------|-------|-------|
| 🫃 | Küljel | `"side"` |
| 🙆 | Selili | `"back"` |
| 😮‍💨 | Kõhuli | `"stomach"` |
| 🔄 | Vahelduvalt | `"combo"` |

### Step 2 — Temperature
**Question:** `"Kas sa magad pigem soojalt või jahedalt?"`

| Icon | Label | Value |
|------|-------|-------|
| 🥶 | Olen öösiti külm | `"cold"` |
| 😊 | Normaalselt | `"normal"` |
| 🥵 | Higistan öösel | `"hot"` |

### Step 3 — Pillow Loft
**Question:** `"Millist peatuge eelistad?"`

If user picks "Ei tea" → infer from position: stomach→low, back→medium, side→high, combo→medium

| Icon | Label | Value |
|------|-------|-------|
| 📏 | Madalat (alla 8 cm) | `"low"` |
| 📐 | Keskmist (8–12 cm) | `"medium"` |
| 🛏️ | Kõrget (üle 12 cm) | `"high"` |
| ❓ | Ei tea | inferred |

### Step 4 — Partner Situation
**Question:** `"Kas magad üksi või kellegagi koos?"`

| Icon | Label | Value |
|------|-------|-------|
| 🛏️ | Üksi | `"solo"` |
| 👫 | Kahekesi, ühine tekk | `"shared"` |
| 💨 | Kahekesi, eraldi tekid | `"separate"` |

### Step 5 — Sleep Issues (multi-select)
**Question:** `"Kas sul esineb mõni neist probleemidest?"`

| Label | Value added to issues array |
|-------|-----------------------------|
| Ärkan kuumalt / higistades | `"hot"` |
| Kaela- või õlavalu hommikul | `"neck"` |
| Raske uinuda | `"insomnia"` |
| Olen kergesti ärkav | `"light"` |
| Pole probleeme | clears all others |

**Submit button:** `"Kuva minu valem →"`

### TypeScript Types (`types/index.ts`)

```typescript
export type SleepPosition = 'side' | 'back' | 'stomach' | 'combo'
export type TempPreference = 'cold' | 'normal' | 'hot'
export type PillowLoft = 'low' | 'medium' | 'high'
export type PartnerSituation = 'solo' | 'shared' | 'separate'
export type SleepIssue = 'hot' | 'neck' | 'insomnia' | 'light'

export interface UserProfile {
  position: SleepPosition
  temp: TempPreference
  loft: PillowLoft
  partner: PartnerSituation
  issues: SleepIssue[]
}

export interface ProductRec {
  id: string
  name: string         // Estonian
  reason: string       // Why recommended, 1 sentence, Estonian
  urgency: 'must-have' | 'nice-to-have'
  category: 'pillow' | 'blanket' | 'topper' | 'extra'
  linkUrl?: string     // external product URL, optional
}

export interface CalculatorResult {
  currentScore: number    // 0–100 estimated current sleep quality
  improvedScore: number   // 0–100 estimated with recommendations
  recommendations: ProductRec[]
  personalTips: string[]  // 2–3 tips in Estonian
}
```

### Recommendation Logic (`utils/calculator.ts`)

**Pillow (by position + loft):**
- side → "Bambuspadi külilimagajale" — high side support, spinal alignment
- back → "Bambuspadi selilimagajale" — medium neutral spine support
- stomach → "Õhuke bambuspadi" — low, prevents neck strain
- combo → "Universaalne bambuspadi" — medium, adaptable
- + `issues.neck` → always add tip about cervical support pillow

**Blanket (by temp):**
- `hot` → bamboo blanket (thermoregulating, breathable)
- `cold` → heavier fill, flannel option
- `normal` → all-season bamboo
- `partner: shared` → add tip: separate blankets reduce sleep disruption ~30%
- `partner: separate` → lightweight single bamboo blanket recommended

**Score calculation:**
- Base score starts at 60
- Bad position+loft combo → subtract up to 15
- Hot sleeper without breathable blanket → subtract 10
- Each issue adds −5 to current score
- Improved score = current + 20 (with right products)

**Result page sections:**
1. Score visual — "Sinu praegune uneskoor: X/100 → pärast muutusi: Y/100"
2. Primary recommendation (large card with reason)
3. Secondary 1–2 recommendations (smaller cards)
4. 3 personalised tips
5. Soft CTA: `"Vaata soovitatud tooteid →"` (links to product pages or placeholder `#`)

---

## Google Sheets Schema

The Google Sheet has 3 tabs. A pre-build Node script reads them and writes static JSON.

### Tab: `posts`
| Col | Field | Type | Example |
|-----|-------|------|---------|
| A | id | number | 1 |
| B | slug | string | `miks-uni-on-oluline` |
| C | title | string | `Miks on uni oluline?` |
| D | excerpt | string | Short 1–2 sentence summary |
| E | content | string | Full Markdown |
| F | category | string | `teadus` / `nõuanded` / `tooted` / `uneaeg` |
| G | publishDate | string | `2025-03-01` |
| H | tags | string | `tervis,uni,teadus` |
| I | coverImage | string | Full URL or empty |
| J | status | string | `published` / `draft` |
| K | isFeatured | boolean | `TRUE` / `FALSE` |
| L | readingTimeMin | number | `4` |

**Content convention — myth-busting posts:**
Post titles prefixed with `MÜÜT: ` in the Sheet mark myth-busting content
(e.g. `MÜÜT: Saan hakkama viie tunni unega`). Parsed once in
`composables/usePosts.ts` via `/^MÜÜT:\s*/i`: sets `isMyth = true` on the
`Post` object and strips the prefix from `title`. All consumers (PostCard,
article page, related posts, search) receive clean data. Rendered as a
`✕ MÜÜT` pill badge (`bg-midnight text-gold`) next to the category chip —
never as title text or page metadata. No separate Sheet column needed;
a dedicated `isMyth` boolean column is a future option if prefix styles vary.

### Tab: `notifications`
| Col | Field | Type | Example |
|-----|-------|------|---------|
| A | id | number | 1 |
| B | text | string | `Kristina ostis bambuspadja` |
| C | type | string | `purchase` / `view` / `quiz` |
| D | timestamp | string | `2025-06-20T10:30:00` (exact event time; browser computes "X tundi tagasi" at runtime) |
| E | active | boolean | `TRUE` / `FALSE` |

### Tab: `stats`
| Col | Field | Type | Example |
|-----|-------|------|---------|
| A | key | string | `calculatorCompletions` |
| B | value | string | `1 247` |
| C | displayText | string | `inimest on leidnud oma unevalemi` |
| D | active | boolean | `TRUE` / `FALSE` |

---

## Content Fetch Script (`scripts/fetch-content.ts`)

Run via `npm run fetch-content` before `nuxt generate`.

```typescript
// Reads from Google Sheets → writes to public/data/*.json
// Requires env vars: GOOGLE_SHEETS_API_KEY, SHEETS_ID
// Filters: only status=published rows for posts, only active=TRUE for notifications/stats
// On error: exits with code 1 so the build fails loudly rather than deploying stale data
// On dev (no API key): copies *.example.json → *.json so dev works without credentials
```

Add to `package.json`:
```json
{
  "scripts": {
    "fetch-content": "tsx scripts/fetch-content.ts",
    "generate": "nuxt generate",
    "build:full": "npm run fetch-content && npm run generate",
    "dev": "nuxt dev"
  }
}
```

---

## Social Proof

### Floating Toast (`components/social/SocialProofToast.vue`)
- **Source:** `public/data/notifications.json` (baked in at build, same for all users)
- **Position:** bottom-left corner, `fixed`, z-50
- **Animation:** slide up + fade in via Vue `<Transition>`
- **Timing:** show one every 15–25s (random), visible for 6s, then slide out
- **Rotation:** random order, loop after all shown
- **Mobile (< 640px):** hide while calculator is in progress to avoid covering it
- **Design:** ~280px wide, `bg-dusk` dark card, white text, small icon per type:
  - purchase → 🛍️, view → 👁️, quiz → 🎯
- Example text: `"Kristina ostis bambuspadja · 2 tundi tagasi"`

### Stats Line
- **Source:** `public/data/stats.json` (active only)
- Small muted text near the calculator, e.g.: `"Üle 1 200 inimese on leidnud oma unevalemi"`
- Not a banner — quiet, integrated

### "Always Active" Rules
The site must never feel abandoned or stale:
1. **No publication dates on post cards** — only inside the full post
2. `isFeatured: true` posts show a `"Populaarne"` badge
3. **"Päeva unenipp"** — daily sleep tip, rotates by day-of-year from a static 30-item array in `utils/copy.ts`. No date shown.
4. The calculator and quizzes are always inherently "live" — interactive content never ages
5. Category tabs on blog ensure there are always recent posts per category even with low total volume

---

## Blog Categories

| Key | UI label | Content |
|-----|----------|---------|
| `teadus` | Teadus | Sleep science, research, biology |
| `nõuanded` | Nõuanded | Practical tips, routines, bedroom setup |
| `tooted` | Tooted | Product education (bamboo, pillow types) — educational, not promotional |
| `uneaeg` | Uneaeg | Lifestyle (kids, shift work, aging, travel) |

Post page features: reading time shown, related posts at bottom (same category), share buttons (FB + copy link). No comments.

---

## Quizzes (`pages/unetest/index.vue`)

Quizzes are **content from Google Sheets** (migrated out of `utils/copy.ts`).
They live across three tabs, assembled at build time by `fetch-content.ts` into
a single `public/data/quizzes.json` (array of nested `Quiz` objects), served via
`/api/quizzes` and consumed with the `useQuizzes()` / `useQuiz(id?)` composable.
The page renders the first active quiz; pass an id to `useQuiz` to target a specific one.

Only the quiz **UI chrome** stays in `copy.ts` (`quizPage.*`: headings, button
labels, loading/empty states). All editorial content (questions, options, result
bands, tips) is editable in Sheets without a developer.

### Sheets schema

**Tab: `quizzes`** (one row per quiz)
| Col | Field | Example |
|-----|-------|---------|
| A | id | `chronotype` |
| B | title | `Kas sa oled öökulli või lõoke?` |
| C | description | Intro paragraph |
| D | tipsHeading | `Nõuanded sinu kronotüübile` |
| E | sharePrefix | `Minu unetüüp:` |
| F | active | `TRUE` / `FALSE` |

**Tab: `quiz_questions`** (one row per question)
| Col | Field | Example |
|-----|-------|---------|
| A | quizId | `chronotype` |
| B | order | `1` |
| C | question | `Millal ärkad eelistatult…?` |
| D | options | `Enne kella 7\|3;Kella 7–9 vahel\|2;Pärast kella 9\|1` (`;` separates options, `\|` splits label\|value) |

**Tab: `quiz_results`** (one row per result band)
| Col | Field | Example |
|-----|-------|---------|
| A | quizId | `chronotype` |
| B | key | `lark` |
| C | minScore | `20` |
| D | maxScore | `24` |
| E | type | `Lõoke 🐦` |
| F | description | Result paragraph |
| G | tips | `Tip one.;Tip two.` (`;` separated) |

Result selection: bands are sorted highest-`minScore` first at build time; the
page picks the band where `minScore ≤ score ≤ maxScore`. If the quiz tabs are
absent, the build falls back to the committed `quizzes.example.json`.

**Calculator version** is likewise a single source of truth in the `stats` tab:
add a `calculatorVersion` row (value e.g. `v2.5`). `SleepCalculator.vue` reads it,
falling back to the `calculator.version` constant in `copy.ts` when absent.

**Planned additional quizzes** (just add rows to the three tabs):
1. "Mitu punkti saad oma une hügieenis?" — Sleep hygiene score
2. "Mis on sinu unepersoonalitsus?" — Sleep personality

Each quiz ends with personalized advice + soft link back to the Fit Calculator.

---

## GitHub Actions: Build & Deploy

```yaml
# .github/workflows/deploy.yml
name: Build & Deploy to GitHub Pages

on:
  push:
    branches: [main]
  schedule:
    - cron: '0 4 * * *'   # 06:00 EET daily
  workflow_dispatch:

permissions:
  contents: read
  pages: write
  id-token: write

concurrency:
  group: pages
  cancel-in-progress: false

jobs:
  build-and-deploy:
    runs-on: ubuntu-latest
    environment:
      name: github-pages
      url: ${{ steps.deployment.outputs.page_url }}

    steps:
      - uses: actions/checkout@v4

      - uses: actions/setup-node@v4
        with:
          node-version: '20'
          cache: 'npm'

      - run: npm ci

      - name: Fetch content from Google Sheets
        run: npm run fetch-content
        env:
          GOOGLE_SHEETS_API_KEY: ${{ secrets.GOOGLE_SHEETS_API_KEY }}
          SHEETS_ID: ${{ secrets.SHEETS_ID }}

      - name: Generate static site
        run: npm run generate
        env:
          NUXT_APP_BASE_URL: /       # change to /unevalem/ if no custom domain

      - uses: actions/configure-pages@v5

      - uses: actions/upload-pages-artifact@v3
        with:
          path: .output/public       # Nuxt static output directory

      - uses: actions/deploy-pages@v4
        id: deployment
```

**GitHub Secrets needed:**
- `GOOGLE_SHEETS_API_KEY`
- `SHEETS_ID`

GitHub Pages must be configured to use **GitHub Actions** as the source (not branch deploy).
Do this in: repo Settings → Pages → Source → "GitHub Actions".

---

## Environment Variables

```bash
# .env (local dev only — never commit)
GOOGLE_SHEETS_API_KEY=your_key_here
SHEETS_ID=your_google_sheet_id_here
NUXT_PUBLIC_SITE_URL=https://unevalem.ee
```

For local dev without Sheets credentials, the `fetch-content` script should detect missing
env vars and copy `*.example.json` → `*.json` automatically.

---

## Coding Standards

- **Always TypeScript** — no `.js` files
- **All Estonian copy** goes in `utils/copy.ts` — never hardcode strings in `.vue` files
- **Composables** for all shared state — no prop drilling
- **`public/data/*.json`** are the only data source at runtime — never call Sheets API from browser
- **Mobile-first** — design for 390px viewport first, then scale up
- **Accessibility** — keyboard-navigable calculator, min contrast 4.5:1, proper `aria-` labels on interactive elements
- **No Pinia needed yet** — `useCalculator()` composable with `ref`s is sufficient
- **No `any` types** — proper interfaces in `types/index.ts`
- **Auto-imports** are on (Nuxt default) — don't import `ref`, `computed`, `defineComponent` etc.

---

## Build Priority Order

Work through these in order. Do not skip ahead.

- [ ] 1. Nuxt scaffold + Tailwind + modules + fonts
- [ ] 2. Design tokens in `assets/css/main.css` + `tailwind.config.ts`
- [ ] 3. `types/index.ts` + `utils/copy.ts` skeleton (all Estonian strings + 30 daily tips)
- [ ] 4. **Fit Calculator** — `useCalculator` composable + all 5 steps + result screen (most important feature)
- [ ] 5. Landing page `pages/index.vue` — calculator as hero, stats line, post preview grid below
- [ ] 6. `scripts/fetch-content.ts` + example JSON files in `public/data/`
- [ ] 7. Blog listing `pages/artiklid/index.vue` + post page `pages/artiklid/[slug].vue`
- [ ] 8. `SocialProofToast.vue` component
- [ ] 9. GitHub Actions workflow `deploy.yml`
- [ ] 10. Quizzes page `pages/viktoriin/index.vue`
- [ ] 11. SEO: `useHead()` per page, OG tags, sitemap, robots.txt
- [ ] 12. Plausible analytics

---

## Open Questions

- Product catalog: will we host products on this site or always link externally? (For now: external links, placeholder `#`)
- Email newsletter: Brevo or MailerLite for sleep tips sign-up?
- Russian language version? (Large Estonian-Russian demographic — future consideration)
- Affiliate links on product recommendations?

---

*Update this file whenever a significant architectural decision is made.*

---

## UPDATES — Read these after everything above, they override earlier sections

### Backend: Apps Script (not Sheets API directly)

The Google Sheets content backend uses an **Apps Script Web App** as a proxy,
not the Sheets API v4 with an API key. The sheet is private; the script filters
and serves only publishable content.

Env var is a single URL:
```bash
SHEETS_API_URL=https://script.google.com/macros/s/AKfycbx6m86JxaQo3n9WGFJwk6bvkCDOw3bLxGK7b92xw7H2ijYDsGwIgYf5YPlKlL8k2sW72Q/exec
```

The fetch-content script calls three endpoints:
${SHEETS_API_URL}?sheet=posts

${SHEETS_API_URL}?sheet=notifications

${SHEETS_API_URL}?sheet=stats

Each returns a JSON array already filtered server-side (published posts only,
active notifications/stats only). The script should still type-check and
validate the response before writing to public/data/*.json.

No Google Cloud project, no API key, no OAuth. Just the URL.

### GitHub Actions Secret

Only one secret is needed:
- Name: `SHEETS_API_URL`
- Value: the Apps Script Web App URL

Remove any references to `GOOGLE_SHEETS_API_KEY` or `SHEETS_ID` from the
workflow file and fetch-content script.

### .env file
```bash
SHEETS_API_URL=https://script.google.com/macros/s/LONG_ID/exec
```

### dev without credentials
If `SHEETS_API_URL` is missing, copy `public/data/*.example.json` →
`public/data/*.json` and exit cleanly so `npm run dev` still works.
