// 多模型流式聊天代理：按 model key 映射各 AI 提供商（OpenAI 兼容模式）并转发 SSE 流。
// 溯源：任务 02（注释体系存量收敛一期，补头注）
// 约束：modelConfigs 的 key 与前端 types/chat/aiModel.ts 的 AI_MODEL_LIST 对齐（新增模型须两处同步）；
// 密钥经 dotenv 读 .env.local，依赖 cwd=bff/（npm workspace 脚本保证）

import { type Request, type Response } from "express";
import OpenAI from "openai";

import dotenv from "dotenv";
// 注意：相对路径依赖 cwd=bff/（npm workspace 脚本已保证，勿从其他目录直接启动）
dotenv.config({ path: ".env.local" });

// ---------- 多模型配置（key 与前端 types/chat/aiModel.ts 的 AI_MODEL_LIST 对齐） ----------
// 扩展新模型：在 .env.local 增配 <PREFIX>_API_BASE_URL / <PREFIX>_API_KEY 后在此登记
const modelConfigs: Record<string, { baseURL: string; apiKey: string }> = {
  "qwen-turbo": {
    baseURL: "https://dashscope.aliyuncs.com/compatible-mode/v1",
    apiKey: process.env.DASHSCOPE_API_KEY || "",
  },
  "qwen-max": {
    baseURL: "https://dashscope.aliyuncs.com/compatible-mode/v1",
    apiKey: process.env.DASHSCOPE_API_KEY || "",
  },
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
  const { messages, model = "qwen-turbo" } = req.body;

  if (!Array.isArray(messages) || messages.length === 0) {
    return res.status(400).json({ error: "messages 不能为空" });
  }

  const config = modelConfigs[model];
  if (!config) {
    return res.status(400).json({ error: `不支持的模型: ${model}` });
  }

  // 设置 SSE 响应头
  res.setHeader("Content-Type", "text/event-stream");
  res.setHeader("Cache-Control", "no-cache");
  res.setHeader("Connection", "keep-alive");
  res.setHeader("X-Accel-Buffering", "no"); // 禁用 nginx 缓存

  // 客户端断开时立即结束响应（避免上游继续生成浪费 token）
  let closed = false;
  req.on("close", () => {
    closed = true;
    res.end();
  });

  const client = new OpenAI({
    apiKey: config.apiKey,
    baseURL: config.baseURL,
  });

  try {
    const stream = await client.chat.completions.create({
      model: model,
      messages: messages,
      stream: true,
      // 以下参数按需调整
      temperature: 0.7, // 控制生成文本的随机性，0.7 表示较随机，0 表示较确定,1 表示非常确定
      max_tokens: 2000, // 生成文本的最大长度
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
