// src/api/sessions.ts
//【存储会话】方案三：后端存储（企业级推荐）。
// bff 端实现：bff/src/api/sessions.ts（路由）+ bff/src/db.ts（SQLite 存储层，设计源 bff/src/sql/tables.sql）
// 注意：sessionAPI 目前尚未接入现役聊天链路（现役持久化仍为 localStorage），接入属后续迁移决策
import request from '@/utils/request'

export interface SessionCreatePayload {
  title?: string
  modelKey?: string
  userId?: string
}

export interface SessionMessagePayload {
  role: 'user' | 'assistant' | 'system'
  content: string
  reasoning?: string
  error?: boolean
  interrupted?: boolean
  tokenCount?: number
}

export const sessionAPI = {
  list: () => request.get('/sessions'),
  getMessages: (id: string) => request.get(`/sessions/${id}/messages`),
  create: (data: SessionCreatePayload) => request.post('/sessions', data),
  addMessage: (id: string, msg: SessionMessagePayload) =>
    request.post(`/sessions/${id}/messages`, msg),
  delete: (id: string) => request.delete(`/sessions/${id}`),
}
