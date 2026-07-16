import { readFileSync, writeFileSync, copyFileSync, mkdirSync, existsSync } from 'node:fs'
import { resolve, join } from 'node:path'

// ---------------------------------------------------------------------------
// Load .env for local dev (CI sets secrets directly as env vars, no file needed)
// ---------------------------------------------------------------------------
function loadEnv(): void {
  const path = resolve(process.cwd(), '.env')
  if (!existsSync(path)) return
  try {
    const content = readFileSync(path, 'utf-8')
    for (const line of content.split('\n')) {
      const trimmed = line.trim()
      if (!trimmed || trimmed.startsWith('#')) continue
      const eq = trimmed.indexOf('=')
      if (eq < 0) continue
      const key = trimmed.slice(0, eq).trim()
      const raw = trimmed.slice(eq + 1).trim().replace(/^["']|["']$/g, '')
      if (key && !(key in process.env)) process.env[key] = raw
    }
  } catch {
    // silently ignore malformed .env
  }
}

loadEnv()

// ---------------------------------------------------------------------------
// Config
// ---------------------------------------------------------------------------
const DATA_DIR = resolve(process.cwd(), 'public/data')
const BASE_URL = process.env.SHEETS_API_URL?.trim()

// ---------------------------------------------------------------------------
// Transformations (handle both raw Sheets strings and already-parsed values)
// ---------------------------------------------------------------------------

function parseBool(v: unknown): boolean {
  if (typeof v === 'boolean') return v
  if (typeof v === 'string') return v.toUpperCase() === 'TRUE' || v === '1'
  return !!v
}

function parseTags(v: unknown): string[] {
  if (Array.isArray(v)) return v.map(String)
  if (typeof v === 'string') return v.split(',').map(s => s.trim()).filter(Boolean)
  return []
}

// Accepts "Title|URL;Title|URL" and, for rows that carry only a bare link,
// "URL;URL" — falling back to the hostname as the label so a source without an
// editorial title still renders instead of vanishing.
function parseDiveDeeper(v: unknown): { title: string; url: string }[] {
  if (!v || typeof v !== 'string' || !v.trim()) return []
  return v
    .split(';')
    .map(s => s.trim())
    .filter(Boolean)
    .map(item => {
      const [first, second] = item.split('|').map(s => s.trim())
      if (second) return { title: first ?? '', url: second }
      const url = first ?? ''
      if (!/^https?:\/\//i.test(url)) return { title: '', url: '' }
      let title = url
      try { title = new URL(url).hostname.replace(/^www\./, '') } catch {}
      return { title, url }
    })
    .filter(item => item.title && item.url)
}

// Quiz option encoding: "Label A|3;Label B|2;Label C|1"  (";" separates options, "|" splits label/value)
function parseQuizOptions(v: unknown): { label: string; value: number }[] {
  if (!v || typeof v !== 'string') return []
  return v
    .split(';')
    .map(s => s.trim())
    .filter(Boolean)
    .map(item => {
      const [label, value] = item.split('|').map(s => s.trim())
      return { label: label ?? '', value: Number(value ?? 0) }
    })
    .filter(o => o.label)
}

// Tips encoding: "Tip one.;Tip two."  (";" separates tips)
function parseTipsList(v: unknown): string[] {
  if (Array.isArray(v)) return v.map(String)
  if (typeof v !== 'string') return []
  return v.split(';').map(s => s.trim()).filter(Boolean)
}

// Join the three flat quiz tabs into ready-to-render nested Quiz objects
function assembleQuizzes(
  meta: Record<string, unknown>[],
  questions: Record<string, unknown>[],
  results: Record<string, unknown>[],
): Record<string, unknown>[] {
  return meta
    .filter(m => parseBool(m.active))
    .map(m => {
      const id = String(m.id ?? '')
      const qs = questions
        .filter(q => String(q.quizId ?? '') === id)
        .sort((a, b) => Number(a.order ?? 0) - Number(b.order ?? 0))
        .map(q => ({ question: String(q.question ?? ''), options: parseQuizOptions(q.options) }))
      const rs = results
        .filter(r => String(r.quizId ?? '') === id)
        .map(r => ({
          key:         String(r.key ?? ''),
          minScore:    Number(r.minScore ?? 0),
          maxScore:    Number(r.maxScore ?? 0),
          type:        String(r.type ?? ''),
          description: String(r.description ?? ''),
          tips:        parseTipsList(r.tips),
        }))
        .sort((a, b) => b.minScore - a.minScore)  // highest band first for lookup
      if (!qs.length)  console.warn(`  ⚠ quiz "${id}" has no questions`)
      if (!rs.length)  console.warn(`  ⚠ quiz "${id}" has no results`)
      return {
        id,
        title:       String(m.title ?? ''),
        description: String(m.description ?? ''),
        tipsHeading: String(m.tipsHeading ?? 'Nõuanded sulle'),
        sharePrefix: String(m.sharePrefix ?? ''),
        questions:   qs,
        results:     rs,
      }
    })
}

function transformPost(row: Record<string, unknown>): Record<string, unknown> {
  return {
    ...row,
    tags:       parseTags(row.tags),
    isFeatured: parseBool(row.isFeatured),
    diveDeeper: parseDiveDeeper(row.diveDeeper),
  }
}

function transformProduct(row: Record<string, unknown>): Record<string, unknown> {
  return {
    ...row,
    tags:       parseTags(row.tags),
    active:     parseBool(row.active),
    isFeatured: parseBool(row.isFeatured),
  }
}

// ---------------------------------------------------------------------------
// Fallback: no credentials → copy example files and exit cleanly
// ---------------------------------------------------------------------------
if (!BASE_URL) {
  console.warn('[fetch-content] SHEETS_API_URL not set — falling back to example data')
  mkdirSync(DATA_DIR, { recursive: true })
  let ok = 0
  for (const name of ['posts', 'stats', 'products', 'tips', 'quizzes']) {
    const src = join(DATA_DIR, `${name}.example.json`)
    const dst = join(DATA_DIR, `${name}.json`)
    if (existsSync(src)) {
      copyFileSync(src, dst)
      console.log(`  copied ${name}.example.json → ${name}.json`)
      ok++
    } else {
      console.warn(`  missing ${name}.example.json — skipping`)
    }
  }
  // notifications: plain copy (no time field — the toast fabricates a fresh
  // "X ago" at render time, so there's nothing to convert)
  const notifSrc = join(DATA_DIR, 'notifications.example.json')
  const notifDst = join(DATA_DIR, 'notifications.json')
  if (existsSync(notifSrc)) {
    copyFileSync(notifSrc, notifDst)
    console.log('  copied notifications.example.json → notifications.json')
    ok++
  } else {
    console.warn('  missing notifications.example.json — skipping')
  }
  console.log(`[fetch-content] done (${ok}/6 example files processed)`)
  process.exit(0)
}

// ---------------------------------------------------------------------------
// Fetch one sheet — returns null if the sheet doesn't exist or returns non-array
// ---------------------------------------------------------------------------
async function tryFetchSheet(sheet: string): Promise<unknown[] | null> {
  const url = `${BASE_URL}?sheet=${sheet}`
  try {
    const res = await fetch(url, { signal: AbortSignal.timeout(15_000) })
    if (!res.ok) return null
    const body = (await res.json()) as unknown
    return Array.isArray(body) ? body : null
  } catch {
    return null
  }
}

// Fetch with per-sheet fallback to example file
async function fetchSheet(sheet: string, outputName: string): Promise<unknown[]> {
  const data = await tryFetchSheet(sheet)
  if (data !== null) {
    console.log(`  ✓ ${sheet} (${data.length} rows)`)
    return data
  }
  const examplePath = join(DATA_DIR, `${outputName}.example.json`)
  if (existsSync(examplePath)) {
    console.warn(`  ⚠ sheet "${sheet}" not available — using ${outputName}.example.json`)
    return JSON.parse(readFileSync(examplePath, 'utf-8')) as unknown[]
  }
  console.warn(`  ⚠ sheet "${sheet}" not available and no example file — skipping`)
  return []
}

// Quizzes live across three tabs and are assembled into nested objects here.
// Falls back to the (already assembled) quizzes.example.json if the tabs are absent.
async function fetchQuizzes(): Promise<unknown[]> {
  const [meta, questions, results] = await Promise.all([
    tryFetchSheet('quizzes'),
    tryFetchSheet('quiz_questions'),
    tryFetchSheet('quiz_results'),
  ])
  if (meta && questions && results) {
    const assembled = assembleQuizzes(
      meta      as Record<string, unknown>[],
      questions as Record<string, unknown>[],
      results   as Record<string, unknown>[],
    )
    console.log(`  ✓ quizzes (${assembled.length} assembled from ${meta.length} meta rows)`)
    return assembled
  }
  const examplePath = join(DATA_DIR, 'quizzes.example.json')
  if (existsSync(examplePath)) {
    console.warn('  ⚠ quiz tabs not available — using quizzes.example.json')
    return JSON.parse(readFileSync(examplePath, 'utf-8')) as unknown[]
  }
  console.warn('  ⚠ quiz tabs not available and no example file — skipping')
  return []
}

// ---------------------------------------------------------------------------
// Validation: warn (don't throw) if required fields are missing
// ---------------------------------------------------------------------------
function validateFields(sheet: string, rows: unknown[], fields: readonly string[]): void {
  for (let i = 0; i < rows.length; i++) {
    const row = rows[i] as Record<string, unknown>
    for (const field of fields) {
      if (!(field in row)) {
        console.warn(`  ⚠ ${sheet}[${i}] missing field "${field}" — row skipped`)
      }
    }
  }
}

const REQUIRED: Record<string, readonly string[]> = {
  posts:         ['id', 'slug', 'title', 'excerpt', 'content', 'category', 'status'],
  notifications: ['id', 'text', 'type', 'active'],
  stats:         ['key', 'value', 'displayText', 'active'],
  inventory:     ['id', 'name', 'category', 'price', 'active'],
  tips:          ['id', 'text', 'active'],
}

// ---------------------------------------------------------------------------
// Main
// ---------------------------------------------------------------------------
async function main(): Promise<void> {
  console.log('[fetch-content] Fetching from Apps Script…')
  mkdirSync(DATA_DIR, { recursive: true })

  const [posts, notifications, stats, inventory, tipsRaw, quizzes, postStats] = await Promise.all([
    fetchSheet('posts',         'posts'),
    fetchSheet('notifications', 'notifications'),
    fetchSheet('stats',         'stats'),
    fetchSheet('inventory',     'products'),
    fetchSheet('tips',          'tips'),
    fetchQuizzes(),
    tryFetchSheet('post_stats'),   // best-effort; absent until the sheet exists
  ])

  validateFields('posts',         posts,         REQUIRED.posts)
  validateFields('notifications', notifications, REQUIRED.notifications)
  validateFields('stats',         stats,         REQUIRED.stats)
  validateFields('inventory',     inventory,     REQUIRED.inventory)
  validateFields('tips',          tipsRaw,       REQUIRED.tips)

  // Build a slug → view-count map from the post_stats sheet (columns: slug, views)
  const viewsBySlug = new Map<string, number>()
  for (const row of (postStats ?? []) as Record<string, unknown>[]) {
    const slug = String(row.slug ?? '').trim()
    if (slug) viewsBySlug.set(slug, Number(row.views ?? 0) || 0)
  }

  // Human-review gate: AI-drafted articles must be read and corrected by a
  // person before going live. The posts tab's `proofread` column marks that —
  // any non-empty value except FALSE counts as approved, so a checkbox (TRUE),
  // initials ("RV") or a date all work. The gate only arms once the column
  // exists in the sheet; until then it warns, so deploying this code before
  // the sheet has the column can't silently empty the whole site.
  const postRows = posts as Record<string, unknown>[]
  const hasProofreadColumn = postRows.some(r => 'proofread' in r)
  if (!hasProofreadColumn && postRows.length) {
    console.warn('  ⚠ posts sheet has no "proofread" column — human-review gate INACTIVE, all published posts go live')
  }
  const isProofread = (row: Record<string, unknown>): boolean => {
    if (!hasProofreadColumn) return true
    const v = String(row.proofread ?? '').trim()
    return v !== '' && v.toUpperCase() !== 'FALSE'
  }

  // Drop drafts here rather than trusting the Apps Script to do it: posts.json is
  // the single artifact the /api/posts route, sitemap.xml and the prerenderer all
  // read, so an unpublished row that survives this line becomes a public page.
  const publishedPosts = postRows.filter(row => {
    const slug = String(row.slug ?? '?')
    const status = String(row.status ?? '').trim().toLowerCase()
    if (status !== 'published') {
      console.log(`  · skipping non-published post "${slug}" (status: ${status || 'empty'})`)
      return false
    }
    if (!isProofread(row)) {
      console.log(`  · skipping post "${slug}" — not proofread by a human yet`)
      return false
    }
    return true
  })

  const transformedPosts = publishedPosts.map(row => {
    const post = transformPost(row)
    post.popularity = viewsBySlug.get(String(row.slug ?? '')) ?? 0
    return post
  })
  const transformedProducts = (inventory as Record<string, unknown>[]).map(transformProduct)
  const tips = (tipsRaw as Record<string, unknown>[]).filter(r => parseBool(r.active))

  writeFileSync(join(DATA_DIR, 'posts.json'),         JSON.stringify(transformedPosts, null, 2), 'utf-8')
  writeFileSync(join(DATA_DIR, 'notifications.json'), JSON.stringify(notifications, null, 2), 'utf-8')
  writeFileSync(join(DATA_DIR, 'stats.json'),         JSON.stringify(stats, null, 2), 'utf-8')
  writeFileSync(join(DATA_DIR, 'products.json'),      JSON.stringify(transformedProducts, null, 2), 'utf-8')
  writeFileSync(join(DATA_DIR, 'tips.json'),          JSON.stringify(tips, null, 2), 'utf-8')
  writeFileSync(join(DATA_DIR, 'quizzes.json'),       JSON.stringify(quizzes, null, 2), 'utf-8')

  console.log(
    `[fetch-content] done — ${transformedPosts.length} posts · ` +
    `${notifications.length} notifications · ${stats.length} stats · ` +
    `${transformedProducts.length} products · ${tips.length} tips · ` +
    `${quizzes.length} quizzes`,
  )
}

main().catch((err: Error) => {
  console.error('[fetch-content] FAILED:', err.message)
  process.exit(1)
})
