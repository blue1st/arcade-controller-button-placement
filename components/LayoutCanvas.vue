<template>
  <div class="card">
    <div class="card-content">
      <div class="content">
        <h4>{{ $t('layoutCanvas.title') }}</h4>
        <canvas ref="canvas" width="600" height="400" class="border scaled-canvas"></canvas>
        <button class="button is-success mt-3" @click="downloadCanvas">
          <span class="icon is-small">
            <i class="fas fa-download"></i>
          </span>
          <span>{{ $t('layoutCanvas.download') }}</span>
        </button>
        <button class="button is-info mt-3 ml-2" @click="shareURL">
          <span class="icon is-small">
            <i class="fas fa-share-alt"></i>
          </span>
          <span>{{ $t('layoutCanvas.share') }}</span>
        </button>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, watch } from 'vue'
import { compressToBase64, decompressFromBase64 } from 'lz-string'
import type { Button } from '~/types/button-types.ts'

const props = defineProps<{ 
  buttons: Button[]
}>()
const canvas = ref<HTMLCanvasElement | null>(null)

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
    ctx.fillStyle = '#3498db'
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
    ctx.fillStyle = '#ccc'
    ctx.lineWidth = 1
    ctx.textAlign = 'center'
    ctx.textBaseline = 'middle' 
    ctx.font = `8px Arial`
    ctx.fillText(button.id, button.x, button.y - radius - 6)
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

const shareURL = () => {
  // URLパラメータを取得
  const urlParams = new URLSearchParams(window.location.search);
  
  // ボタンデータをJSON形式に変換（idを削除）
  const buttonsData = JSON.stringify(props.buttons.map(({ id, ...button }) => button));
  
  // LZStringで圧縮
  const compressed = compressToBase64(buttonsData);
  
  // 圧縮されたデータをURLパラメータに追加
  urlParams.set('data', compressed);
  
  // 元のURLにパラメータを追加して共有用URLを作成
  const shareUrl = `${window.location.origin}${window.location.pathname}?${urlParams.toString()}`;
  
  // URLをコピー
  navigator.clipboard.writeText(shareUrl).then(() => {
    alert('共有用URLがクリップボードにコピーされました！');
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
</style>
