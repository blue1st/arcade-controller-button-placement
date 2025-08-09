<template>
  <div class="card">
    <div class="card-content">
      <div class="content">
        <h4>{{ $t('buttonForm.title') }}</h4>
        <form @submit.prevent>
          <div class="field">
            <label class="label">{{ $t('buttonForm.selectLayout') }}</label>
            <div class="control">
              <div class="select">
                <select v-model="selectedLayout" @change="loadSelectedLayout">
                  <option v-for="buttonLayout in buttonLayouts" :value="buttonLayout.name">{{ buttonLayout.label }}</option>
                </select>
              </div>
            </div>
          </div>
          <button class="button is-secondary ms-2" @click="loadSelectedLayout">{{ $t('buttonForm.resetButton') }}</button>
          <div v-for="(button, index) in localButtons" :key="button.id" class="mb-3 border rounded">
            <div class="p-3 bg-light d-flex justify-content-between align-items-center accordion-header" @click="toggleAccordion(button.id)">
              <span>{{ accordionOpen[button.id] ? '▲' : '▼' }}</span>
              <span class="fw-bold">Button {{ index + 1 }}: {{ button.label }}</span>
            </div>
            <div v-show="accordionOpen[button.id]" class="p-3">
              <div class="field">
                <label class="label">{{ $t('buttonConfig.label') }}</label>
                <div class="control">
                  <input class="input" type="text" v-model="button.label" @input="emitUpdate">
                </div>
              </div>
              <div class="columns">
                <div class="column is-6">
                <div class="field">
                  <label class="label">{{ $t('buttonConfig.x') }}</label>
                  <div class="control">
                    <input class="input" type="number" v-model.number="button.x" @input="emitUpdate">
                  </div>
                </div>
                </div>
                <div class="column is-6">
                  <div class="field">
                    <label class="label">{{ $t('buttonConfig.y') }}</label>
                    <div class="control">
                      <input class="input" type="number" v-model.number="button.y" @input="emitUpdate">
                    </div>
                  </div>
                </div>
              </div>
              <div class="field">
                <label class="label">{{ $t('buttonConfig.diameter') }}</label>
                <div class="control">
                  <div class="select">
                    <select v-model.number="button.diameter" @input="emitUpdate">
                      <option value="24">24φ</option>
                      <option value="30">30φ</option>
                    </select>
                  </div>
                </div>
              </div>
              <button class="button is-danger is-small mt-2" @click="removeButton(button.id)">{{ $t('buttonConfig.removeButton') }}</button>
            </div>
          </div>
          <button class="button is-primary" @click="addButton">{{ $t('buttonForm.addButton') }}</button>
        </form>
      </div>
    </div>
  </div>
</template>

<script setup>
import { onMounted, ref, watch } from 'vue'
import { buttonLayouts, getJsonFilePath, getLayoutLabel } from '~/components/button-layouts.js'
import { compressToBase64, decompressFromBase64 } from 'lz-string'

const props = defineProps({ 
  buttons: Array
})
const emit = defineEmits(['update'])

const localButtons = ref(JSON.parse(JSON.stringify(props.buttons || [])))
const accordionOpen = ref({})
const selectedLayout = ref('default')

watch(() => props.buttons, (newVal) => {
  localButtons.value = JSON.parse(JSON.stringify(newVal || []))
}, { deep: true })

const emitUpdate = () => {
  emit('update', localButtons.value)
}

const addButton = () => {
  const newId = localButtons.value.length > 0 ? Math.max(...localButtons.value.map(b => b.id)) + 1 : 1;
  localButtons.value.push({ id: newId, x: 50, y: 50, label: 'New', diameter: 30 })
  emitUpdate()
}

const removeButton = (id) => {
  // 確認ダイアログを表示
  if (!confirm($t('buttonForm.removeButtonConfirm'))) {
    return;
  }
  
  localButtons.value = localButtons.value.filter(b => b.id !== id)
  emitUpdate()
}

const toggleAccordion = (id) => {
  accordionOpen.value[id] = !accordionOpen.value[id]
}

const loadSelectedLayout = async () => {
  try {
    // 確認ダイアログを表示
    if (localButtons.value.length > 0 && !confirm('レイアウトを変更します。よろしいですか？')) {
      return;
    }
    
    // Find the selected layout configuration
    const layoutConfig = buttonLayouts.find(layout => layout.name === selectedLayout.value)
    if (!layoutConfig) {
      console.error('Selected layout not found:', selectedLayout.value)
      return
    }
    
    const response = await fetch(layoutConfig.jsonFile)
    const defaultButtons = await response.json()
    localButtons.value = defaultButtons
    emitUpdate()
  } catch (error) {
    console.error('Failed to load selected layout:', error)
  }
}
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
          localButtons.value = parsedButtons
          emitUpdate()
        }
      }
    } catch (error) {
      console.error('URLパラメータの解析に失敗しました:', error)
    }
  }
}
// URLパラメータがある場合は初期ロードをスキップ
onMounted(() => {
  loadFromUrlParams()
  
  if (localButtons.value.length === 0) {
    loadSelectedLayout()
  }
})
</script>

<style lang="sass" scoped>
.accordion-header
  cursor: pointer
</style>