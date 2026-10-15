// 前端唯一聊天通道:原生 fetch 解析 bff 的 SSE 流(text/reasoning/error/finish 事件 + [DONE] 终止标记)。
// 溯源:任务 02(注释体系存量收敛一期,补头注);三代聊天实现 2026-09-10 收敛为单套 fetch 方案(归档决策)
// 约束:走相对路径 /chat 经 vite proxy 转发(生产同域免配置);AbortError 视为用户主动停止,转 onComplete('')

import type { ChatMessage } from '@/types/chat'

export interface StreamCallbacks {
  onToken: (token: string) => void
  onReasoning?: (reasoning: string) => void
  onComplete: (fullText: string) => void
  onError: (error: string) => void
}

export async function chatQwenStream(
  messages: ChatMessage[],
  callbacks: StreamCallbacks,
  model = 'qwen-turbo',
  signal: AbortSignal
) {
  const { onToken, onReasoning, onComplete, onError } = callbacks

  try {
    // 相对路径经 vite proxy('/chat') 转发到 bff（开发），生产同域部署免配置
    const response = await fetch('/chat/qwen/stream', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ messages, model }),
      signal,
    })

    if (!response.ok) {
      const err = await response.json().catch(() => ({ error: `HTTP ${response.status}` }))
      throw new Error(err.error)
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
            onError(event.error)
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
