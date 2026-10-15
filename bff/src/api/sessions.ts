// 会话存储 REST 路由：方案三后端实现（设计源 sql/tables.sql，存储层 src/db.ts）。
// 溯源：方案三 2026-09-12 落地；任务 02（注释体系存量收敛一期，头注四要素核对补齐）
// 约束：端点契约与前端 src/api/sessions.ts 的 sessionAPI 一一对应（axios baseURL /api，由 vite proxy 剥离前缀）

import { Router, type Request, type Response } from "express";

import {
  addMessage,
  createSession,
  deleteSession,
  getSession,
  listMessages,
  listSessions,
  type MessageRow,
} from "../db.ts";

const router = Router();

// GET /sessions — 会话列表（按活跃时间倒序）
router.get("/", (_req: Request, res: Response) => {
  res.json(listSessions());
});

// POST /sessions — 新建会话
router.post("/", (req: Request, res: Response) => {
  const { title, modelKey, userId } = req.body ?? {};
  if (title !== undefined && typeof title !== "string") {
    return res.status(400).json({ error: "title 必须为字符串" });
  }
  if (modelKey !== undefined && typeof modelKey !== "string") {
    return res.status(400).json({ error: "modelKey 必须为字符串" });
  }
  res.status(201).json(createSession({ title, modelKey, userId }));
});

// GET /sessions/:id/messages — 会话消息列表
router.get("/:id/messages", (req: Request, res: Response) => {
  const id = String(req.params.id);
  const session = getSession(id);
  if (!session) {
    return res.status(404).json({ error: "会话不存在" });
  }
  res.json(listMessages(session.id));
});

// POST /sessions/:id/messages — 追加消息（role/content 必填）
router.post("/:id/messages", (req: Request, res: Response) => {
  const id = String(req.params.id);
  const session = getSession(id);
  if (!session) {
    return res.status(404).json({ error: "会话不存在" });
  }

  const { role, content, reasoning, error, interrupted, tokenCount } = req.body ?? {};
  const validRoles: MessageRow["role"][] = ["user", "assistant", "system"];
  if (!validRoles.includes(role)) {
    return res.status(400).json({ error: `role 必须为 ${validRoles.join(" / ")}` });
  }
  if (typeof content !== "string" || content.length === 0) {
    return res.status(400).json({ error: "content 不能为空" });
  }

  const message = addMessage(session.id, {
    role,
    content,
    reasoning,
    error,
    interrupted,
    tokenCount,
  });
  res.status(201).json(message);
});

// DELETE /sessions/:id — 删除会话（messages 级联删除）
router.delete("/:id", (req: Request, res: Response) => {
  if (!deleteSession(String(req.params.id))) {
    return res.status(404).json({ error: "会话不存在" });
  }
  res.status(204).send();
});

export default router;
