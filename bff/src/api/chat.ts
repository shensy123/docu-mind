// 多模型流式聊天代理：按 model key 映射各 AI 提供商（OpenAI 兼容模式）并转发 SSE 流。
// 溯源：任务 02（注释体系存量收敛一期，补头注）；批3「AI 接入可配」MVP（2026-11-18）加访客配置透传
// 约束：modelConfigs 的 key 与前端 types/chat/aiModel.ts 的 AI_MODEL_LIST 对齐（新增模型须两处同步）；
// 密钥经 dotenv 读 .env.local，依赖 cwd=bff/（npm workspace 脚本保证）；
// 访客透传头（x-ai-baseURL/x-ai-key/x-ai-model）只随请求过内存、不落盘，无透传头时 env 默认行为不变（零回归）

import { type Request, type Response } from "express";
import OpenAI from "openai";

import dotenv from "dotenv";
// 注意：相对路径依赖 cwd=bff/（npm workspace 脚本已保证，勿从其他目录直接启动）
dotenv.config({ path: ".env.local" });

// ---------- 多模型配置（key 与前端 types/chat/aiModel.ts 的 AI_MODEL_LIST 对齐） ----------
// 扩展新模型：在 .env.local 增配 <PREFIX>_API_BASE_URL / <PREFIX>_API_KEY 后在此登记
// 2026-11-05 模型轮换：qwen-turbo/qwen-max（旧代、无免费额度）→ 百炼系 10 模型
// （各 100 万 Token 限免 90 天，官方价格文档 help.aliyun.com/zh/model-studio/model-pricing）；
// 第三方模型（DeepSeek/Kimi/GLM/MiniMax）经百炼聚合渠道调用，统一走 DASHSCOPE_API_KEY
const DASHSCOPE_BASE = "https://dashscope.aliyuncs.com/compatible-mode/v1";
const dashscope = () => ({ baseURL: DASHSCOPE_BASE, apiKey: process.env.DASHSCOPE_API_KEY || "" });
const modelConfigs: Record<string, { baseURL: string; apiKey: string }> = {
  // 千问系
  "qwen3.8-max": dashscope(),
  "qwen3.8-flash": dashscope(),
  "qwen3.7-plus": dashscope(),
  "qwen3.7-flash": dashscope(),
  // DeepSeek 系（百炼渠道）
  "deepseek-v4-pro": dashscope(),
  "deepseek-v4.1-flash": dashscope(),
  // Kimi 系（百炼渠道）
  "kimi-k3": dashscope(),
  "kimi-k2.7-code": dashscope(),
  // GLM / MiniMax（百炼渠道）
  "glm-5.3": dashscope(),
  "MiniMax-M2.5": dashscope(),
  // 旧代千问兼容条目（2026-11-05 用户追认保留：历史会话 modelKey 回填防 400；不再进前端下拉）
  "qwen-turbo": dashscope(),
  "qwen-max": dashscope(),
  // 独立渠道存量（不破坏既有 .env 配置）
  "deepseek-chat": {
    baseURL: process.env.DEEPSEEK_API_BASE_URL || "https://api.deepseek.com/v1",
    apiKey: process.env.DEEPSEEK_API_KEY || "",
  },
  "doubao-pro-4k": {
    baseURL: process.env.DOUBAO_API_BASE_URL || "",
    apiKey: process.env.DOUBAO_API_KEY || "",
  },
};

export const chatQwenStream = async (req: Request, res: Response) => {
  const { messages, model = "qwen3.8-flash" } = req.body;

  if (!Array.isArray(messages) || messages.length === 0) {
    return res.status(400).json({ error: "messages 不能为空" });
  }

  // 访客配置透传(批3「AI 接入可配」MVP):可选请求头 x-ai-baseURL / x-ai-key / x-ai-model。
  // 有 baseURL+key → 用访客配置建 client 直连其供应商(访客模型不查 modelConfigs);无 → 走下方 env 默认(行为与改造前逐字节一致)
  const passthroughBaseURL = req.header("x-ai-baseURL");
  const passthroughKey = req.header("x-ai-key");
  const passthroughModel = req.header("x-ai-model");
  const hasPassthrough = Boolean(passthroughBaseURL && passthroughKey);

  let upstreamBaseURL: string;
  let upstreamApiKey: string;
  // 发给上游的 model:透传时优先 x-ai-model 头,缺省回落 body.model
  const upstreamModel = hasPassthrough ? passthroughModel || model : model;

  if (hasPassthrough) {
    upstreamBaseURL = passthroughBaseURL as string;
    upstreamApiKey = passthroughKey as string;
  } else {
    const config = modelConfigs[model];
    if (!config) {
      return res.status(400).json({ error: `不支持的模型: ${model}` });
    }
    upstreamBaseURL = config.baseURL;
    upstreamApiKey = config.apiKey;
  }

  // 设置 SSE 响应头
  res.setHeader("Content-Type", "text/event-stream");
  res.setHeader("Cache-Control", "no-cache");
  res.setHeader("Connection", "keep-alive");
  res.setHeader("X-Accel-Buffering", "no"); // 禁用 nginx 缓存

  // 客户端断开时立即结束响应（避免上游继续生成浪费 token）
  // 2026-11-05 修复：Node 16.9+ 的 req 'close' 在请求体消费完即触发（不再等连接断开），
  // 导致 closed 秒置真、流式响应被提前掐死（0 字节）——改监听底层 socket 断开
  let closed = false;
  req.socket.on("close", () => {
    closed = true;
    if (!res.writableEnded) res.end();
  });

  const client = new OpenAI({
    apiKey: upstreamApiKey,
    baseURL: upstreamBaseURL,
  });

  try {
    const stream = await client.chat.completions.create({
      model: upstreamModel,
      messages: messages,
      stream: true,
      // 参数兼容（2026-11-05）：部分百炼渠道模型（如 kimi-k3）不支持 temperature/max_tokens
      // 显式传入会被上游 invalid_parameter_error 拒绝——默认不传用各模型默认值
    });

    for await (const chunk of stream) {
      if (closed) break;
      const delta = chunk.choices[0]?.delta;

      // 处理思考过程（DeepSeek-R1 等模型的 reasoning_content）
      if ((delta as { reasoning_content?: string })?.reasoning_content) {
        const reasoning = (delta as { reasoning_content?: string }).reasoning_content;
        res.write(`data: ${JSON.stringify({ type: "reasoning", content: reasoning })}\n\n`);
      }

      // 处理正常内容
      if (delta?.content) {
        res.write(`data: ${JSON.stringify({ type: "text", content: delta.content })}\n\n`);
      }

      // 处理结束
      if (chunk.choices[0]?.finish_reason) {
        res.write(
          `data: ${JSON.stringify({ type: "finish", finish_reason: chunk.choices[0].finish_reason })}\n\n`,
        );
      }
    }

    if (!closed) {
      res.write("data: [DONE]\n\n");
      res.end();
    }
  } catch (error: unknown) {
    console.error("流式调用错误:", error);
    const message = error instanceof Error ? error.message : "AI 服务异常";
    if (!closed) {
      res.write(`data: ${JSON.stringify({ type: "error", error: message })}\n\n`);
      res.end();
    }
  }
};
