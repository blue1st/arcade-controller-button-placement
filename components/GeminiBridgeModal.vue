<template>
  <div class="modal" :class="{ 'is-active': isOpen }">
    <div class="modal-background" @click="close"></div>
    <div class="modal-card gemini-modal-card">
      <header class="modal-card-head">
        <p class="modal-card-title has-text-white is-size-5">
          <span class="icon mr-2 text-gemini"><i class="fas fa-robot"></i></span>
          {{ $t('geminiBridge.modalTitle') }}
        </p>
        <button class="delete" aria-label="close" @click="close"></button>
      </header>
      
      <section class="modal-card-body">
        <!-- 説明バナー -->
        <div class="notification is-dark is-outlined mb-4">
          <p class="is-size-7 mb-2">
            <i class="fas fa-info-circle mr-1 text-info"></i>
            {{ $t('geminiBridge.description') }}
          </p>
          <div class="tags has-addons mb-0">
            <span class="tag is-dark">DOM Context Status</span>
            <span class="tag is-success is-light">
              <i class="fas fa-check-circle mr-1"></i> Pre-injected ({{ buttons.length }} buttons)
            </span>
          </div>
        </div>

        <!-- ステップ1: Geminiに指示する -->
        <div class="step-card box mb-4">
          <div class="step-header mb-2 is-flex is-align-items-center">
            <span class="step-number mr-2">1</span>
            <h6 class="title is-6 has-text-white mb-0">{{ $t('geminiBridge.step1Title') }}</h6>
          </div>
          <p class="is-size-7 text-muted mb-3">{{ $t('geminiBridge.step1Desc') }}</p>

          <!-- 指示サンプル -->
          <div class="mb-3">
            <label class="label is-size-7 text-muted mb-1">{{ $t('geminiBridge.quickPrompts') }}</label>
            <div class="buttons are-small mb-2">
              <button 
                class="button is-dark is-rounded" 
                @click="selectedInstruction = $t('geminiBridge.quickPrompt1')"
              >
                <span class="icon is-small text-warning"><i class="fas fa-bolt"></i></span>
                <span>SF6向け</span>
              </button>
              <button 
                class="button is-dark is-rounded" 
                @click="selectedInstruction = $t('geminiBridge.quickPrompt2')"
              >
                <span class="icon is-small text-warning"><i class="fas fa-bolt"></i></span>
                <span>エルゴノミクス</span>
              </button>
              <button 
                class="button is-dark is-rounded" 
                @click="selectedInstruction = $t('geminiBridge.quickPrompt3')"
              >
                <span class="icon is-small text-warning"><i class="fas fa-bolt"></i></span>
                <span>全体シフト</span>
              </button>
            </div>
          </div>

          <!-- プロンプトプレビューとコピー -->
          <div class="prompt-box mb-2">
            <textarea 
              class="textarea is-small prompt-preview-text" 
              rows="3" 
              readonly 
              :value="generatedPrompt"
            ></textarea>
          </div>
          <button class="button is-small is-gemini is-fullwidth" @click="copyPrompt">
            <span class="icon is-small"><i class="fas" :class="isCopied ? 'fa-check' : 'fa-copy'"></i></span>
            <span>{{ isCopied ? $t('geminiBridge.promptCopied') : $t('geminiBridge.copyPrompt') }}</span>
          </button>
        </div>

        <!-- ステップ2: 回答JSONを貼り付けて反映 -->
        <div class="step-card box mb-0">
          <div class="step-header mb-2 is-flex is-justify-content-space-between is-align-items-center">
            <div class="is-flex is-align-items-center">
              <span class="step-number mr-2">2</span>
              <h6 class="title is-6 has-text-white mb-0">{{ $t('geminiBridge.step2Title') }}</h6>
            </div>
            <button class="button is-small is-dark" @click="readFromClipboard">
              <span class="icon is-small"><i class="fas fa-paste"></i></span>
              <span>{{ $t('geminiBridge.readClipboard') }}</span>
            </button>
          </div>

          <div class="field mb-3">
            <div class="control">
              <textarea 
                class="textarea is-small json-input-area" 
                rows="5" 
                v-model="inputRawText" 
                :placeholder="$t('geminiBridge.inputPlaceholder')"
              ></textarea>
            </div>
          </div>

          <!-- パース結果プレビュー -->
          <div v-if="inputRawText.trim()" class="mb-3">
            <div v-if="parsedButtons" class="notification is-success is-light py-2 px-3 mb-2 is-size-7">
              <div class="is-flex is-align-items-center is-justify-content-space-between">
                <div>
                  <i class="fas fa-check-circle mr-1"></i>
                  <span>{{ $t('geminiBridge.buttonsDetected', { count: parsedButtons.length }) }}</span>
                </div>
                <span class="tag is-success is-small">Valid JSON</span>
              </div>
              <!-- ミニプレビューリスト -->
              <div class="tags mt-2 mb-0">
                <span v-for="b in parsedButtons.slice(0, 8)" :key="b.id" class="tag is-dark is-small">
                  {{ b.label || `Btn${b.id}` }} ({{ b.x }}, {{ b.y }})
                </span>
                <span v-if="parsedButtons.length > 8" class="tag is-dark is-small">
                  +{{ parsedButtons.length - 8 }} more
                </span>
              </div>
            </div>
            <div v-else class="notification is-danger is-light py-2 px-3 mb-2 is-size-7">
              <i class="fas fa-exclamation-triangle mr-1"></i>
              <span>{{ $t('geminiBridge.invalidJson') }}</span>
            </div>
          </div>

          <!-- 反映ボタン -->
          <button 
            class="button is-primary is-fullwidth" 
            :disabled="!parsedButtons" 
            @click="applyLayout"
          >
            <span class="icon is-small"><i class="fas fa-check"></i></span>
            <span>{{ $t('geminiBridge.apply') }}</span>
          </button>
        </div>
      </section>

      <footer class="modal-card-foot is-justify-content-flex-end">
        <button class="button is-dark" @click="close">{{ $t('buttonForm.cancel') }}</button>
      </footer>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, watch } from 'vue'
