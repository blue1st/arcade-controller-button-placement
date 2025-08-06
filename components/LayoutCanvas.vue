<template>
  <div class="card">
    <div class="card-content">
      <div class="content">
        <h4>{{ $t('layoutCanvas.title') }}</h4>
        <canvas ref="canvas" width="600" height="400"" class="border scaled-canvas"></canvas>
        <button class="button is-success mt-3" @click="downloadCanvas">{{ $t('layoutCanvas.download') }}</button>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, watch } from 'vue'

const props = defineProps({ buttons: Array })
const canvas = ref(null)

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
  const scaleX = parentElement.widthidth / canvas.value.width
  const scaleY = parentElement.height / canvas.value.height
  const scale = Math.min(scaleX, scaleY)

  // 描画コンテキストをスケール
  ctx.scale(scale, scale);

  // Draw controller outline
  ctx.fillStyle = '#999'
  ctx.fillRect(10, 10, canvas.value.width - 20, canvas.value.height - 20)
  ctx.strokeStyle = '#ccc'
  ctx.lineWidth = 2
  ctx.strokeRect(10, 10, canvas.value.width - 20, canvas.value.height - 20)



  // Draw buttons
  props.buttons.forEach(button => {
    // Determine radius based on diameter
    const radius = button.diameter
    
    // Draw button circle
    ctx.beginPath()
    ctx.arc(button.x, button.y, radius, 0, Math.PI * 2)
    ctx.fillStyle = button?.label.length > 0 ? '#3498db' : '#ddd'
    ctx.fill()
    ctx.strokeStyle = '#2980b9'
    ctx.stroke()

    // Draw label
    ctx.fillStyle = '#fff'
    ctx.lineWidth = 3
    ctx.textAlign = 'center'
    ctx.textBaseline = 'middle'
    ctx.font = '20px Arial'
    ctx.fillText(button.label, button.x, button.y)
  })
}

onMounted(() => {
  draw()
  // ウィンドウのリサイズイベントにハンドラを追加
  window.addEventListener('resize', draw);
})

watch(() => props.buttons, () => {
  draw()
}, { deep: true })

const downloadCanvas = () => {
  if (!canvas.value) return;
  const link = document.createElement('a');
  link.download = 'button-layout.png';
  link.href = canvas.value.toDataURL('image/png');
  link.click();
}

</script>

<style scoped>
.scaled-canvas {
  width: 100%;
  height: 100%;
  object-fit: contain;
}
</style>
