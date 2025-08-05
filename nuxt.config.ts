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
  }
})
