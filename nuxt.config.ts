export default defineNuxtConfig({
  compatibilityDate: '2026-06-05',
  devtools: { enabled: true },

  srcDir: 'app',

  modules: [
    '@nuxtjs/i18n',
    '@nuxtjs/color-mode',
    '@pinia/nuxt',
  ],

  app: {
    head: {
      title: 'findMe — Ton adresse. Ton identité.',
      meta: [
        { charset: 'utf-8' },
        { name: 'viewport', content: 'width=device-width, initial-scale=1' },
        { name: 'description', content: 'Crée ton adresse numérique officielle en quelques minutes.' },
        { name: 'theme-color', content: '#185FA5' },
        { property: 'og:title', content: 'findMe — Ton adresse. Ton identité.' },
        { property: 'og:type', content: 'website' },
      ],
      link: [
        { rel: 'preconnect', href: 'https://fonts.googleapis.com' },
        { rel: 'preconnect', href: 'https://fonts.gstatic.com', crossorigin: '' },
        { rel: 'stylesheet', href: 'https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;500;600;700;800&family=Inter:wght@300;400;500&display=swap' },
      ],
    },
  },

  css: ['~/assets/css/main.css', 'leaflet/dist/leaflet.css'],

  colorMode: {
    classSuffix: '',
    preference: 'light',
    fallback: 'light',
    storageKey: 'findme-color-mode',
  },

  i18n: {
    bundle: {
      optimizeTranslationDirective: false,
    },
    locales: [
      { code: 'fr', name: 'Français', file: 'fr.json' },
      { code: 'en', name: 'English', file: 'en.json' },
    ],
    defaultLocale: 'fr',
    langDir: 'locales/',
    strategy: 'no_prefix',
    detectBrowserLanguage: {
      useCookie: true,
      cookieKey: 'findme_locale',
      redirectOn: 'root',
      alwaysRedirect: false,
      fallbackLocale: 'fr',
    },
  },

  runtimeConfig: {
    resendApiKey: process.env.RESEND_API_KEY || '',
    public: {
      apiBase: process.env.NUXT_PUBLIC_API_BASE || '/api',
    },
  },

  nitro: {
    experimental: {
      openAPI: true,
    },
  },

  ssr: true,

  routeRules: {
    '/': { prerender: true },
    '/dashboard/**': { ssr: false },
    '/admin/**': { ssr: false },
    '/address/**': { ssr: false },
    '/support': { ssr: false },
    '/settings': { ssr: false },
    '/auth/**': { ssr: false },
  },
})
