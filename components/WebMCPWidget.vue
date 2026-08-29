<template>
  <div class="webmcp-widget-container">
    <!-- パネル (ポップオーバー) -->
    <transition name="webmcp-popover">
      <div v-if="isOpen" class="webmcp-popover-card box">
        <header class="webmcp-popover-header mb-3">
          <div class="is-flex is-align-items-center">
            <span class="icon is-medium text-emerald mr-2">
              <i class="fas fa-robot fa-lg"></i>
            </span>
            <div>
              <h6 class="title is-6 has-text-white mb-0">{{ $t('webmcp.widgetTitle') }}</h6>
              <span class="is-size-7 text-muted">{{ $t('webmcp.widgetSubtitle') }}</span>
            </div>
          </div>
          <button class="delete" aria-label="close" @click="isOpen = false"></button>
        </header>

        <!-- ステータス ＆ ツール数 -->
        <div class="notification is-dark py-2 px-3 mb-3 is-flex is-justify-content-space-between is-align-items-center">
          <div class="is-flex is-align-items-center">
            <span class="status-pulse-dot mr-2"></span>
            <span class="is-size-7 has-text-weight-semibold text-emerald">WebMCP Ready</span>
          </div>
          <span class="tag is-info is-light is-small">
            {{ $t('webmcp.registeredToolsCount', { count: tools.length }) }}
          </span>
        </div>

        <!-- webmcp.js 互換 トークン接続フォーム -->
        <div class="webmcp-token-box mb-3">
          <label class="label is-size-7 text-muted mb-1">
            <i class="fas fa-key mr-1"></i>WebMCP Token (Bridge Client)
          </label>
          <div class="field has-addons">
            <div class="control is-expanded">
              <input 
                class="input is-small webmcp-token-input" 
                type="password" 
                v-model="token" 
                :placeholder="$t('webmcp.tokenPlaceholder')"
              />
            </div>
            <div class="control">
              <button 
                class="button is-small" 
                :class="isConnected ? 'is-success' : 'is-primary'"
                @click="toggleConnect"
              >
                <span class="icon is-small">
                  <i :class="isConnected ? 'fas fa-check' : 'fas fa-plug'"></i>
                </span>
                <span>{{ isConnected ? $t('webmcp.tokenConnected') : $t('webmcp.connectToken') }}</span>
              </button>
            </div>
          </div>
        </div>

        <!-- アクションボタン群 -->
        <div class="buttons are-small mb-3">
          <button class="button is-emerald-badge is-fullwidth mb-2" @click="handleOpenInspector">
            <span class="icon"><i class="fas fa-magic"></i></span>
            <span>{{ $t('webmcp.openInspector') }}</span>
          </button>
          <button class="button is-info is-outlined is-fullwidth" @click="handleOpenGuide">
            <span class="icon"><i class="fas fa-question-circle"></i></span>
            <span>{{ $t('webmcp.openGuide') }}</span>
          </button>
        </div>

        <!-- ツール一覧ミニプレビュー -->
        <div class="webmcp-tools-list">
          <p class="is-size-7 text-muted mb-2">
            <i class="fas fa-cogs mr-1"></i>Exposed Tools
          </p>
          <div class="tags">
            <span 
              v-for="tool in tools" 
              :key="tool.name" 
              class="tag is-dark is-rounded tool-tag cursor-pointer"
              :title="tool.description"
              @click="handleOpenInspector"
            >
              <i class="fas fa-code mr-1 text-emerald"></i> {{ tool.name }}
            </span>
          </div>
        </div>
      </div>
    </transition>

    <!-- フローティングボタン (右下) -->
    <button 
      class="webmcp-floating-btn button"
      :class="{ 'is-active': isOpen }"
      @click="isOpen = !isOpen"
      aria-label="WebMCP Widget"
    >
      <span class="icon is-medium">
        <i class="fas fa-robot"></i>
      </span>
      <span class="webmcp-btn-badge">{{ tools.length }}</span>
      <span class="status-pulse-dot btn-pulse"></span>
    </button>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import type { WebMCPTool } from '~/composables/useWebMCP'

const props = defineProps<{
  tools: WebMCPTool[]
}>()

const emit = defineEmits<{
  (e: 'openInspector'): void
  (e: 'openGuide'): void
}>()

const isOpen = ref(false)
const token = ref('')
const isConnected = ref(false)

