import { readFileSync, existsSync } from 'node:fs'
import { join } from 'node:path'
import type { Post, PainPage } from '~/types'

// Baked in at prerender time from the same env var nuxt.config reads, so a
// review build publishes a sitemap of its own URLs rather than advertising
// production links from a host that is not unevalem.ee.
const SITE = process.env.NUXT_PUBLIC_SITE_URL ?? 'https://unevalem.ee'

export default defineEventHandler((event) => {
  setHeader(event, 'content-type', 'application/xml; charset=utf-8')

  const postsPath = join(process.cwd(), 'public/data/posts.json')
  let posts: Post[] = []
  if (existsSync(postsPath)) {
    try { posts = JSON.parse(readFileSync(postsPath, 'utf-8')) as Post[] } catch {}
  }

  const staticRoutes = [
    { loc: '/',                 priority: '1.0', changefreq: 'daily' },
    { loc: '/artiklid',         priority: '0.9', changefreq: 'daily' },
    { loc: '/unetest',          priority: '0.7', changefreq: 'monthly' },
    { loc: '/pood',             priority: '0.8', changefreq: 'weekly' },
    { loc: '/meist',            priority: '0.4', changefreq: 'monthly' },
    { loc: '/muugitingimused',  priority: '0.3', changefreq: 'monthly' },
    { loc: '/privaatsus',       priority: '0.3', changefreq: 'monthly' },
  ]

  const postRoutes = posts.map(p => ({
    loc: `/artiklid/${p.slug}`,
    priority: '0.8',
    changefreq: 'weekly',
    lastmod: p.publishDate,
  }))

  // Campaign pages. A page flagged noindex is still prerendered (the ad has to
  // land somewhere) but must not be advertised to search engines.
  const painsPath = join(process.cwd(), 'public/data/pains.json')
  let pains: PainPage[] = []
  if (existsSync(painsPath)) {
    try { pains = JSON.parse(readFileSync(painsPath, 'utf-8')) as PainPage[] } catch {}
  }
  const painRoutes = pains
    .filter(p => p.active && !p.noindex && p.slug)
    .map(p => ({
      loc: `/probleem/${p.slug}`,
      priority: '0.7',
      changefreq: 'monthly',
    }))

  const allRoutes = [...staticRoutes, ...postRoutes, ...painRoutes]

  const urls = allRoutes.map(r => `
  <url>
    <loc>${SITE}${r.loc}</loc>
    <changefreq>${r.changefreq}</changefreq>
    <priority>${r.priority}</priority>${'lastmod' in r && r.lastmod ? `\n    <lastmod>${r.lastmod}</lastmod>` : ''}
  </url>`).join('')

  return `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">${urls}
</urlset>`
})
