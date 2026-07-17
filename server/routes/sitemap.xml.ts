import { readFileSync, existsSync } from 'node:fs'
import { join } from 'node:path'
import type { Post } from '~/types'

const SITE = 'https://unevalem.ee'

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

  const allRoutes = [...staticRoutes, ...postRoutes]

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
