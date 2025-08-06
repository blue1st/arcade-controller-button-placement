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
            <ButtonForm @update="updateButtons" />
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

<script setup>
import { ref, onMounted, nextTick } from 'vue'
import ButtonForm from '~/components/ButtonForm.vue'
import LayoutCanvas from '~/components/LayoutCanvas.vue'
import { buttonLayouts, getJsonFilePath } from '~/components/button-layouts.js'

const selectedType = ref(null)
const buttons = ref([])
const { setLocale, locale } = useI18n()

// 機種を選択
const selectType = (type) => {
  selectedType.value = type
  loadButtons(type)
}

// ボタンデータをロード
const loadButtons = async (type) => {
  try {
    const jsonFilePath = getJsonFilePath(type)
    if (!jsonFilePath) {
      console.error('JSONファイルパスが見つかりません:', type)
      return
    }
    
    let response
    response = await fetch(jsonFilePath)
    
    if (response && response.ok) {
      const data = await response.json()
      buttons.value = data.buttons || []
    }
    console.log("ボタンデータをロードに成功しました")
  } catch (error) {
    console.error('ボタンデータのロードに失敗しました:', error)
  }
}

const updateButtons = (newButtons) => {
  buttons.value = newButtons
}

const changeLang = () => {
  if (locale.value === "en") {
    setLocale("ja")
  }
  else {
    setLocale("en")
  }
}


</script>

<style>
body {
  background-color: #f8f9fa;
}
</style>
