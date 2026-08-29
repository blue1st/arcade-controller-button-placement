<template>
  <div class="modal" :class="{ 'is-active': isOpen }">
    <div class="modal-background" @click="close"></div>
    <div class="modal-card guide-modal-card">
      <header class="modal-card-head">
        <p class="modal-card-title has-text-white">
          <span class="icon mr-2"><i class="fas fa-microchip"></i></span>
          {{ $t('webmcp.guideTitle') }}
        </p>
        <button class="delete" aria-label="close" @click="close"></button>
      </header>

      <section class="modal-card-body">
        <!-- 概要 -->
        <div class="notification is-dark is-outlined mb-4">
          <h5 class="title is-6 has-text-white mb-2">
            <i class="fas fa-sparkles text-warning mr-2"></i>WebMCP (Web Model Context Protocol) とは？
          </h5>
          <p class="is-size-7 mb-2">
            WebMCP は W3C および Google Chrome チーム主導の最新 Web 標準 ([Chrome for Developers Documentation](https://developer.chrome.com/docs/ai/webmcp?hl=ja), [webmcp.dev](https://webmcp.dev/)) です。
          </p>
          <p class="is-size-7">
            AI エージェントが画面のスクリーンショット解析や DOM の「クリック位置推測」を行う代わりに、Web アプリが機械読み取り可能な<strong>「構造化ツール (Tools)」</strong>を直に公開し、確実・高速に操作・自動化を行える仕組みです。
          </p>
        </div>

        <!-- 恩恵の説明 -->
        <div class="box guide-box mb-4">
          <h5 class="title is-6 text-emerald mb-3">
            <i class="fas fa-bullseye mr-2"></i>このアケコン配置ツールで得られる 4 大メリット
          </h5>
          <ul class="benefit-list is-size-7">
            <li>
              <strong class="has-text-white">1. 自然言語での完全自動アケコンレイアウト作成:</strong>
              「24mmボタンでHitbox風の配置を作成して」「右側にExtraボタンを追加して」などの音声・テキスト指示だけでボタン位置が完璧に描画されます。
            </li>
            <li>
              <strong class="has-text-white">2. 画素ズレ・DOM構造変化の影響を受けない正確なCAD操作:</strong>
              画面解像度やボタン配置のピクセル座標をAIが直に計算・指定するため、1mm単位で正確な配置変更が可能です。
            </li>
            <li>
              <strong class="has-text-white">3. 一括操作とパラメータの一括変更:</strong>
              「すべてのボタンを30mmから24mmに変更する」「2行4列のグリッドを作る」といった複数操作をAIが安全に一括実行します。
            </li>
            <li>
              <strong class="has-text-white">4. 瞬時のURL共有出力:</strong>
              作成した配置からLZ圧縮済みの共有URLをAIが自動生成してユーザーに返却できます。
            </li>
          </ul>
        </div>

        <!-- 検証手段 (3つの方法) -->
        <h5 class="title is-6 has-text-white mb-3">
          <i class="fas fa-vial mr-2"></i>WebMCP 対応の恩恵を確認する 3 つの手段
        </h5>

        <div class="method-card mb-3">
          <div class="method-header">
            <span class="tag is-primary mr-2">方法 1</span>
            <strong>アプリ内「AI / WebMCP デバッガー」で即座に体験 (おすすめ)</strong>
          </div>
          <div class="method-body is-size-7">
            ヘッダーの「AI / WebMCP デバッガー」ボタンを押すと、登録されたツール一覧やシミュレーターが開きます。サンプル指示（例：「Hitbox配置をロードし全ボタンを24mmに変更」）を選択して実行すると、AIがどのツールを呼んで配置が更新されたかをログ付きで確認できます。
          </div>
        </div>

        <div class="method-card mb-3">
          <div class="method-header">
            <span class="tag is-info mr-2">方法 2</span>
            <strong>ブラウザ開発者ツール (DevTools Console) での確認</strong>
          </div>
          <div class="method-body is-size-7">
            <code>F12</code> キー（または <code>Cmd+Option+I</code>）で開発者コンソールを開き、以下を実行できます:
            <pre class="console-code mt-2">// 登録されているツール一覧を確認
window.WebMCP.getTools()

// ボタン追加ツールを直接プログラム呼び出し
window.WebMCP.executeTool('add_button', { label: 'TestAI', diameter: 24, x: 300, y: 120 })</pre>
          </div>
        </div>

        <div class="method-card mb-3">
          <div class="method-header">
            <span class="tag is-warning mr-2">方法 3</span>
            <strong>Chrome Flag / WebMCP 拡張機能 / Claude Desktop 連携</strong>
          </div>
          <div class="method-body is-size-7">
            Chrome 146+ の試験運用フラグ (<code>chrome://flags/#enable-experimental-web-platform-features</code> または WebMCP 拡張機能) を有効にすると、<code>navigator.modelContext</code> 経由でブラウザ内AIエージェントや Claude Desktop (<code>npx @jason.today/webmcp --mcp</code>) から本アプリを操作できます。
          </div>
        </div>
      </section>

      <footer class="modal-card-foot">
        <button class="button is-primary" @click="close">理解した / 閉じる</button>
      </footer>
    </div>
  </div>
</template>

<script setup lang="ts">
defineProps<{
  isOpen: boolean
}>()

const emit = defineEmits<{
  (e: 'close'): void
}>()

const close = () => {
  emit('close')
}
</script>

<style scoped>
.guide-modal-card {
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

.guide-box {
  background-color: #1a1a2e;
  border: 1px solid #0f3460;
}

.benefit-list {
  list-style-type: none;
  padding-left: 0;
}

.benefit-list li {
  margin-bottom: 8px;
  line-height: 1.5;
}

.method-card {
  background-color: #1a1a2e;
  border: 1px solid #0f3460;
  border-radius: 8px;
  overflow: hidden;
}

.method-header {
  background-color: #0f3460;
  padding: 8px 12px;
  color: #eee;
  display: flex;
  align-items: center;
  font-size: 0.85rem;
}

.method-body {
  padding: 12px;
  color: #ccc;
}

.console-code {
  background-color: #0d1b2a;
  color: #4ecca3;
  padding: 8px;
  border-radius: 4px;
}

.text-warning {
  color: #f39c12;
}

.text-emerald {
  color: #4ecca3;
}
</style>