import type { Button } from '~/types/button-types.ts'

const props = defineProps<{
  isOpen: boolean
  buttons: Button[]
}>()

const emit = defineEmits<{
  (e: 'close'): void
  (e: 'update', buttons: Button[]): void
}>()

const { t } = useI18n()

const selectedInstruction = ref('')
const inputRawText = ref('')
const isCopied = ref(false)

// デフォルトの指示文
watch(() => props.isOpen, (newVal) => {
  if (newVal && !selectedInstruction.value) {
    selectedInstruction.value = t('geminiBridge.quickPrompt1')
  }
})

// Geminiに渡すプロンプトの動的生成
const generatedPrompt = computed(() => {
  const currentJson = JSON.stringify(props.buttons.map(b => ({
    id: b.id,
    x: Math.round(b.x),
    y: Math.round(b.y),
    label: b.label,
    diameter: b.diameter
  })), null, 2)

  const instruction = selectedInstruction.value || t('geminiBridge.quickPrompt1')

  return `あなたはアーケードコントローラーの人間工学・配置の専門家です。
現在開いているWebページ（600x400キャンバス）のボタン配置データは以下の通りです:

${currentJson}

【要望】
${instruction}

【制約・出力フォーマット】
- 座標はキャンバス内（x: 30〜570, y: 30〜370）に収めてください。
- 直径（diameter）は24または30を指定してください。
- 必ず以下の形式のJSONコードブロック（\`\`\`json ... \`\`\`）のみを出力してください。余計な解説文は不要です。

\`\`\`json
{
  "app": "arcade-controller-button-placement",
  "version": 1,
  "buttons": [
    { "id": 1, "x": 100, "y": 200, "label": "LP", "diameter": 30 }
  ]
}
\`\`\``
})

// プロンプトをクリップボードにコピー
const copyPrompt = async () => {
  try {
    await navigator.clipboard.writeText(generatedPrompt.value)
    isCopied.value = true
    setTimeout(() => {
      isCopied.value = false
    }, 2500)
  } catch (err) {
    console.error('Failed to copy prompt:', err)
  }
}

