// BFF 入口：装配 Express 中间件（CORS / JSON 解析 / CSP / 解析错误处理）并挂载聊天与会话路由。
// 溯源：任务 02（注释体系存量收敛一期，补头注）
// 约束：端口默认 3000（PORT 可覆盖），与前端 vite proxy（/chat → localhost:3000）约定绑定，改动须两端同步

import express from "express";
import cors from "cors";
// import dotenv from "dotenv";
import { chatQwenStream } from "./src/api/chat.ts";
import { listModels } from "./src/api/models.ts";
import sessionsRouter from "./src/api/sessions.ts";

// dotenv.config();

const app = express();
app.use(cors());
app.use(express.json());

// 开发时覆盖或设置 Content-Security-Policy，避免默认策略阻塞 DevTools 等连接
app.use((req, res, next) => {
  // 允许同源连接与本地调试连接（根据需要调整）
  res.setHeader(
    "Content-Security-Policy",
    "default-src 'self'; connect-src 'self' http://localhost:3000 ws://localhost:3000",
  );
  next();
});

// 在 json 中间件之后、路由之前添加解析错误处理（err 收窄为 json 解析错误的实际形态）
type JsonParseError = { type?: string; message?: string };
app.use(
  (
    err: JsonParseError,
    req: express.Request,
    res: express.Response,
    next: express.NextFunction,
  ) => {
    if (err.type === "entity.parse.failed" || err.type === "request.aborted") {
      console.error("请求体解析错误或中断:", err.message);
      return res.status(400).json({ error: "无效的请求数据" });
    }
    next(err);
  },
);

// POST /chat/qwen/stream - SSE 流式聊天（前端唯一聊天通道）
app.post("/chat/qwen/stream", chatQwenStream);

// POST /chat/models - 访客供应商模型列表中转（批3 MVP「获取模型列表/测试连接」，钥匙只过内存不落盘）
app.post("/chat/models", listModels);

// /sessions - 会话存储（方案三后端实现，见 src/api/sessions.ts + src/db.ts）
app.use("/sessions", sessionsRouter);

// 根路径提供简单状态，避免浏览器访问 '/' 时看到 404 页面
app.get("/", (req: express.Request, res: express.Response) => {
  res.json({ status: "ok", message: "AI Chat Server is running" });
});

// 与前端 vite proxy(/chat → localhost:3000) 及文档约定保持一致
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`AI Chat Server running at http://localhost:${PORT}`);
});
