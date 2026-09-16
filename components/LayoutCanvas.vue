<template>
  <div class="card">
    <div class="card-content">
      <div class="content">
        <h4 class="has-text-white">{{ $t('layoutCanvas.title') }}</h4>
        <p class="help">{{ $t('layoutCanvas.dragHint') }}</p>
        <div class="canvas-overlay">
          <div class="field has-addons layout-group">
            <div class="control layout-label">
              <span class="layout-badge">
                <i class="fas fa-gamepad"></i>
                {{ $t('buttonForm.selectLayout') }}
              </span>
            </div>
            <div class="control">
              <div class="select">
                <select v-model="selectedLayout" @change="onLayoutChange">
                  <option v-for="layout in buttonLayouts" :key="layout.name" :value="layout.name">{{ layout.label }}</option>
                </select>
              </div>
            </div>
            <div class="control" v-if="currentLayoutAmazonLink">
              <a :href="currentLayoutAmazonLink" target="_blank" class="button is-warning">
                <span class="icon is-small"><i class="fab fa-amazon"></i></span>
                <span>{{ $t('layoutCanvas.amazonLink') }}</span>
              </a>
            </div>
            <div class="control">
              <button class="button is-secondary has-text-white" @click="resetLayout">
                <span class="icon is-small"><i class="fas fa-redo"></i></span>
                <span>{{ $t('buttonForm.resetButton') }}</span>
              </button>
            </div>
          </div>
          <button class="button is-primary" @click="addButton">
            <span class="icon is-small"><i class="fas fa-plus"></i></span>
            <span>{{ $t('buttonForm.addButton') }}</span>
          </button>
        </div>
        <div class="canvas-wrapper">
          <canvas ref="canvas" width="600" height="400" class="has-border scaled-canvas" :style="canvasStyle"></canvas>
          <div v-if="selectedButton" class="button-editor" :style="editorPosition">
            <div class="editor-row">
              <label>{{ $t('buttonConfig.label') }}</label>
              <input class="input is-small" type="text" v-model="selectedButton.label" @input="emitUpdate" />
            </div>
            <div class="editor-row">
              <label>{{ $t('buttonConfig.diameter') }}</label>
              <select class="input is-small" v-model.number="selectedButton.diameter" @change="emitUpdate">
                <option :value="24">24φ</option>
                <option :value="30">30φ</option>
              </select>
            </div>
            <div class="editor-row">
              <label>{{ $t('buttonConfig.x') }}</label>
              <input class="input is-small" type="number" v-model.number="selectedButton.x" @input="emitUpdate" />
            </div>
            <div class="editor-row">
              <label>{{ $t('buttonConfig.y') }}</label>
              <input class="input is-small" type="number" v-model.number="selectedButton.y" @input="emitUpdate" />
            </div>
            <button class="button is-danger is-small is-fullwidth" @click="removeButton(selectedButton.id)">
              <span class="icon is-small"><i class="fas fa-trash"></i></span>
              <span>{{ $t('buttonConfig.removeButton') }}</span>
            </button>
          </div>
        </div>
        <div class="toolbar mt-3">
          <button class="button is-success" @click="downloadCanvas">
            <span class="icon is-small"><i class="fas fa-download"></i></span>
            <span>{{ $t('layoutCanvas.download') }}</span>
          </button>
          <button class="button is-info has-text-white" @click="shareURL">
            <span class="icon is-small"><i class="fas fa-share-alt"></i></span>
            <span>{{ $t('layoutCanvas.share') }}</span>
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, onUnmounted, watch } from 'vue'
import LZString from 'lz-string'
import { buttonLayouts } from '~/components/button-layouts.ts'
import type { Button } from '~/types/button-types.ts'

const { t } = useI18n()

const props = defineProps<{ 
  buttons: Button[]
}>()
const emit = defineEmits<{
  (e: 'update', buttons: Button[]): void
  (e: 'loadLayout', layoutName: string): void
}>()
const canvas = ref<HTMLCanvasElement | null>(null)

// ドラッグ状態
const draggingButton = ref<Button | null>(null)
const dragOffset = ref({ x: 0, y: 0 })
const isDragging = ref(false)
const selectedButton = ref<Button | null>(null)
const editorPosition = ref({ left: '0px', top: '0px' })
const selectedLayout = ref('default')
const previousLayout = ref('default')

const canvasStyle = computed(() => ({
  touchAction: 'none',
  cursor: isDragging.value ? 'grabbing' : 'grab'
}))

