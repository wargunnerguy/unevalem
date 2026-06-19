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
  for (const name of ['posts', 'notifications', 'stats', 'products']) {
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
  console.log(`[fetch-content] done (${ok}/4 example files copied)`)
  process.exit(0)
}

// ---------------------------------------------------------------------------
// Fetch one sheet endpoint
// ---------------------------------------------------------------------------
async function fetchSheet(sheet: string): Promise<unknown[]> {
  const url = `${BASE_URL}?sheet=${sheet}`
  let res: Response
  try {
    res = await fetch(url, { signal: AbortSignal.timeout(15_000) })
  } catch (err) {
    throw new Error(`Network error fetching "${sheet}": ${(err as Error).message}`)
  }
  if (!res.ok) {
    throw new Error(
      `HTTP ${res.status} fetching "${sheet}" — check SHEETS_API_URL and Apps Script deployment`,
    )
  }
  const body = (await res.json()) as unknown
  if (!Array.isArray(body)) {
    throw new Error(`Expected JSON array from "${sheet}", got ${typeof body}`)
  }
  return body
}

// ---------------------------------------------------------------------------
// Validation: ensure required fields are present on every row
// ---------------------------------------------------------------------------
function requireFields(sheet: string, rows: unknown[], fields: readonly string[]): void {
  for (let i = 0; i < rows.length; i++) {
    const row = rows[i] as Record<string, unknown>
    for (const field of fields) {
      if (!(field in row)) {
        throw new Error(`${sheet}[${i}] is missing required field "${field}"`)
      }
    }
  }
}

const REQUIRED: Record<string, readonly string[]> = {
  posts:         ['id', 'slug', 'title', 'excerpt', 'content', 'category', 'status'],
  notifications: ['id', 'text', 'type', 'hoursAgo', 'active'],
  stats:         ['key', 'value', 'displayText', 'active'],
  inventory:     ['id', 'name', 'category', 'price', 'active'],
}

// ---------------------------------------------------------------------------
// Main
// ---------------------------------------------------------------------------
async function main(): Promise<void> {
  console.log('[fetch-content] Fetching from Apps Script…')

  const [posts, notifications, stats, inventory] = await Promise.all([
    fetchSheet('posts'),
    fetchSheet('notifications'),
    fetchSheet('stats'),
    fetchSheet('inventory'),
  ])

  requireFields('posts',         posts,         REQUIRED.posts)
  requireFields('notifications', notifications, REQUIRED.notifications)
  requireFields('stats',         stats,         REQUIRED.stats)
  requireFields('inventory',     inventory,     REQUIRED.inventory)

  const transformedPosts    = (posts    as Record<string, unknown>[]).map(transformPost)
  const transformedProducts = (inventory as Record<string, unknown>[]).map(transformProduct)

  mkdirSync(DATA_DIR, { recursive: true })

  writeFileSync(join(DATA_DIR, 'posts.json'),         JSON.stringify(transformedPosts, null, 2), 'utf-8')
  writeFileSync(join(DATA_DIR, 'notifications.json'), JSON.stringify(notifications, null, 2), 'utf-8')
  writeFileSync(join(DATA_DIR, 'stats.json'),         JSON.stringify(stats, null, 2), 'utf-8')
  writeFileSync(join(DATA_DIR, 'products.json'),      JSON.stringify(transformedProducts, null, 2), 'utf-8')

  console.log(
    `[fetch-content] done — ${transformedPosts.length} posts · ` +
    `${notifications.length} notifications · ${stats.length} stats · ` +
    `${transformedProducts.length} products`,
  )
}

main().catch((err: Error) => {
  console.error('[fetch-content] FAILED:', err.message)
  process.exit(1)
})
