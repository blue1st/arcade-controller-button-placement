import { defineNuxtPlugin } from '#app'
import { useWebMCP, type WebMCPTool } from '~/composables/useWebMCP'

export default defineNuxtPlugin((nuxtApp) => {
  if (process.server) return

  const webmcp = useWebMCP()

  // window.WebMCP グローバルオブジェクトの設定
  const registeredTools = ref<WebMCPTool[]>([])

  const registerWebMCP = (tools: WebMCPTool[]) => {
    registeredTools.value = tools

    // 1. W3C / Chrome Built-in WebMCP standard interface registration
    const targetModelContext =
      (navigator as any).modelContext || (document as any).modelContext

    if (targetModelContext && typeof targetModelContext.registerTool === 'function') {
      tools.forEach(tool => {
        try {
          targetModelContext.registerTool({
            name: tool.name,
            description: tool.description,
            inputSchema: tool.inputSchema,
            execute: async (input: any) => {
              return await webmcp.runTool(tool, input)
            }
          })
        } catch (e) {
          console.warn(`[WebMCP] Native tool registration warning for ${tool.name}:`, e)
        }
      })
      webmcp.isWebMCPSupported.value = true
    } else {
      webmcp.isWebMCPSupported.value = false
    }

    // 2. Global window.WebMCP DevTools / Bridge interface
    ;(window as any).WebMCP = {
      isNativeSupported: webmcp.isWebMCPSupported.value,
      getTools: () => tools.map(t => ({
        name: t.name,
        description: t.description,
        inputSchema: t.inputSchema
      })),
      executeTool: async (name: string, input: any = {}) => {
        const tool = tools.find(t => t.name === name)
        if (!tool) {
          throw new Error(`[WebMCP] Tool '${name}' not found. Available: ${tools.map(t => t.name).join(', ')}`)
        }
        return await webmcp.runTool(tool, input)
      },
      simulateAICommand: async (prompt: string) => {
        return await webmcp.simulateAICommand(prompt, tools)
      }
    }
  }

  return {
    provide: {
      webmcp: {
        registerTools: registerWebMCP,
        registeredTools
      }
    }
  }
})
