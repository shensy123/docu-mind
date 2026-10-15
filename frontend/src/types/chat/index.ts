export interface BasicSession {
  id: string
  title: string
  updatedTime?: Date
}

export interface ChatMessage {
  role: 'user' | 'assistant'
  content: string
  time?: Date
  reasoning?: string | undefined
  error?: boolean // 是否是错误消息
  interrupted?: boolean // 是否被中断
}

export interface SessionItem extends BasicSession {
  messages: ChatMessage[]
  modelKey: string
}