const currentLayoutAmazonLink = computed(() => {
  const layout = buttonLayouts.find(l => l.name === selectedLayout.value)
  return layout?.amazonLink || null
})

const currentLayoutHasLever = computed(() => {
  const layout = buttonLayouts.find(l => l.name === selectedLayout.value)
  return layout?.hasLever || false
})

const onLayoutChange = () => {
  if (selectedLayout.value === previousLayout.value) return
  if (props.buttons.length > 0 && !confirm(t('buttonForm.changeLayoutConfirm'))) {
    selectedLayout.value = previousLayout.value
    return
  }
  previousLayout.value = selectedLayout.value
  emit('loadLayout', selectedLayout.value)
}

const resetLayout = () => {
  if (props.buttons.length > 0 && !confirm(t('buttonForm.changeLayoutConfirm'))) return
  emit('loadLayout', selectedLayout.value)
}

// 画面座標をキャンバスの論理座標(600x400)に変換
const getCanvasCoords = (clientX: number, clientY: number) => {
  if (!canvas.value) return { x: 0, y: 0 }
  const rect = canvas.value.getBoundingClientRect()
  const scaleX = canvas.value.width / rect.width
  const scaleY = canvas.value.height / rect.height
  return {
    x: (clientX - rect.left) * scaleX,
    y: (clientY - rect.top) * scaleY
  }
}

// ボタンがクリックされたか判定
const findButtonAt = (x: number, y: number): Button | null => {
  // 上から描画されたボタンが前面にあるため、逆順に検索
  for (let i = props.buttons.length - 1; i >= 0; i--) {
    const button = props.buttons[i]
    const radius = button.diameter
    const dx = x - button.x
    const dy = y - button.y
    if (dx * dx + dy * dy <= radius * radius) {
      return button
    }
  }
  return null
}

const onPointerDown = (event: PointerEvent) => {
  const { x, y } = getCanvasCoords(event.clientX, event.clientY)
  const button = findButtonAt(x, y)
  if (button) {
    draggingButton.value = button
    isDragging.value = true
    selectedButton.value = button
    dragOffset.value = { x: x - button.x, y: y - button.y }
    canvas.value?.setPointerCapture(event.pointerId)
    event.preventDefault()
  } else {
    selectedButton.value = null
  }
}

const onCanvasClick = (event: MouseEvent) => {
  const { x, y } = getCanvasCoords(event.clientX, event.clientY)
  const button = findButtonAt(x, y)
  if (button) {
    selectedButton.value = button
    updateEditorPosition()
  } else {
    selectedButton.value = null
  }
}

const updateEditorPosition = () => {
  if (!selectedButton.value || !canvas.value) return
  const rect = canvas.value.getBoundingClientRect()
  const scaleX = rect.width / canvas.value.width
  const scaleY = rect.height / canvas.value.height
  const left = selectedButton.value.x * scaleX + 40
  const top = selectedButton.value.y * scaleY - 60
  editorPosition.value = { left: `${left}px`, top: `${top}px` }
}



const onPointerMove = (event: PointerEvent) => {
  if (!draggingButton.value) return
  const { x, y } = getCanvasCoords(event.clientX, event.clientY)
  const newX = Math.max(10, Math.min(canvas.value!.width - 10, x - dragOffset.value.x))
  const newY = Math.max(10, Math.min(canvas.value!.height - 10, y - dragOffset.value.y))
  draggingButton.value.x = newX
  draggingButton.value.y = newY
  draw()
  updateEditorPosition()
  event.preventDefault()
}

const onPointerUp = (event: PointerEvent) => {
  if (draggingButton.value) {
    canvas.value?.releasePointerCapture(event.pointerId)
    draggingButton.value = null
    isDragging.value = false
    emit('update', props.buttons.map(b => ({ ...b })))
  }
}

const emitUpdate = () => {
  emit('update', props.buttons.map(b => ({ ...b })))
}

const addButton = () => {
  const newId = props.buttons.length > 0 ? Math.max(...props.buttons.map(b => b.id)) + 1 : 1
  const newButton: Button = { id: newId, x: 300, y: 200, label: 'New', diameter: 30 }
  const newButtons = [...props.buttons, newButton]
  emit('update', newButtons)
  selectedButton.value = newButton
}

const removeButton = (id: number) => {
  if (!confirm(t('buttonForm.removeButtonConfirm'))) return
  const newButtons = props.buttons.filter(b => b.id !== id)
  emit('update', newButtons)
  if (selectedButton.value?.id === id) {
    selectedButton.value = null
  }
}



