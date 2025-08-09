export default defineNuxtConfig({
  compatibilityDate: '2025-08-05',
  css: ["bulma/css/bulma.min.css"],
  app: {
    head: {
      title: 'Arcade Controller Button Placement',
      meta: [
        { charset: 'utf-8' },
        { name: 'viewport', content: 'width=device-width, initial-scale=1' },
        { property: 'og:title', content: 'Arcade Controller Button Placement' },
        { property: 'og:description', content: 'アケコンボタン配置図作成ツール' },
        { property: 'og:type', content: 'website' },
        { property: 'og:url', content: 'https://blue1st.github.io/arcade-controller-button-placement/' },
        { property: 'og:image', content: 'https://blue1st.github.io/arcade-controller-button-placement/preview.png' },
        { property: 'og:site_name', content: 'Arcade Controller Button Placement' },
        { property: 'og:locale', content: 'ja_JP' },
        { name: 'twitter:card', content: 'summary_large_image' },
        { name: 'twitter:title', content: 'Arcade Controller Button Placement' },
        { name: 'twitter:description', content: 'アケコンボタン配置図作成ツール' },
        { name: 'twitter:image', content: 'https://blue1st.github.io/arcade-controller-button-placement/preview.png' }
      ],
      link: [
        {
          rel: 'stylesheet',
          href: 'https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.4.0/css/all.min.css'
        }
      ]
    },
    cdnURL: '/arcade-controller-button-placement/',
    baseURL: '/arcade-controller-button-placement/'
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
