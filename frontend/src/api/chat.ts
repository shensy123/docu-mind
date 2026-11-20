// 前端唯一聊天通道:原生 fetch 解析 bff 的 SSE 流(text/reasoning/error/finish 事件 + [DONE] 终止标记)。
// 溯源:任务 02(注释体系存量收敛一期,补头注);三代聊天实现 2026-09-10 收敛为单套 fetch 方案(归档决策);
// 批3「AI 接入可配」MVP(2026-11-18)加可选 passthrough(访客自配供应商,bff 按透传头直连,无则 env 默认)
// 约束:走相对路径 /chat 经 vite proxy 转发(生产同域免配置);AbortError 视为用户主动停止,转 onComplete('');
// 路径 /chat/stream(批3.5 U1 由 /chat/qwen/stream 改名);error 事件经 toUserFacingError 转人话(批3.5 D1)

import type { ChatMessage } from '@/types/chat'
import type { AiPassthrough } from '@/composables/useAiModel'
import { toUserFacingError, type UpstreamErrorPayload } from './upstreamError'

export interface StreamCallbacks {
  onToken: (token: string) => void
  onReasoning?: (reasoning: string) => void
  onComplete: (fullText: string) => void
  onError: (error: string) => void
}

export async function chatQwenStream(
  messages: ChatMessage[],
  callbacks: StreamCallbacks,
  model = 'qwen3.8-flash',
  signal: AbortSignal,
  passthrough?: AiPassthrough | null
) {
  const { onToken, onReasoning, onComplete, onError } = callbacks

  try {
    // 访客透传头:有 passthrough 才携带(钥匙随请求发 bff、仅过内存);无则请求与改造前逐字节一致
    const headers: Record<string, string> = { 'Content-Type': 'application/json' }
    if (passthrough) {
      headers['x-ai-baseURL'] = passthrough.baseURL
      headers['x-ai-key'] = passthrough.apiKey
      headers['x-ai-model'] = passthrough.model
    }
    // 相对路径经 vite proxy('/chat') 转发到 bff（开发），生产同域部署免配置
    const response = await fetch('/chat/stream', {
      method: 'POST',
      headers,
      body: JSON.stringify({ messages, model }),
      signal,
    })

    if (!response.ok) {
      const err = (await response.json().catch(() => ({
        error: `HTTP ${response.status}`,
      }))) as UpstreamErrorPayload
      throw new Error(toUserFacingError(err))
    }

    const reader = response.body?.getReader()
    if (!reader) throw new Error('浏览器不支持流式读取')

    const decoder = new TextDecoder()
    let buffer = ''
    let fullText = ''

    while (true) {
      const { done, value } = await reader.read()
      if (done) break

      buffer += decoder.decode(value, { stream: true })
      const lines = buffer.split('\n')
      buffer = lines.pop() || ''

      for (const line of lines) {
        const trimmed = line.trim()
        if (!trimmed || !trimmed.startsWith('data: ')) continue

        const dataStr = trimmed.slice(6).trim()
        if (dataStr === '[DONE]') {
          onComplete(fullText)
          return
        }

        try {
          const event = JSON.parse(dataStr)

          if (event.type === 'text') {
            fullText += event.content
            onToken(event.content)
          } else if (event.type === 'reasoning') {
            onReasoning?.(event.content)
          } else if (event.type === 'error') {
            // D1(批3.5):error 事件带 {error, kind, hint},转人话后再上报
            onError(toUserFacingError(event as UpstreamErrorPayload))
            return
          }
        } catch {
          // 忽略解析失败的行
        }
      }
    }

    onComplete(fullText)
  } catch (error: unknown) {
    if (error instanceof DOMException && error.name === 'AbortError') {
      onComplete('') // 用户主动停止
      return
    }
    onError(error instanceof Error ? error.message : '流式请求失败')
  }
}
