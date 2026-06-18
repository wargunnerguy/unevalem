export default defineNuxtConfig({
  compatibilityDate: '2024-11-01',
  devtools: { enabled: true },

  modules: [
    '@nuxtjs/tailwindcss',
    '@nuxt/icon',
    '@nuxtjs/google-fonts',
    '@vueuse/nuxt',
  ],

  // DM Serif Display is a static (non-variable) font — can't use ital,wght axis syntax.
  // We load it via a direct link instead; disable download to avoid the bad URL.
  googleFonts: {
    families: {
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
        {
          rel: 'stylesheet',
          href: 'https://fonts.googleapis.com/css2?family=DM+Serif+Display:ital@0;1&family=Inter:wght@300;400;500;600&display=swap',
        },
        { rel: 'canonical', href: 'https://unevalem.ee' },
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
      siteUrl: process.env.NUXT_PUBLIC_SITE_URL ?? 'https://unevalem.ee',
    },
  },
})