const draw = () => {
  if (!canvas.value) return
  const ctx = canvas.value.getContext('2d')
  if (!ctx) return;

  // Clear canvas
  ctx.clearRect(0, 0, canvas.value.width, canvas.value.height)

  // 描画コンテキストを初期状態に戻す
  ctx.setTransform(1, 0, 0, 1, 0, 0)

  // 描画倍率を計算
  const parentElement = canvas.value.parentElement
  if (parentElement === null) {
    return
  }
  const scaleX = parentElement.width / canvas.value.width
  const scaleY = parentElement.height / canvas.value.height
  const scale = Math.min(scaleX, scaleY)

  // 描画コンテキストをスケール
  ctx.scale(scale, scale);

  // Draw controller outline
  ctx.fillStyle = '#0f3460'
  ctx.fillRect(10, 10, canvas.value.width - 20, canvas.value.height - 20)
  ctx.strokeStyle = '#1a4a7a'
  ctx.lineWidth = 2
  ctx.strokeRect(10, 10, canvas.value.width - 20, canvas.value.height - 20)

  // Draw lever if layout has one
  if (currentLayoutHasLever.value) {
    const leverX = 100
    const leverY = 200
    const leverRadius = 40

    // Lever base (circle)
    ctx.beginPath()
    ctx.arc(leverX, leverY, leverRadius, 0, Math.PI * 2)
    ctx.fillStyle = '#2c3e50'
    ctx.fill()
    ctx.strokeStyle = '#34495e'
    ctx.lineWidth = 3
    ctx.stroke()

    // Direction arrows (up, down, left, right)
    const arrowLength = 20
    const arrowWidth = 8

    // Up arrow
    ctx.beginPath()
    ctx.moveTo(leverX, leverY - leverRadius + 5)
    ctx.lineTo(leverX - arrowWidth, leverY - leverRadius + 5 + arrowLength)
    ctx.lineTo(leverX + arrowWidth, leverY - leverRadius + 5 + arrowLength)
    ctx.closePath()
    ctx.fillStyle = '#95a5a6'
    ctx.fill()

    // Down arrow
    ctx.beginPath()
    ctx.moveTo(leverX, leverY + leverRadius - 5)
    ctx.lineTo(leverX - arrowWidth, leverY + leverRadius - 5 - arrowLength)
    ctx.lineTo(leverX + arrowWidth, leverY + leverRadius - 5 - arrowLength)
    ctx.closePath()
    ctx.fill()

    // Left arrow
    ctx.beginPath()
    ctx.moveTo(leverX - leverRadius + 5, leverY)
    ctx.lineTo(leverX - leverRadius + 5 + arrowLength, leverY - arrowWidth)
    ctx.lineTo(leverX - leverRadius + 5 + arrowLength, leverY + arrowWidth)
    ctx.closePath()
    ctx.fill()

    // Right arrow
    ctx.beginPath()
    ctx.moveTo(leverX + leverRadius - 5, leverY)
    ctx.lineTo(leverX + leverRadius - 5 - arrowLength, leverY - arrowWidth)
    ctx.lineTo(leverX + leverRadius - 5 - arrowLength, leverY + arrowWidth)
    ctx.closePath()
    ctx.fill()

    // Center dot
    ctx.beginPath()
    ctx.arc(leverX, leverY, 8, 0, Math.PI * 2)
    ctx.fillStyle = '#7f8c8d'
    ctx.fill()

    // Label
    ctx.fillStyle = '#888'
    ctx.textAlign = 'center'
    ctx.textBaseline = 'middle'
    ctx.font = '10px Arial'
    ctx.fillText('LEVER', leverX, leverY + leverRadius + 12)
  }



  // Draw buttons
  props.buttons.forEach(button => {
    // Determine radius based on diameter
    const radius = button.diameter
    
    // Draw button circle
    ctx.beginPath()
    ctx.arc(button.x, button.y, radius, 0, Math.PI * 2)
    ctx.fillStyle = draggingButton.value?.id === button.id ? '#e94560' : '#4ecca3'
    ctx.fill()

    // Draw label
    ctx.fillStyle = '#fff'
    ctx.lineWidth = 3
    ctx.textAlign = 'center'
    ctx.textBaseline = 'middle'
    const fontSize = 28 - 4 * button.label.length 
    ctx.font = `${fontSize < 10 ? 10 : fontSize}px Arial`
    ctx.fillText(button.label, button.x, button.y)
    
    // Draw id
    ctx.fillStyle = '#888'
    ctx.lineWidth = 1
    ctx.textAlign = 'center'
    ctx.textBaseline = 'middle' 
    ctx.font = `8px Arial`
    ctx.fillText(button.id, button.x, button.y - radius - 6)
  })
}

