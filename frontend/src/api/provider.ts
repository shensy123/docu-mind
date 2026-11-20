// 访客供应商探测 API(批3 MVP):经 bff 中转拉 {baseURL}/models,规避浏览器直连供应商的 CORS 限制。
// 溯源:任务书 2026-11-18 §一之2「获取模型列表」(批3.5 A2 合并原「测试连接」为单路径)。
// 约束:走相对路径 /chat 经 vite proxy 转发(同聊天通道);钥匙随请求发 bff、仅过内存不落盘;
// 错误经 toUserFacingError 转人话(批3.5 D1,bff 回 {error, kind, hint})。

import { toUserFacingError, type UpstreamErrorPayload } from './upstreamError'

export async function fetchProviderModels(baseURL: string, apiKey: string): Promise<string[]> {
  const response = await fetch('/chat/models', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ baseURL, apiKey }),
  })

  const data = (await response.json().catch(() => ({}))) as UpstreamErrorPayload & {
    models?: string[]
  }
  if (!response.ok) {
    throw new Error(toUserFacingError(data))
  }
  return data.models || []
}
