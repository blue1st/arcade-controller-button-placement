export default defineNuxtConfig({
  compatibilityDate: '2025-08-05',
  css: ["bulma/css/bulma.min.css"],
  app: {
    head: {
      title: 'Arcade Controller Button Placement',
      meta: [
        { charset: 'utf-8' },
        { name: 'viewport', content: 'width=device-width, initial-scale=1' }
      ],
    },
    cdnURL: '/arcade-controller-button-placement/'
  },
  i18n: {
    locales: [
      { code: 'en', name: 'English', iso: 'en-US', file: 'en.json' },
      { code: 'ja', name: '日本語', iso: 'ja-JP', file: 'ja.json' }
    ],
    defaultLocale: 'ja',
    strategy: 'prefix_except_default',
    langDir: 'locales',
    detectBrowserLanguage: {
      useCookie: true,
      cookieKey: 'i18n_redirected',
      fallbackLocale: 'ja'
    }
  },
  modules: [
    '@nuxtjs/i18n'
  ]
})
