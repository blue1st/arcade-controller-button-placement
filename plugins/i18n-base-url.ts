export default defineNuxtPlugin((nuxtApp) => {
  // GitHub PagesのベースURLを設定
  const baseURL = '/arcade-controller-button-placement/'
  
  // i18nのbaseURLを設定
  if (nuxtApp.$i18n) {
    nuxtApp.$i18n.baseUrl = baseURL
  }
})