onMounted(() => {
  const savedToken = localStorage.getItem('webmcp_token')
  if (savedToken) {
    token.value = savedToken
    isConnected.value = true
  }
})

const toggleConnect = () => {
  if (isConnected.value) {
    isConnected.value = false
    token.value = ''
    localStorage.removeItem('webmcp_token')
  } else {
    if (!token.value) return
    isConnected.value = true
    localStorage.setItem('webmcp_token', token.value)
  }
}

const handleOpenInspector = () => {
  isOpen.value = false
  emit('openInspector')
}

const handleOpenGuide = () => {
  isOpen.value = false
  emit('openGuide')
}
</script>

<style scoped>
.webmcp-widget-container {
  position: fixed;
  bottom: 24px;
  right: 24px;
  z-index: 1000;
}

.webmcp-floating-btn {
  width: 56px;
  height: 56px;
  border-radius: 50%;
  background: linear-gradient(135deg, #0f3460 0%, #16213e 100%);
  border: 2px solid #4ecca3;
  color: #4ecca3;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.4), 0 0 15px rgba(78, 204, 163, 0.3);
  transition: all 0.3s cubic-bezier(0.25, 0.8, 0.25, 1);
  position: relative;
  cursor: pointer;
}

.webmcp-floating-btn:hover {
  transform: translateY(-3px) scale(1.05);
  box-shadow: 0 6px 25px rgba(0, 0, 0, 0.5), 0 0 22px rgba(78, 204, 163, 0.5);
  color: #fff;
  border-color: #fff;
}

.webmcp-btn-badge {
  position: absolute;
  top: -4px;
  right: -4px;
  background-color: #e94560;
  color: white;
  font-size: 0.7rem;
  font-weight: bold;
  padding: 2px 6px;
  border-radius: 10px;
  border: 2px solid #16213e;
}

.status-pulse-dot {
  width: 8px;
  height: 8px;
  background-color: #4ecca3;
  border-radius: 50%;
  display: inline-block;
  box-shadow: 0 0 8px #4ecca3;
  animation: pulse-green 2s infinite;
}

.btn-pulse {
  position: absolute;
  bottom: 4px;
  right: 6px;
}

@keyframes pulse-green {
  0% {
    box-shadow: 0 0 0 0 rgba(78, 204, 163, 0.7);
  }
  70% {
    box-shadow: 0 0 0 8px rgba(78, 204, 163, 0);
  }
  100% {
    box-shadow: 0 0 0 0 rgba(78, 204, 163, 0);
  }
}

.webmcp-popover-card {
  position: absolute;
  bottom: 70px;
  right: 0;
  width: 320px;
  background-color: rgba(22, 33, 62, 0.95);
  backdrop-filter: blur(10px);
  border: 1px solid #0f3460;
  border-radius: 14px;
  box-shadow: 0 10px 30px rgba(0, 0, 0, 0.5);
  padding: 16px;
  color: #eee;
}

.webmcp-popover-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  border-bottom: 1px solid #0f3460;
  padding-bottom: 8px;
}

.webmcp-token-box {
  background-color: rgba(15, 52, 96, 0.5);
  padding: 8px 10px;
  border-radius: 8px;
  border: 1px solid rgba(78, 204, 163, 0.2);
}

.webmcp-token-input {
  background-color: #1a1a2e;
  color: #eee;
  border-color: #0f3460;
}

.webmcp-token-input:focus {
  border-color: #4ecca3;
}

.is-emerald-badge {
  background-color: #4ecca3;
  color: #1a1a2e;
  font-weight: bold;
  border: none;
}

.is-emerald-badge:hover {
  background-color: #3db892;
  color: #fff;
}

.tool-tag {
  background-color: #0f3460;
  color: #ddd;
  font-size: 0.7rem;
  transition: background-color 0.2s;
}

.tool-tag:hover {
  background-color: #1a4a7a;
}

.text-emerald {
  color: #4ecca3;
}

.text-muted {
  color: #aaa;
}

.cursor-pointer {
  cursor: pointer;
}

/* 登場アニメーション */
.webmcp-popover-enter-active,
.webmcp-popover-leave-active {
  transition: all 0.25s ease-out;
}

.webmcp-popover-enter-from,
.webmcp-popover-leave-to {
  opacity: 0;
  transform: translateY(10px) scale(0.95);
}
</style>
