// 上游(供应商/OpenAI SDK)错误分级(批3.5 D1):解析 error.status/code 映射 7 类 kind + 人话 hint。
// 溯源:任务书 04(批3.5 反馈修复批)D1 错误分级;被 models.ts(探测中转)与 chat.ts(聊天流)共用,错误响应统一 {error, kind, hint}。
// 约束:kind=network 优先于 HTTP 状态判断(连接层失败无 status);hint 为空串(fallback)时前端走兜底「连接失败:原文」;文案不含密钥与内部标识。

import { APIConnectionError } from "openai";

export type UpstreamErrorKind =
  | "auth"
  | "balance"
  | "forbidden"
  | "notfound"
  | "ratelimit"
  | "server"
  | "network"
  | "fallback";

export interface UpstreamErrorInfo {
  /** 原始错误文案(前端兜底展示用) */
  message: string;
  kind: UpstreamErrorKind;
  /** 人话提示;fallback 时空串(前端展示原文) */
  hint: string;
}

// OpenAI SDK 错误的可用形态:APIError.status(HTTP 码);连接失败为 APIConnectionError 实例,
// 网络码(ENOTFOUND 等)藏于 cause[.cause].code(实测 SDK v6 两层 cause),顶层 code/status 均空
type MaybeUpstreamError = {
  status?: unknown;
  code?: unknown;
  message?: unknown;
  cause?: { code?: unknown; cause?: { code?: unknown } | null } | null;
};

// Node/fetch 网络层错误码(SDK 连接失败时携带;UND_ERR 为 undici 内部错误族)
const NETWORK_CODES =
  /^(ENOTFOUND|EAI_AGAIN|ECONNREFUSED|ECONNRESET|ETIMEDOUT|EPIPE|EHOSTUNREACH|ENETUNREACH|UND_ERR)/;

export const classifyUpstreamError = (error: unknown): UpstreamErrorInfo => {
  const e = (error ?? {}) as MaybeUpstreamError;
  const message = typeof e.message === "string" && e.message ? e.message : "上游请求失败";

  // 网络层判定:SDK 连接错误实例(主判),或任意层 cause 携带网络错误码(双保险)
  const netCode = [e.code, e.cause?.code, e.cause?.cause?.code].find(
    (c) => typeof c === "string" && NETWORK_CODES.test(c as string),
  );
  if (error instanceof APIConnectionError || netCode) {
    return { message, kind: "network", hint: "网络不通或 API 地址无法解析，请检查地址与网络" };
  }

  const status = typeof e.status === "number" ? e.status : undefined;
  if (status === 401) return { message, kind: "auth", hint: "API Key 无效或已过期，请检查" };
  if (status === 402) return { message, kind: "balance", hint: "账户余额不足，请充值后再试" };
  if (status === 403) return { message, kind: "forbidden", hint: "API Key 无权限或账号受限" };
  if (status === 404) {
    return { message, kind: "notfound", hint: "API 地址多半不对，请对照供应商官方端点检查" };
  }
  if (status === 429) return { message, kind: "ratelimit", hint: "触发限流或额度耗尽，稍后再试" };
  if (status !== undefined && status >= 500) {
    return { message, kind: "server", hint: "供应商服务波动，稍后再试" };
  }

  return { message, kind: "fallback", hint: "" };
};