onMounted(() => {
  draw()
  window.addEventListener('resize', draw)
  if (canvas.value) {
    canvas.value.addEventListener('pointerdown', onPointerDown)
    canvas.value.addEventListener('pointermove', onPointerMove)
    canvas.value.addEventListener('pointerup', onPointerUp)
    canvas.value.addEventListener('pointercancel', onPointerUp)
    canvas.value.addEventListener('click', onCanvasClick)
  }
})

onUnmounted(() => {
  window.removeEventListener('resize', draw)
  if (canvas.value) {
    canvas.value.removeEventListener('pointerdown', onPointerDown)
    canvas.value.removeEventListener('pointermove', onPointerMove)
    canvas.value.removeEventListener('pointerup', onPointerUp)
    canvas.value.removeEventListener('pointercancel', onPointerUp)
    canvas.value.removeEventListener('click', onCanvasClick)
  }
})

watch(() => props.buttons, () => {
  draw()
  updateEditorPosition()
}, { deep: true })

const downloadCanvas = () => {
  if (!canvas.value) return;
  const link = document.createElement('a');
  link.download = 'button-layout.png';
  link.href = canvas.value.toDataURL('image/png');
  link.click();
}

const shareURL = () => {
  // URLパラメータを取得
  const urlParams = new URLSearchParams(window.location.search);
  
  // ボタンデータをJSON形式に変換（idを削除）
  const buttonsData = JSON.stringify(props.buttons.map(({ id, ...button }) => button));
  
  // LZStringで圧縮
  const compressed = LZString.compressToBase64(buttonsData);
  
  // 圧縮されたデータをURLパラメータに追加
  urlParams.set('data', compressed);
  
  // 元のURLにパラメータを追加して共有用URLを作成
  const shareUrl = `${window.location.origin}${window.location.pathname}?${urlParams.toString()}`;
  
  // URLをコピー
  navigator.clipboard.writeText(shareUrl).then(() => {
    alert(t('layoutCanvas.shareCopied'));
  }).catch(err => {
    console.error('URLのコピーに失敗しました: ', err);
  });
}

</script>

<style scoped>
.scaled-canvas {
  width: 100%;
  height: 100%;
  object-fit: contain;
}

.canvas-wrapper {
  position: relative;
  width: 100%;
  height: 100%;
}

.canvas-overlay {
  display: flex;
  gap: 8px;
  align-items: center;
  flex-wrap: wrap;
  margin-bottom: 8px;
}

.button-editor {
  position: absolute;
  background: #16213e;
  border: 2px solid #e94560;
  border-radius: 8px;
  padding: 12px;
  box-shadow: 0 4px 12px rgba(0,0,0,0.3);
  z-index: 100;
  min-width: 180px;
  color: #eee;
}

.editor-row {
  display: flex;
  align-items: center;
  gap: 8px;
  margin-bottom: 8px;
}

.editor-row label {
  font-size: 0.85rem;
  font-weight: bold;
  min-width: 60px;
  color: #aaa;
}

.editor-row .input {
  flex: 1;
  background-color: #1a1a2e;
  border-color: #0f3460;
  color: #eee;
}

.editor-row .input:focus {
  border-color: #e94560;
}

.toolbar {
  display: flex;
  gap: 8px;
  flex-wrap: wrap;
  align-items: center;
}

.toolbar .field {
  margin-bottom: 0;
}

.toolbar .select select {
  background-color: #1a1a2e;
  border-color: #0f3460;
  color: #eee;
}

.layout-group {
  display: flex;
  align-items: center;
  gap: 0;
  background-color: #1a1a2e;
  border: 2px solid #0f3460;
  border-radius: 8px;
  overflow: hidden;
}

.layout-group .control {
  border-right: 1px solid #0f3460;
}

.layout-group .control:last-child {
  border-right: none;
}

.layout-label {
  padding: 0;
}

.layout-badge {
  background-color: #e94560;
  color: white;
  padding: 8px 16px;
  font-size: 0.85rem;
  font-weight: bold;
  display: flex;
  align-items: center;
  gap: 6px;
  white-space: nowrap;
  height: 100%;
}

.layout-group .select select {
  background-color: #1a1a2e;
  border: none;
  border-radius: 0;
  color: #eee;
  padding: 8px 12px;
  min-width: 180px;
}

.layout-group .select select:focus {
  border: none;
  box-shadow: none;
}

.layout-group .button {
  border-radius: 0;
  height: 100%;
}
</style>
