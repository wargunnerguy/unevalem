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

function parseDiveDeeper(v: unknown): { title: string; url: string }[] {
  if (!v || typeof v !== 'string' || !v.trim()) return []
  return v
    .split(';')
    .map(s => s.trim())
    .filter(Boolean)
    .map(item => {
      const [title, url] = item.split('|').map(s => s.trim())
      return { title: title ?? '', url: url ?? '' }
    })
    .filter(item => item.title && item.url)
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
  for (const name of ['posts', 'stats', 'products', 'tips']) {
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
  // notifications: convert hoursAgo offsets to real ISO timestamps so the
  // browser can compute "X hours ago" accurately even from example data
  const notifSrc = join(DATA_DIR, 'notifications.example.json')
  const notifDst = join(DATA_DIR, 'notifications.json')
  if (existsSync(notifSrc)) {
    const now = Date.now()
    const rows = JSON.parse(readFileSync(notifSrc, 'utf-8')) as Record<string, unknown>[]
    const converted = rows.map(r => {
      const { hoursAgo, ...rest } = r as Record<string, unknown> & { hoursAgo?: number }
      return {
        ...rest,
        timestamp: new Date(now - (hoursAgo ?? 0) * 3_600_000).toISOString(),
      }
    })
    writeFileSync(notifDst, JSON.stringify(converted, null, 2), 'utf-8')
    console.log(`  converted notifications.example.json → notifications.json (${converted.length} rows)`)
    ok++
  } else {
    console.warn('  missing notifications.example.json — skipping')
  }
  console.log(`[fetch-content] done (${ok}/5 example files processed)`)
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
  notifications: ['id', 'text', 'type', 'timestamp', 'active'],
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

  const [posts, notifications, stats, inventory, tipsRaw] = await Promise.all([
    fetchSheet('posts',         'posts'),
    fetchSheet('notifications', 'notifications'),
    fetchSheet('stats',         'stats'),
    fetchSheet('inventory',     'products'),
    fetchSheet('tips',          'tips'),
  ])

  validateFields('posts',         posts,         REQUIRED.posts)
  validateFields('notifications', notifications, REQUIRED.notifications)
  validateFields('stats',         stats,         REQUIRED.stats)
  validateFields('inventory',     inventory,     REQUIRED.inventory)
  validateFields('tips',          tipsRaw,       REQUIRED.tips)

  const transformedPosts    = (posts     as Record<string, unknown>[]).map(transformPost)
  const transformedProducts = (inventory as Record<string, unknown>[]).map(transformProduct)
  const tips = (tipsRaw as Record<string, unknown>[]).filter(r => parseBool(r.active))

  writeFileSync(join(DATA_DIR, 'posts.json'),         JSON.stringify(transformedPosts, null, 2), 'utf-8')
  writeFileSync(join(DATA_DIR, 'notifications.json'), JSON.stringify(notifications, null, 2), 'utf-8')
  writeFileSync(join(DATA_DIR, 'stats.json'),         JSON.stringify(stats, null, 2), 'utf-8')
  writeFileSync(join(DATA_DIR, 'products.json'),      JSON.stringify(transformedProducts, null, 2), 'utf-8')
  writeFileSync(join(DATA_DIR, 'tips.json'),          JSON.stringify(tips, null, 2), 'utf-8')

  console.log(
    `[fetch-content] done — ${transformedPosts.length} posts · ` +
    `${notifications.length} notifications · ${stats.length} stats · ` +
    `${transformedProducts.length} products · ${tips.length} tips`,
  )
}

main().catch((err: Error) => {
  console.error('[fetch-content] FAILED:', err.message)
  process.exit(1)
})
