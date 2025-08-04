<template>
  <div class="card">
    <div class="card-content">
      <div class="content">
        <h4>Button Configuration</h4>
        <form @submit.prevent>
          <div class="field">
            <label class="label">Select Button Layout</label>
            <div class="control">
              <div class="select">
                <select v-model="selectedLayout" @change="loadSelectedLayout">
                  <option value="default">Default</option>
                  <option value="pws-type-b">PWS Type B</option>
                  <option value="pws-type-c">PWS Type C</option>
                  <option value="pws-type-d">PWS Type D</option>
                  <option value="pws-type-e">PWS Type E</option>
                  <option value="pws-type-f">PWS Type F</option>
                </select>
              </div>
            </div>
          </div>
          <button class="button is-secondary ms-2" @click="loadSelectedLayout">Reset to Select Layout</button>
          <div v-for="(button, index) in localButtons" :key="button.id" class="mb-3 border rounded">
            <div class="p-3 bg-light d-flex justify-content-between align-items-center accordion-header" @click="toggleAccordion(button.id)">
              <span>{{ accordionOpen[button.id] ? '▲' : '▼' }}</span>
              <span class="fw-bold">Button {{ index + 1 }}: {{ button.label }}</span>
            </div>
            <div v-show="accordionOpen[button.id]" class="p-3">
              <div class="field">
                <label class="label">Label</label>
                <div class="control">
                  <input class="input" type="text" v-model="button.label" @input="emitUpdate">
                </div>
              </div>
              <div class="columns">
                <div class="column is-6">
                  <div class="field">
                    <label class="label">X</label>
                    <div class="control">
                      <input class="input" type="number" v-model.number="button.x" @input="emitUpdate">
                    </div>
                  </div>
                </div>
                <div class="column is-6">
                  <div class="field">
                    <label class="label">Y</label>
                    <div class="control">
                      <input class="input" type="number" v-model.number="button.y" @input="emitUpdate">
                    </div>
                  </div>
                </div>
              </div>
              <div class="field">
                <label class="label">Diameter (φ)</label>
                <div class="control">
                  <div class="select">
                    <select v-model.number="button.diameter" @input="emitUpdate">
                      <option value="24">24φ</option>
                      <option value="30">30φ</option>
                    </select>
                  </div>
                </div>
              </div>
              <button class="button is-danger is-small mt-2" @click="removeButton(button.id)">Remove</button>
            </div>
          </div>
          <button class="button is-primary" @click="addButton">Add Button</button>
        </form>
      </div>
    </div>
  </div>
</template>

<script setup>
import { onMounted, ref, watch } from 'vue'
import { buttonLayouts, getJsonFilePath, getLayoutLabel } from '~/components/button-layouts.js'

const props = defineProps({ 
  buttons: Array,
  resetToSelectLayout: Function
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
  if (!confirm('ボタンを削除します。よろしいですか？')) {
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
    console.log(localButtons.value)
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
    localButtons.value = JSON.parse(JSON.stringify(defaultButtons));
    emitUpdate();
  } catch (error) {
    console.error('Failed to load selected layout:', error)
  }
}

onMounted(() => loadSelectedLayout())
</script>

<style lang="sass" scoped>
.accordion-header
  cursor: pointer
</style>