// クリップボードから読み込み
const readFromClipboard = async () => {
  try {
    const text = await navigator.clipboard.readText()
    if (text) {
      inputRawText.value = text
    }
  } catch (err) {
    console.error('Failed to read from clipboard:', err)
  }
}

// 寛容なJSONパースロジック
const parsedButtons = computed<Button[] | null>(() => {
  const text = inputRawText.value.trim()
  if (!text) return null

  try {
    // 1. ```json ... ``` または ``` ... ``` マークダウンブロックから抽出
    const mdMatch = text.match(/```(?:json)?\s*([\s\S]*?)\s*```/i)
    const targetText = mdMatch ? mdMatch[1].trim() : text

    // 2. { ... } または [ ... ] の最外殻を抽出
    const jsonMatch = targetText.match(/(\{[\s\S]*\}|\[[\s\S]*\])/)
    if (!jsonMatch) return null

    const data = JSON.parse(jsonMatch[1])
    let rawList: any[] = []

    if (Array.isArray(data)) {
      rawList = data
    } else if (data && typeof data === 'object') {
      if (Array.isArray(data.buttons)) {
        rawList = data.buttons
      } else if (Array.isArray(data.layout)) {
        rawList = data.layout
      }
    }

    if (!rawList || rawList.length === 0) return null

    // 各ボタンのバリデーションと正規化
    const normalized: Button[] = rawList.map((item, index) => ({
      id: Number(item.id) || index + 1,
      x: Number(item.x) || 100,
      y: Number(item.y) || 100,
      label: String(item.label || `B${index + 1}`),
      diameter: Number(item.diameter) === 24 ? 24 : 30
    }))

    return normalized.length > 0 ? normalized : null
  } catch (e) {
    return null
  }
})

// レイアウトを適用
const applyLayout = () => {
  if (parsedButtons.value) {
    emit('update', parsedButtons.value)
    inputRawText.value = ''
    close()
  }
}

const close = () => {
  emit('close')
}

// 親から外部注入可能にする
defineExpose({
  setInputText: (text: string) => {
    inputRawText.value = text
  }
})
</script>

<style scoped>
.gemini-modal-card {
  max-width: 620px;
  width: 95%;
  border-radius: 8px;
  overflow: hidden;
  box-shadow: 0 10px 40px rgba(0, 0, 0, 0.6);
  border: 1px solid rgba(255, 255, 255, 0.1);
}

.modal-card-head {
  background: linear-gradient(135deg, #1f1b2e 0%, #171520 100%);
  border-bottom: 1px solid rgba(255, 255, 255, 0.1);
}

.modal-card-body {
  background-color: #12111a;
  color: #e0e0e0;
}

.modal-card-foot {
  background-color: #171520;
  border-top: 1px solid rgba(255, 255, 255, 0.1);
}

.text-gemini {
  color: #a855f7;
}

.button.is-gemini {
  background: linear-gradient(135deg, #7c3aed 0%, #a855f7 100%);
  color: #fff;
  border: none;
  font-weight: 600;
  transition: all 0.2s ease;
}

.button.is-gemini:hover {
  background: linear-gradient(135deg, #6d28d9 0%, #9333ea 100%);
  color: #fff;
  transform: translateY(-1px);
}

.step-card {
  background-color: #1a1829;
  border: 1px solid rgba(255, 255, 255, 0.08);
  border-radius: 6px;
  padding: 1rem;
}

.step-number {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 22px;
  height: 22px;
  border-radius: 50%;
  background: #7c3aed;
  color: #fff;
  font-size: 0.75rem;
  font-weight: bold;
}

.prompt-preview-text {
  background-color: #0d0c13 !important;
  color: #c4b5fd !important;
  border-color: rgba(168, 85, 247, 0.3) !important;
  font-family: monospace;
  font-size: 0.75rem;
  resize: none;
}

.json-input-area {
  background-color: #0d0c13 !important;
  color: #10b981 !important;
  border-color: rgba(255, 255, 255, 0.15) !important;
  font-family: monospace;
  font-size: 0.8rem;
}

.json-input-area:focus {
  border-color: #7c3aed !important;
}

.text-muted {
  color: #9ca3af;
}

.text-warning {
  color: #fbbf24;
}
</style>
