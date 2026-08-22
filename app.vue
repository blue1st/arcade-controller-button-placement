<template>
  <div class="is-flex is-flex-direction-column is-min-vh-100">
    <header class="hero is-primary">
      <div class="hero-body">
        <div class="container level">
          <div class="level-left">
            <h1 class="title level-item">{{ $t('header.main') }}</h1>
          </div>
          <div class="buttons is-right level-item">
            <a class="button is-medium" href="https://github.com/blue1st/arcade-controller-button-placement/wiki/" target="_blank">
              {{ $t('header.buttonLayoutsLink') }}
            </a>
            <button class="button is-medium" @click="changeLang">
              <span class="icon is-medium">
                <i class="fas fa-language"></i>
              </span>
              <span>{{ locale === 'ja' ? 'EN' : 'JP' }}</span>
            </button>
          </div>
        </div>
      </div>
    </header>
    
    <main class="section">
      <div class="container">
        <!-- メイン画面 -->
        <div class="columns">
          <div class="column is-8">
            <LayoutCanvas :buttons="buttons" />
          </div>
          <div class="column is-4">
            <ButtonForm @update="updateButtons" :buttons="buttons" />
          </div>
        </div>
      </div>
    </main>

    <footer class="footer">
      <div class="content has-text-centered">
        <p><a href="https://github.com/blue1st/arcade-controller-button-placement/wiki/" target="_blank">{{ $t('footer.proLayoutsLink') }}</a></p>
        <p><a href="https://github.com/blue1st/arcade-controller-button-placement" target="_blank"><span class="icon is-small"><i class="fab fa-github"></i></span> {{ $t('footer.githubLink') }}</a></p>
        <p>{{ $t('footer.copyright') }}</p>
      </div>
    </footer>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import ButtonForm from '~/components/ButtonForm.vue'
import LayoutCanvas from '~/components/LayoutCanvas.vue'
import { buttonLayouts } from '~/components/button-layouts.ts'
import { decompressFromBase64 } from 'lz-string'
import type { Button } from '~/types/button-types.ts'

const buttons = ref<Button[]>([])
const { setLocale, locale } = useI18n()

// URLパラメータからボタン設定を読み込む
const loadFromUrlParams = () => {
  const urlParams = new URLSearchParams(window.location.search)
  const dataParam = urlParams.get('data')

  if (dataParam) {
    try {
      // LZStringでデータをデコード
      const decompressed = decompressFromBase64(dataParam)

      if (decompressed) {
        const parsedButtons = JSON.parse(decompressed)
        if (Array.isArray(parsedButtons)) {
          // idを振り直す
          buttons.value = parsedButtons.map((button: any, index: number) => ({
            ...button,
            id: index + 1
          }))
        }
      }
    } catch (error: any) {
      console.error('URLパラメータの解析に失敗しました:', error)
    }
  }

  if (buttons.value.length === 0) {
    loadInitialButtons()
  }
}

const updateButtons = (newButtons: Button[]) => {
  buttons.value = newButtons
}

// 初期ボタン設定をロードする処理
const loadInitialButtons = () => {
  if (buttons.value.length === 0) {
    // デフォルトのボタン設定をロード
    const defaultLayout = buttonLayouts.find(layout => layout.name === 'default')
    if (defaultLayout) {
      fetch(defaultLayout.jsonFile)
        .then(response => response.json())
        .then(data => {
          buttons.value = data || []
        })
        .catch(error => {
          console.error('デフォルトボタン設定のロードに失敗しました:', error)
        })
    }
  }
}

const changeLang = () => {
  if (locale.value === "en") {
    setLocale("ja")
  }
  else {
    setLocale("en")
  }
}

// URLパラメータがある場合は初期ロードをスキップ
onMounted(() => {
  loadFromUrlParams()
})

</script>

<style>
body {
  background-color: #f8f9fa;
}
</style>
