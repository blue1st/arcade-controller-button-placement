import { ref, readonly } from 'vue'
import type { Button } from '~/types/button-types'
import { buttonLayouts } from '~/components/button-layouts'
import { compressToBase64 } from 'lz-string'

export interface WebMCPTool {
  name: string
  description: string
  inputSchema: Record<string, any>
  execute: (input: any) => Promise<any>
}

export interface WebMCPLog {
  id: string
  timestamp: string
  tool: string
  input: any
  output: any
  success: boolean
  executionTimeMs: number
}

const logs = ref<WebMCPLog[]>([])

export const useWebMCP = () => {
  const isWebMCPSupported = ref(false)

  // ログの追加
  const addLog = (tool: string, input: any, output: any, success: boolean, executionTimeMs: number) => {
    logs.value.unshift({
      id: Math.random().toString(36).substring(2, 9),
      timestamp: new Date().toLocaleTimeString(),
      tool,
      input,
      output,
      success,
      executionTimeMs
    })
    if (logs.value.length > 50) {
      logs.value.pop()
    }
  }

  const clearLogs = () => {
    logs.value = []
  }

  // WebMCPツールのハンドラー群作成
  const createTools = (
    getButtons: () => Button[],
    setButtons: (buttons: Button[]) => void,
    loadPreset: (name: string) => Promise<void>
  ): WebMCPTool[] => {
    return [
      {
        name: 'get_current_layout',
        description: 'Get details of all buttons currently on the canvas, including ID, coordinates (x,y), label, diameter, and total button count.',
        inputSchema: {
          type: 'object',
          properties: {},
          required: []
        },
        execute: async () => {
          const current = getButtons()
          return {
            canvasWidth: 600,
            canvasHeight: 400,
            buttonCount: current.length,
            buttons: current
          }
        }
      },
      {
        name: 'get_preset_list',
        description: 'Get list of available arcade controller preset layouts (e.g. default, basic-lever, hori-nolva, pws-type-b, etc.).',
        inputSchema: {
          type: 'object',
          properties: {},
          required: []
        },
        execute: async () => {
          return {
            presets: buttonLayouts.map(l => ({
              name: l.name,
              label: l.label,
              hasLever: (l as any).hasLever || false,
              amazonLink: (l as any).amazonLink || null
            }))
          }
        }
      },
      {
        name: 'load_layout_preset',
        description: 'Load a standard arcade controller button layout preset by name (e.g., "default", "basic-lever", "hori-nolva", "rushbox").',
        inputSchema: {
          type: 'object',
          properties: {
            presetName: {
              type: 'string',
              description: 'Name of the layout preset (e.g., "default", "basic-lever", "hori-nolva", "rushbox", "pws-type-b")'
            }
          },
          required: ['presetName']
        },
        execute: async (input: { presetName: string }) => {
          const preset = buttonLayouts.find(l => l.name === input.presetName)
          if (!preset) {
            throw new Error(`Preset layout '${input.presetName}' not found. Available presets: ${buttonLayouts.map(l => l.name).join(', ')}`)
          }
          await loadPreset(input.presetName)
          return {
            message: `Successfully loaded preset '${preset.label}'`,
            buttons: getButtons()
          }
        }
      },
      {
        name: 'add_button',
        description: 'Add a new button to the controller placement canvas with specified coordinates, label, and diameter (24 or 30mm).',
        inputSchema: {
          type: 'object',
          properties: {
            label: { type: 'string', description: 'Label text written on the button (e.g., "P1", "K1", "Up", "Option")' },
            diameter: { type: 'number', enum: [24, 30], description: 'Button diameter in mm (24 or 30)' },
            x: { type: 'number', description: 'X coordinate on canvas (10-590)' },
            y: { type: 'number', description: 'Y coordinate on canvas (10-390)' }
          },
          required: ['label', 'x', 'y']
        },
        execute: async (input: { label: string; diameter?: number; x: number; y: number }) => {
          const current = getButtons()
          const newId = current.length > 0 ? Math.max(...current.map(b => b.id)) + 1 : 1
          const newButton: Button = {
            id: newId,
            label: input.label,
            diameter: input.diameter || 30,
            x: Math.max(10, Math.min(590, input.x)),
            y: Math.max(10, Math.min(390, input.y))
          }
          const updated = [...current, newButton]
          setButtons(updated)
          return {
            message: `Added button #${newId} ('${newButton.label}')`,
            addedButton: newButton,
            totalButtons: updated.length
          }
        }
      },
      {
        name: 'update_button',
        description: 'Update parameters (label, diameter, x/y position) of an existing button by its ID.',
        inputSchema: {
          type: 'object',
          properties: {
            id: { type: 'number', description: 'ID of the button to modify' },
            label: { type: 'string', description: 'New label text' },
            diameter: { type: 'number', enum: [24, 30], description: 'New diameter in mm' },
            x: { type: 'number', description: 'New X position' },
            y: { type: 'number', description: 'New Y position' }
          },
          required: ['id']
        },
        execute: async (input: { id: number; label?: string; diameter?: number; x?: number; y?: number }) => {
          const current = getButtons()
          const index = current.findIndex(b => b.id === input.id)
          if (index === -1) {
            throw new Error(`Button with ID ${input.id} does not exist.`)
          }
          const updatedButtons = current.map(b => {
            if (b.id !== input.id) return b
            return {
              ...b,
              label: input.label !== undefined ? input.label : b.label,
              diameter: input.diameter !== undefined ? input.diameter : b.diameter,
              x: input.x !== undefined ? Math.max(10, Math.min(590, input.x)) : b.x,
              y: input.y !== undefined ? Math.max(10, Math.min(390, input.y)) : b.y
            }
          })
          setButtons(updatedButtons)
          return {
            message: `Updated button #${input.id}`,
            updatedButton: updatedButtons[index]
          }
        }
      },
      {
        name: 'remove_button',
        description: 'Remove a button from the placement canvas by its ID.',
        inputSchema: {
          type: 'object',
          properties: {
            id: { type: 'number', description: 'ID of the button to remove' }
          },
          required: ['id']
        },
        execute: async (input: { id: number }) => {
          const current = getButtons()
          const filtered = current.filter(b => b.id !== input.id)
          if (filtered.length === current.length) {
            throw new Error(`Button with ID ${input.id} was not found.`)
          }
          setButtons(filtered)
          return {
            message: `Removed button #${input.id}`,
            remainingCount: filtered.length
          }
        }
      },
      {
        name: 'clear_all_buttons',
        description: 'Clear all buttons from the arcade controller layout canvas.',
        inputSchema: {
          type: 'object',
          properties: {},
          required: []
        },
        execute: async () => {
          setButtons([])
          return { message: 'All buttons cleared successfully.' }
        }
      },
      {
        name: 'arrange_buttons_grid',
        description: 'Arrange buttons in a structured grid pattern (e.g. 2 rows x 4 columns).',
        inputSchema: {
          type: 'object',
          properties: {
            rows: { type: 'number', description: 'Number of rows' },
            cols: { type: 'number', description: 'Number of columns' },
            startX: { type: 'number', description: 'Starting X position (e.g. 200)' },
            startY: { type: 'number', description: 'Starting Y position (e.g. 150)' },
            spacingX: { type: 'number', description: 'Horizontal spacing between buttons (default: 45)' },
            spacingY: { type: 'number', description: 'Vertical spacing between buttons (default: 45)' },
            diameter: { type: 'number', enum: [24, 30], description: 'Button diameter (default: 30)' },
            labelPrefix: { type: 'string', description: 'Prefix for button labels (e.g., "B")' }
          },
          required: ['rows', 'cols']
        },
        execute: async (input: {
          rows: number
          cols: number
          startX?: number
          startY?: number
          spacingX?: number
          spacingY?: number
          diameter?: number
          labelPrefix?: string
        }) => {
          const startX = input.startX || 220
          const startY = input.startY || 150
          const spacingX = input.spacingX || 45
          const spacingY = input.spacingY || 45
          const diameter = input.diameter || 30
          const prefix = input.labelPrefix || 'P'

          const newButtons: Button[] = []
          let idCount = 1

          for (let r = 0; r < input.rows; r++) {
            for (let c = 0; c < input.cols; c++) {
              newButtons.push({
                id: idCount,
                label: `${prefix}${idCount}`,
                diameter,
                x: startX + c * spacingX,
                y: startY + r * spacingY
              })
              idCount++
            }
          }
          setButtons(newButtons)
          return {
            message: `Created grid of ${input.rows}x${input.cols} buttons (${newButtons.length} total)`,
            buttons: newButtons
          }
        }
      },
      {
        name: 'export_layout_url',
        description: 'Generate LZ-compressed URL for sharing or embedding the current arcade controller button placement.',
        inputSchema: {
          type: 'object',
          properties: {},
          required: []
        },
        execute: async () => {
          const current = getButtons()
          const buttonsData = JSON.stringify(current.map(({ id, ...button }) => button))
          const compressed = compressToBase64(buttonsData)
          const shareUrl = `${window.location.origin}${window.location.pathname}?data=${compressed}`
          return {
            shareUrl,
            compressedLength: compressed.length,
            buttonCount: current.length
          }
        }
      }
    ]
  }

  // ツール実行ラッパー (ログ記録含む)
  const runTool = async (tool: WebMCPTool, input: any) => {
    const startTime = performance.now()
    try {
      const result = await tool.execute(input)
      const executionTimeMs = Math.round(performance.now() - startTime)
      addLog(tool.name, input, result, true, executionTimeMs)
      return {
        content: [
          {
            type: 'text',
            text: JSON.stringify(result, null, 2)
          }
        ]
      }
    } catch (err: any) {
      const executionTimeMs = Math.round(performance.now() - startTime)
      const errResult = { error: err.message || String(err) }
      addLog(tool.name, input, errResult, false, executionTimeMs)
      throw err
    }
  }

  // AI自然言語コマンドのシミュレーション実行エンジン
  const simulateAICommand = async (
    prompt: string,
    tools: WebMCPTool[]
  ): Promise<{ steps: string[]; results: any[] }> => {
    const steps: string[] = []
    const results: any[] = []
    const lower = prompt.toLowerCase()

    const findTool = (name: string) => tools.find(t => t.name === name)

    // 1. プリセット判定
    if (lower.includes('hori') || lower.includes('nolva')) {
      const tool = findTool('load_layout_preset')
      if (tool) {
        steps.push('Tool Call: load_layout_preset({ presetName: "hori-nolva" })')
        const r = await runTool(tool, { presetName: 'hori-nolva' })
        results.push(r)
      }
    } else if (lower.includes('hitbox') || lower.includes('pws') || lower.includes('stickless')) {
      const tool = findTool('load_layout_preset')
      if (tool) {
        steps.push('Tool Call: load_layout_preset({ presetName: "pws-type-b" })')
        const r = await runTool(tool, { presetName: 'pws-type-b' })
        results.push(r)
      }
    } else if (lower.includes('lever') || lower.includes('レバー')) {
      const tool = findTool('load_layout_preset')
      if (tool) {
        steps.push('Tool Call: load_layout_preset({ presetName: "basic-lever" })')
        const r = await runTool(tool, { presetName: 'basic-lever' })
        results.push(r)
      }
    } else if (lower.includes('clear') || lower.includes('クリア') || lower.includes('全削除')) {
      const tool = findTool('clear_all_buttons')
      if (tool) {
        steps.push('Tool Call: clear_all_buttons({})')
        const r = await runTool(tool, {})
        results.push(r)
      }
    } else if (lower.includes('grid') || lower.includes('グリッド') || lower.includes('2x4') || lower.includes('配列')) {
      const tool = findTool('arrange_buttons_grid')
      if (tool) {
        steps.push('Tool Call: arrange_buttons_grid({ rows: 2, cols: 4, startX: 200, startY: 150, diameter: 24 })')
        const r = await runTool(tool, { rows: 2, cols: 4, startX: 200, startY: 150, diameter: 24 })
        results.push(r)
      }
    }

    // 2. 直径変更判定 (例: 「全ボタンを24mmに変更」)
    if (lower.includes('24mm') || lower.includes('24φ') || lower.includes('24ミリ')) {
      const getTool = findTool('get_current_layout')
      const updateTool = findTool('update_button')
      if (getTool && updateTool) {
        const layoutRes = await getTool.execute({})
        for (const b of layoutRes.buttons) {
          if (b.diameter !== 24) {
            steps.push(`Tool Call: update_button({ id: ${b.id}, diameter: 24 })`)
            const r = await runTool(updateTool, { id: b.id, diameter: 24 })
            results.push(r)
          }
        }
      }
    } else if (lower.includes('30mm') || lower.includes('30φ') || lower.includes('30ミリ')) {
      const getTool = findTool('get_current_layout')
      const updateTool = findTool('update_button')
      if (getTool && updateTool) {
        const layoutRes = await getTool.execute({})
        for (const b of layoutRes.buttons) {
          if (b.diameter !== 30) {
            steps.push(`Tool Call: update_button({ id: ${b.id}, diameter: 30 })`)
            const r = await runTool(updateTool, { id: b.id, diameter: 30 })
            results.push(r)
          }
        }
      }
    }

    // 3. 追加ボタン判定 (例: 「右側にExtraボタンを追加」)
    if (lower.includes('add') || lower.includes('追加') || lower.includes('extra') || lower.includes('ボタン追加')) {
      const addTool = findTool('add_button')
      if (addTool) {
        steps.push('Tool Call: add_button({ label: "Extra", diameter: 24, x: 500, y: 150 })')
        const r = await runTool(addTool, { label: 'Extra', diameter: 24, x: 500, y: 150 })
        results.push(r)
      }
    }

    // 4. URL出力判定
    if (lower.includes('url') || lower.includes('share') || lower.includes('共有')) {
      const exportTool = findTool('export_layout_url')
      if (exportTool) {
        steps.push('Tool Call: export_layout_url({})')
        const r = await runTool(exportTool, {})
        results.push(r)
      }
    }

    if (steps.length === 0) {
      // デフォルトデモアクション
      const addTool = findTool('add_button')
      if (addTool) {
        steps.push('Tool Call: add_button({ label: "AI_BTN", diameter: 24, x: 300, y: 100 })')
        const r = await runTool(addTool, { label: 'AI_BTN', diameter: 24, x: 300, y: 100 })
        results.push(r)
      }
    }

    return { steps, results }
  }

  return {
    logs: readonly(logs),
    addLog,
    clearLogs,
    createTools,
    runTool,
    simulateAICommand,
    isWebMCPSupported
  }
}
