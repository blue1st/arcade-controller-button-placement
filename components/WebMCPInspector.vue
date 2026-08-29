<template>
  <div class="modal" :class="{ 'is-active': isOpen }">
    <div class="modal-background" @click="close"></div>
    <div class="modal-card webmcp-modal-card">
      <header class="modal-card-head">
        <p class="modal-card-title has-text-white">
          <span class="icon mr-2"><i class="fas fa-robot"></i></span>
          {{ $t('webmcp.inspectorTitle') }}
        </p>
        <button class="delete" aria-label="close" @click="close"></button>
      </header>
      
      <section class="modal-card-body">
        <!-- タブ切り替え -->
        <div class="tabs is-boxed is-fullwidth mb-4">
          <ul>
            <li :class="{ 'is-active': activeTab === 'simulator' }" @click="activeTab = 'simulator'">
              <a>
                <span class="icon is-small"><i class="fas fa-magic"></i></span>
                <span>{{ $t('webmcp.simulatorTab') }}</span>
              </a>
            </li>
            <li :class="{ 'is-active': activeTab === 'tools' }" @click="activeTab = 'tools'">
              <a>
                <span class="icon is-small"><i class="fas fa-tools"></i></span>
                <span>{{ $t('webmcp.toolsTab') }} ({{ tools.length }})</span>
              </a>
            </li>
            <li :class="{ 'is-active': activeTab === 'logs' }" @click="activeTab = 'logs'">
              <a>
                <span class="icon is-small"><i class="fas fa-list-alt"></i></span>
                <span>{{ $t('webmcp.logsTab') }} ({{ logs.length }})</span>
              </a>
            </li>
          </ul>
        </div>

        <!-- Tab 1: AI Agent Simulator -->
        <div v-if="activeTab === 'simulator'" class="tab-pane">
          <div class="notification is-dark is-outlined mb-4">
            <p class="is-size-7">
              <i class="fas fa-info-circle mr-1"></i>
              自然言語による指示がどのように WebMCP ツール群の連続呼び出しに変換され、キャンバスが自動操作されるか体験できます。
            </p>
          </div>

          <div class="field">
            <label class="label text-muted">{{ $t('webmcp.promptLabel') }}</label>
            <div class="buttons mb-3">
              <button 
                v-for="(sample, idx) in samplePrompts" 
                :key="idx" 
                class="button is-small is-dark is-rounded"
                @click="selectedPrompt = sample.prompt"
              >
                <span class="icon is-small"><i class="fas fa-bolt text-warning"></i></span>
                <span>{{ sample.title }}</span>
              </button>
            </div>
            <div class="control has-icons-right">
              <textarea 
                class="textarea is-small webmcp-input" 
                rows="2" 
                v-model="selectedPrompt" 
                :placeholder="$t('webmcp.customPromptPlaceholder')"
              ></textarea>
            </div>
          </div>

          <button 
            class="button is-primary is-fullwidth" 
            :class="{ 'is-loading': isSimulating }"
            @click="runSimulation"
          >
            <span class="icon"><i class="fas fa-play"></i></span>
            <span>{{ $t('webmcp.runSimulation') }}</span>
          </button>

          <!-- シミュレーション結果表示 -->
          <div v-if="simulationResult" class="mt-4">
            <h6 class="title is-6 text-emerald mb-2">
              <i class="fas fa-check-circle mr-1"></i> AI 実行ステップ結果
            </h6>
            <div class="box log-box">
              <div v-for="(step, idx) in simulationResult.steps" :key="idx" class="step-item mb-2">
                <span class="tag is-info is-light mr-2">Step {{ idx + 1 }}</span>
                <code>{{ step }}</code>
              </div>
            </div>
          </div>
        </div>

        <!-- Tab 2: Registered Tools & Schema -->
        <div v-if="activeTab === 'tools'" class="tab-pane">
          <div v-for="tool in tools" :key="tool.name" class="card mb-3 tool-card">
            <header class="card-header">
              <p class="card-header-title has-text-primary">
                <span class="icon mr-2"><i class="fas fa-code"></i></span>
                {{ tool.name }}
              </p>
              <button class="button is-small is-success m-2" @click="quickExecute(tool)">
                <span class="icon is-small"><i class="fas fa-play"></i></span>
                <span>実行テスト</span>
              </button>
            </header>
            <div class="card-content py-3">
              <p class="is-size-7 mb-2">{{ tool.description }}</p>
              <details class="is-size-7">
                <summary class="has-text-grey-light cursor-pointer">JSON Schema 仕様を見る</summary>
                <pre class="schema-code mt-2">{{ JSON.stringify(tool.inputSchema, null, 2) }}</pre>
              </details>
            </div>
          </div>
        </div>

        <!-- Tab 3: Execution Logs -->
        <div v-if="activeTab === 'logs'" class="tab-pane">
          <div class="level mb-2">
            <div class="level-left">
              <span class="is-size-7 text-muted">WebMCP ツールのリアルタイム呼び出し履歴</span>
            </div>
            <div class="level-right">
              <button class="button is-small is-dark" @click="clearLogs" :disabled="logs.length === 0">
                <span class="icon is-small"><i class="fas fa-trash"></i></span>
                <span>{{ $t('webmcp.clearLogs') }}</span>
              </button>
            </div>
          </div>

          <div v-if="logs.length === 0" class="has-text-centered py-5 text-muted">
            <i class="fas fa-inbox fa-2x mb-2"></i>
            <p>{{ $t('webmcp.noLogs') }}</p>
          </div>

          <div v-else class="logs-container">
            <div 
              v-for="log in logs" 
              :key="log.id" 
              class="box py-2 px-3 mb-2 log-entry"
              :class="log.success ? 'border-success' : 'border-danger'"
            >
              <div class="level is-mobile mb-1">
                <div class="level-left">
                  <span class="tag is-small mr-2" :class="log.success ? 'is-success' : 'is-danger'">
                    {{ log.success ? 'SUCCESS' : 'ERROR' }}
                  </span>
                  <strong class="is-size-7 has-text-white">{{ log.tool }}</strong>
                </div>
                <div class="level-right is-size-7 text-muted">
                  <span>{{ log.executionTimeMs }}ms</span>
                  <span class="ml-2">{{ log.timestamp }}</span>
                </div>
              </div>
              <div class="is-size-7">
                <div v-if="Object.keys(log.input).length > 0" class="mb-1">
                  <span class="has-text-grey">Input:</span>
                  <code class="mini-code ml-1">{{ JSON.stringify(log.input) }}</code>
                </div>
                <div>
                  <span class="has-text-grey">Output:</span>
                  <code class="mini-code ml-1">{{ JSON.stringify(log.output) }}</code>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <footer class="modal-card-foot">
        <button class="button is-dark" @click="close">閉じる</button>
      </footer>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { useWebMCP, type WebMCPTool } from '~/composables/useWebMCP'

