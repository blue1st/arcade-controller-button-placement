<template>
  <div class="is-flex is-flex-direction-column is-min-vh-100">
    <header class="hero is-primary">
      <div class="hero-body">
        <div class="container">
          <h1 class="title">{{ $t('header.main') }}</h1>
          <div class="buttons is-right">
            <button class="button is-small" @click="changeLang">
              {{ locale === 'ja' ? 'EN' : 'JP' }}
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
        <p>{{ $t('footer.copyright') }}</p>
        <p><a href="https://github.com/blue1st/arcade-controller-button-placement" target="_blank">{{ $t('footer.githubLink') }}</a></p>
      </div>
    </footer>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, nextTick } from 'vue'
import ButtonForm from '~/components/ButtonForm.vue'
import LayoutCanvas from '~/components/LayoutCanvas.vue'
import { buttonLayouts, getJsonFilePath } from '~/components/button-layouts.ts'
import { compressToBase64, decompressFromBase64 } from 'lz-string'
import type { Button, ControllerType } from '~/types/button-types.ts'

const selectedType = ref<ControllerType | null>(null)
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
        console.log(parsedButtons)
        if (Array.isArray(parsedButtons)) {
          buttons.value = parsedButtons
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

// 機種を選択
const selectType = (type: ControllerType) => {
  selectedType.value = type
  loadButtons(type)
}

// ボタンデータをロード
const loadButtons = async (type: ControllerType) => {
  try {
    const jsonFilePath = getJsonFilePath(type.id)
    if (!jsonFilePath) {
      console.error('JSONファイルパスが見つかりません:', type.id)
      return
    }
    
    let response
    response = await fetch(jsonFilePath)
    
    if (response && response.ok) {
      const data = await response.json()
      buttons.value = data.buttons || []
    }
    console.log("ボタンデータをロードに成功しました")
  } catch (error: any) {
    console.error('ボタンデータのロードに失敗しました:', error)
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
