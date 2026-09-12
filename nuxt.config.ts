import { readFileSync, existsSync } from 'node:fs'
import { resolve } from 'node:path'

// Article routes must be listed explicitly: the blog listing paginates (PostGrid
// renders PAGE_SIZE at a time and appends on scroll), so crawlLinks alone only
// ever discovers the first page of posts and silently 404s the rest on a static
// host. Reads the file fetch-content.ts writes; empty until that has run.
function articleRoutes(): string[] {
  const path = resolve(__dirname, 'public/data/posts.json')
  if (!existsSync(path)) {
    console.warn('[nuxt.config] public/data/posts.json missing - article routes will rely on crawling')
    return []
  }
  try {
    const posts = JSON.parse(readFileSync(path, 'utf-8')) as { slug?: string }[]
    return posts
      .map(p => p.slug)
      .filter((s): s is string => !!s)
      .map(s => `/artiklid/${s}`)
  } catch (err) {
    console.warn('[nuxt.config] could not parse posts.json:', (err as Error).message)
    return []
  }
}

// Campaign landing pages are linked from ads, not from the site, so the link
// crawler can never discover them. Every active pain must be listed here or a
// paid click lands on a 404 - the most expensive possible failure mode.
function painRoutes(): string[] {
  const path = resolve(__dirname, 'public/data/pains.json')
  if (!existsSync(path)) {
    console.warn('[nuxt.config] public/data/pains.json missing - no campaign pages will be prerendered')
    return []
  }
  try {
    const pains = JSON.parse(readFileSync(path, 'utf-8')) as { slug?: string; active?: boolean }[]
    return pains
      .filter(p => p.active !== false)
      .map(p => p.slug)
      .filter((s): s is string => !!s)
      .map(s => `/probleem/${s}`)
  } catch (err) {
    console.warn('[nuxt.config] could not parse pains.json:', (err as Error).message)
    return []
  }
}

// Resolved once here so the head defaults, the runtimeConfig and the sitemap
// all agree. A review build sets NUXT_PUBLIC_SITE_URL to its own host (e.g.
// http://localhost:4000), which must not leak production URLs into og:image or
// JSON-LD - nor be mistaken for production when tagging sheet rows.
const SITE_URL = process.env.NUXT_PUBLIC_SITE_URL ?? 'https://unevalem.ee'

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
      'Plus Jakarta Sans': [400, 500, 600, 700, 800],
      'Inter': [300, 400, 500, 600],
    },
    display: 'swap',
    download: false,
  },

  // Use filename-only component names (no directory prefix) so <SleepCalculator>,
  // <PostCard>, <AppHeader> etc. work as the project spec intends.
  components: {
    dirs: [
      { path: '~/components', pathPrefix: false },
    ],
  },

  css: ['~/assets/css/main.css'],

  nitro: {
    preset: 'static',
    prerender: {
      crawlLinks: true,
      routes: ['/sitemap.xml', ...articleRoutes(), ...painRoutes()],
    },
  },

  app: {
    baseURL: process.env.NUXT_APP_BASE_URL ?? '/',
    head: {
      // Dark is the default theme: rendered into the static HTML so first
      // paint is dark with no flash; the inline script below strips it only
      // for visitors who explicitly chose light.
      htmlAttrs: { lang: 'et', class: 'dark' },
      // Default browser-tab title; every page overrides it via useHead. Guards
      // against an untitled route ever showing a stale/blank tab name.
      title: 'Unevalem',
      meta: [
        { name: 'viewport', content: 'width=device-width, initial-scale=1' },
        { property: 'og:site_name', content: 'Unevalem' },
        { property: 'og:type', content: 'website' },
        { property: 'og:locale', content: 'et_EE' },
        { name: 'twitter:card', content: 'summary_large_image' },
        // Site-wide fallback social image; article pages override via key.
        // Dimensions are declared so Facebook/LinkedIn render a large card on
        // first scrape instead of falling back to a thumbnail.
        { key: 'og-image', property: 'og:image', content: `${SITE_URL}/unevalem_logo.png` },
        { key: 'twitter-image', name: 'twitter:image', content: `${SITE_URL}/unevalem_logo.png` },
        { key: 'og-image-width', property: 'og:image:width', content: '1200' },
        { key: 'og-image-height', property: 'og:image:height', content: '630' },
        { key: 'og-image-alt', property: 'og:image:alt', content: 'Unevalem' },
      ],
      link: [
        { rel: 'preconnect', href: 'https://fonts.googleapis.com' },
        { rel: 'preconnect', href: 'https://fonts.gstatic.com', crossorigin: '' },
        // Canonical is set per-route in app.vue (a global one here would make every
        // page claim the homepage as canonical and suppress article indexing).
      ],
      script: [
        // Runs before paint: honour a stored explicit "light" choice.
        {
          innerHTML: ';(function(){try{if(localStorage.getItem("unevalem-theme")==="light")document.documentElement.classList.remove("dark")}catch(e){}})()',
        },
        {
          defer: true,
          // A review build must report to its own Plausible site (or none)
          // rather than inflating unevalem.ee's numbers with test traffic.
          'data-domain': process.env.NUXT_PUBLIC_PLAUSIBLE_DOMAIN ?? 'unevalem.ee',
          // tagged-events + outbound-links: outbound recommendation clicks land
          // in the cookieless tool, which reports regardless of ad consent.
          src: 'https://plausible.io/js/script.tagged-events.outbound-links.js',
        },
      ],
    },
  },

  runtimeConfig: {
    public: {
      siteUrl:      SITE_URL,
      // Exposed to browser for fire-and-forget analytics POST (no-cors, not a secret)
      sheetsApiUrl: process.env.SHEETS_API_URL ?? '',
      // Google Analytics 4 Measurement ID (public, not a secret). Loaded via
      // plugins/analytics.client.ts behind Consent Mode. Override with
      // NUXT_PUBLIC_GA_ID; set it empty in a local .env to disable GA in dev.
      gaId:         process.env.NUXT_PUBLIC_GA_ID ?? 'G-D921C30JEQ',
      // Meta Pixel id. Empty by default: the pixel plugin no-ops entirely
      // unless this is set AND the visitor granted advertising consent.
      metaPixelId:  process.env.NUXT_PUBLIC_META_PIXEL_ID ?? '',
    },
  },
})
