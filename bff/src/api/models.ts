// 访客供应商模型列表中转（批3「AI 接入可配」MVP）：POST /chat/models，body={baseURL, apiKey} → GET {baseURL}/models。
// 溯源：任务书 2026-11-18 §一之2「获取模型列表/测试连接」——浏览器直连供应商受 CORS 限制，统一经 bff 一次性转发。
// 约束：钥匙仅在本次请求内存中过手、不落盘；上游错误经 classifyUpstreamError 分级后转 502 回 {error, kind, hint}（批3.5 D1）。

import { type Request, type Response } from "express";
import OpenAI from "openai";
import { classifyUpstreamError } from "./upstreamError.ts";

export const listModels = async (req: Request, res: Response) => {
  const { baseURL, apiKey } = req.body as { baseURL?: string; apiKey?: string };

  if (
    typeof baseURL !== "string" ||
    !baseURL.trim() ||
    typeof apiKey !== "string" ||
    !apiKey.trim()
  ) {
    return res.status(400).json({ error: "baseURL 与 apiKey 不能为空" });
  }

  try {
    const client = new OpenAI({ apiKey, baseURL });
    const page = await client.models.list();
    const models: string[] = [];
    for await (const item of page) {
      if (item.id) models.push(item.id);
    }
    models.sort();
    return res.json({ models });
  } catch (error: unknown) {
    // D1(批3.5):分级回传,前端优先消费 hint(人话),fallback 时展示原文
    const info = classifyUpstreamError(error);
    console.error("模型列表中转错误:", info.message, `(kind=${info.kind})`);
    return res.status(502).json({ error: info.message, kind: info.kind, hint: info.hint });
  }
};