const props = defineProps<{
  isOpen: boolean
  tools: WebMCPTool[]
}>()

const emit = defineEmits<{
  (e: 'close'): void
}>()

const { logs, clearLogs, simulateAICommand, runTool } = useWebMCP()

const activeTab = ref<'simulator' | 'tools' | 'logs'>('simulator')
const selectedPrompt = ref('Hitbox配置を読み込んで、すべてのボタンを24mmに変更する')
const isSimulating = ref(false)
const simulationResult = ref<{ steps: string[]; results: any[] } | null>(null)

const samplePrompts = [
  { title: 'Hitbox + 24mm化', prompt: 'Hitboxレイアウトをロードし、ボタンをすべて24mmに変更する' },
  { title: 'HORI Nolva ロード', prompt: 'HORI Nolvaの配置をロードする' },
  { title: '2x4 グリッド作成', prompt: '24mmボタンで2行4列のグリッド配置を作成する' },
  { title: 'ボタン追加 & URL作成', prompt: '右上にExtraボタンを追加して共有URLを出力する' }
]

const close = () => {
  emit('close')
}

const runSimulation = async () => {
  if (!selectedPrompt.value) return
  isSimulating.value = true
  try {
    const result = await simulateAICommand(selectedPrompt.value, props.tools)
    simulationResult.value = result
  } catch (e: any) {
    alert(`シミュレーションエラー: ${e.message || String(e)}`)
  } finally {
    isSimulating.value = false
  }
}

const quickExecute = async (tool: WebMCPTool) => {
  try {
    let dummyInput: any = {}
    if (tool.name === 'load_layout_preset') {
      dummyInput = { presetName: 'pws-type-b' }
    } else if (tool.name === 'add_button') {
      dummyInput = { label: 'QuickTest', diameter: 24, x: 280, y: 180 }
    } else if (tool.name === 'update_button') {
      dummyInput = { id: 1, label: 'Updated' }
    } else if (tool.name === 'remove_button') {
      dummyInput = { id: 1 }
    } else if (tool.name === 'arrange_buttons_grid') {
      dummyInput = { rows: 2, cols: 3, startX: 220, startY: 160 }
    }
    await runTool(tool, dummyInput)
    activeTab.value = 'logs'
  } catch (e: any) {
    alert(`実行エラー: ${e.message || String(e)}`)
  }
}
</script>

<style scoped>
.webmcp-modal-card {
  width: 90%;
  max-width: 780px;
  background-color: #16213e;
  border-radius: 12px;
  border: 1px solid #0f3460;
}

.modal-card-head, .modal-card-foot {
  background-color: #0f3460;
  border-bottom: 1px solid #1a4a7a;
  border-top: 1px solid #1a4a7a;
}

.modal-card-body {
  background-color: #16213e;
  color: #eee;
}

.webmcp-input {
  background-color: #1a1a2e;
  color: #eee;
  border-color: #0f3460;
}

.webmcp-input:focus {
  border-color: #e94560;
}

.tool-card {
  background-color: #1a1a2e;
  border: 1px solid #0f3460;
}

.schema-code {
  background-color: #0f3460;
  color: #4ecca3;
  padding: 8px;
  border-radius: 6px;
  max-height: 160px;
  overflow-y: auto;
}

.log-box {
  background-color: #1a1a2e;
  border: 1px solid #0f3460;
}

.step-item code {
  background-color: #0f3460;
  color: #4ecca3;
}

.log-entry {
  background-color: #1a1a2e;
  border-left: 4px solid #0f3460;
}

.border-success {
  border-left-color: #4ecca3 !important;
}

.border-danger {
  border-left-color: #e94560 !important;
}

.mini-code {
  background-color: #0f3460;
  color: #ddd;
  padding: 1px 4px;
  border-radius: 3px;
  font-size: 0.75rem;
}

.cursor-pointer {
  cursor: pointer;
}

.text-muted {
  color: #aaa;
}

.text-emerald {
  color: #4ecca3;
}

.text-warning {
  color: #f39c12;
}
</style>
