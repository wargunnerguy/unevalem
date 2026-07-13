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
      routes: ['/sitemap.xml'],
    },
  },

  app: {
    baseURL: process.env.NUXT_APP_BASE_URL ?? '/',
    head: {
      htmlAttrs: { lang: 'et' },
      // Default browser-tab title; every page overrides it via useHead. Guards
      // against an untitled route ever showing a stale/blank tab name.
      title: 'Unevalem',
      meta: [
        { name: 'viewport', content: 'width=device-width, initial-scale=1' },
        { property: 'og:site_name', content: 'Unevalem' },
        { property: 'og:type', content: 'website' },
        { property: 'og:locale', content: 'et_EE' },
        { name: 'twitter:card', content: 'summary_large_image' },
      ],
      link: [
        { rel: 'preconnect', href: 'https://fonts.googleapis.com' },
        { rel: 'preconnect', href: 'https://fonts.gstatic.com', crossorigin: '' },
        // Canonical is set per-route in app.vue (a global one here would make every
        // page claim the homepage as canonical and suppress article indexing).
      ],
      script: [
        {
          defer: true,
          'data-domain': 'unevalem.ee',
          src: 'https://plausible.io/js/script.js',
        },
      ],
    },
  },

  runtimeConfig: {
    public: {
      siteUrl:      process.env.NUXT_PUBLIC_SITE_URL ?? 'https://unevalem.ee',
      // Exposed to browser for fire-and-forget analytics POST (no-cors, not a secret)
      sheetsApiUrl: process.env.SHEETS_API_URL ?? '',
      // Google Analytics 4 Measurement ID (public, not a secret). Loaded via
      // plugins/analytics.client.ts behind Consent Mode. Override with
      // NUXT_PUBLIC_GA_ID; set it empty in a local .env to disable GA in dev.
      gaId:         process.env.NUXT_PUBLIC_GA_ID ?? 'G-D921C30JEQ',
    },
  },
})
