// 访客供应商模型列表中转（批3「AI 接入可配」MVP）：POST /chat/models，body={baseURL, apiKey} → GET {baseURL}/models。
// 溯源：任务书 2026-11-18 §一之2「获取模型列表/测试连接」——浏览器直连供应商受 CORS 限制，统一经 bff 一次性转发。
// 约束：钥匙仅在本次请求内存中过手、不落盘；上游 401/网络错误转 502 带原文，前端据此提示。

import { type Request, type Response } from "express";
import OpenAI from "openai";

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
    const message = error instanceof Error ? error.message : "模型列表获取失败";
    console.error("模型列表中转错误:", message);
    return res.status(502).json({ error: message });
  }
};
