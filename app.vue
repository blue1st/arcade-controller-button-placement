<template>
  <div class="is-flex is-flex-direction-column is-min-vh-100">
    <header class="hero is-dark">
      <div class="hero-body py-4">
        <div class="container level">
          <div class="level-left">
            <div>
              <h1 class="title level-item has-text-white mb-1">{{ $t('header.main') }}</h1>
              <span v-if="isDebug" class="tag is-success is-light is-rounded">
                <i class="fas fa-robot mr-1"></i> {{ $t('webmcp.badge') }}
              </span>
            </div>
          </div>
          <div class="buttons is-right level-item">
            <button v-if="isDebug" class="button is-medium is-emerald-badge mr-2" @click="isInspectorOpen = true">
              <span class="icon"><i class="fas fa-robot"></i></span>
              <span>{{ $t('webmcp.openInspector') }}</span>
            </button>
            <a class="button is-medium is-white" href="https://github.com/blue1st/arcade-controller-button-placement/wiki/" target="_blank">
              {{ $t('header.buttonLayoutsLink') }}
            </a>
            <button class="button is-medium is-white" @click="changeLang">
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
        <LayoutCanvas :buttons="buttons" @update="updateButtons" @loadLayout="loadLayout" />
      </div>
    </main>

    <!-- WebMCP インスペクター & ガイドモーダル ＆ フローティングウィジェット -->
    <WebMCPInspector 
      :isOpen="isInspectorOpen" 
      :tools="registeredTools" 
      @close="isInspectorOpen = false" 
    />
    <WebMCPGuideModal 
      :isOpen="isGuideOpen" 
      @close="isGuideOpen = false" 
    />
    <WebMCPWidget
      v-if="isDebug"
      :tools="registeredTools"
      @openInspector="isInspectorOpen = true"
      @openGuide="isGuideOpen = true"
    />

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
import LayoutCanvas from '~/components/LayoutCanvas.vue'
import WebMCPInspector from '~/components/WebMCPInspector.vue'
import WebMCPGuideModal from '~/components/WebMCPGuideModal.vue'
import WebMCPWidget from '~/components/WebMCPWidget.vue'
import { buttonLayouts } from '~/components/button-layouts.ts'
import LZString from 'lz-string'
import type { Button } from '~/types/button-types.ts'
import { useWebMCP, type WebMCPTool } from '~/composables/useWebMCP'

const buttons = ref<Button[]>([])
const { setLocale, locale } = useI18n()

const isDebug = ref(false)
const isInspectorOpen = ref(false)
const isGuideOpen = ref(false)
const registeredTools = ref<WebMCPTool[]>([])

const webmcp = useWebMCP()
const nuxtApp = useNuxtApp()

// URLパラメータからボタン設定を読み込む
const loadFromUrlParams = () => {
  const urlParams = new URLSearchParams(window.location.search)
  const dataParam = urlParams.get('data')

  if (dataParam) {
    try {
      // LZStringでデータをデコード
      const decompressed = LZString.decompressFromBase64(dataParam)

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

const loadLayout = async (layoutName: string) => {
  const layout = buttonLayouts.find(l => l.name === layoutName)
  if (!layout) return
  try {
    const response = await fetch(layout.jsonFile)
    const data = await response.json()
    buttons.value = data || []
  } catch (error) {
    console.error('Failed to load layout:', error)
  }
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

// WebMCP ツールの初期化と登録
const initWebMCP = () => {
  const tools = webmcp.createTools(
    () => buttons.value,
    (newButtons) => { buttons.value = newButtons },
    loadLayout
  )
  registeredTools.value = tools
  if (nuxtApp.$webmcp && typeof nuxtApp.$webmcp.registerTools === 'function') {
    nuxtApp.$webmcp.registerTools(tools)
  }
}

// URLパラメータがある場合は初期ロードをスキップ
onMounted(() => {
  const urlParams = new URLSearchParams(window.location.search)
  isDebug.value = urlParams.get('debug') === 'true' || urlParams.get('debug') === '1' || urlParams.has('debug')

  loadFromUrlParams()
  initWebMCP()

  if (typeof window !== 'undefined' && (window as any).WebMCP) {
    ;(window as any).WebMCP.openInspector = () => {
      isInspectorOpen.value = true
    }
    ;(window as any).WebMCP.openDebugger = () => {
      isInspectorOpen.value = true
    }
  }
})

</script>

<style>
body {
  background-color: #1a1a2e;
  color: #eee;
}

.card {
  background-color: #16213e;
  border: 1px solid #0f3460;
  border-radius: 12px;
}

.card-content {
  background-color: transparent;
}

.button.is-primary {
  background-color: #e94560;
  border-color: #e94560;
}

.button.is-primary:hover {
  background-color: #d63851;
}

.button.is-success {
  background-color: #4ecca3;
  border-color: #4ecca3;
}

.button.is-success:hover {
  background-color: #3db892;
}

.button.is-info {
  background-color: #533483;
  border-color: #533483;
}

.button.is-info:hover {
  background-color: #452a6e;
}

.button.is-secondary {
  background-color: #0f3460;
  border-color: #0f3460;
}

.button.is-secondary:hover {
  background-color: #1a4a7a;
}

.button.is-warning {
  background-color: #f39c12;
  border-color: #f39c12;
  color: #1a1a2e;
}

.button.is-warning:hover {
  background-color: #e08e0b;
}

.button.is-danger {
  background-color: #e94560;
  border-color: #e94560;
}

.button.is-danger:hover {
  background-color: #d63851;
}

.input, .select select {
  background-color: #1a1a2e;
  border-color: #0f3460;
  color: #eee;
}

.input:focus, .select select:focus {
  border-color: #e94560;
}

.button-editor {
  background-color: #16213e;
  border-color: #e94560;
  color: #eee;
}

.button-editor label {
  color: #aaa;
}

.help {
  color: #888;
}

.button.is-emerald-badge {
  background-color: #4ecca3;
  border-color: #4ecca3;
  color: #1a1a2e;
  font-weight: bold;
}

.button.is-emerald-badge:hover {
  background-color: #3db892;
  border-color: #3db892;
  color: #1a1a2e;
}

.footer {
  background-color: #16213e;
  color: #888;
}

.footer a {
  color: #4ecca3;
}
</style>
