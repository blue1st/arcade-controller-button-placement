<template>
  <div class="card">
    <div class="card-content">
      <div class="content">
        <h4>Layout Preview</h4>
        <canvas ref="canvas" width="600" height="400" class="border"></canvas>
        <button class="button is-success mt-3" @click="downloadCanvas">Download as PNG</button>
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
    ctx.strokeStyle = '#2980b9'
    ctx.stroke()

    // Draw label
    ctx.fillStyle = '#fff'
    ctx.strokeStyle = '#000'
    ctx.lineWidth = 3
    ctx.textAlign = 'center'
    ctx.textBaseline = 'middle'
    ctx.font = '20px Arial'
    ctx.strokeText(button.label, button.x, button.y)
    ctx.fillText(button.label, button.x, button.y)
  })
}

onMounted(() => {
  draw()
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
