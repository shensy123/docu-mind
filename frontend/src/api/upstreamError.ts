// 上游错误人话转译(批3.5 D1):把 bff 回传的 {error, kind, hint} 三元组渲染为用户可读文案。
// 溯源:任务书 04(批3.5 反馈修复批)D1 错误分级;kind 分级产自 bff/src/api/upstreamError.ts,双端各持一份文案(bff 回 hint、前端留兜底 map)。
// 约束:三级兜底=bff 人话 hint → 前端 kind 映射 → 「连接失败:原文」;文案不含密钥与内部复合键。

/** kind→用户文案(bff 未回 hint 时的前端兜底,文案与 bff 侧保持一致) */
const ERROR_HINTS: Record<string, string> = {
  auth: 'API Key 无效或已过期，请检查',
  balance: '账户余额不足，请充值后再试',
  forbidden: 'API Key 无权限或账号受限',
  notfound: 'API 地址多半不对，请对照供应商官方端点检查',
  ratelimit: '触发限流或额度耗尽，稍后再试',
  server: '供应商服务波动，稍后再试',
  network: '网络不通或 API 地址无法解析，请检查地址与网络',
}

/** bff 错误响应(JSON body)与聊天 error 事件的最小结构 */
export interface UpstreamErrorPayload {
  error?: string
  kind?: string
  hint?: string
}

/** 三级兜底:bff 人话 hint → 前端 kind 映射 → 原文(前缀「连接失败:」) */
export const toUserFacingError = (payload: UpstreamErrorPayload): string => {
  if (payload.hint) return payload.hint
  const mapped = payload.kind ? ERROR_HINTS[payload.kind] : undefined
  if (mapped) return mapped
  return `连接失败：${payload.error || '未知错误'}`
}
