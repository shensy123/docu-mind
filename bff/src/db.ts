// 会话存储层：better-sqlite3 单例连接＋三表 CRUD（users/sessions/messages），对外统一 camelCase 行类型。
// 溯源：任务 02（注释体系存量收敛一期，补头注）；建表改编自 sql/tables.sql（方案三设计源为 PostgreSQL 方言）
// 约束：数据文件 data/sessions.db（gitignore）；WAL＋外键开启；消息写入同事务刷新会话活跃时间

import Database from "better-sqlite3";
import { randomUUID } from "node:crypto";
import { mkdirSync } from "node:fs";
import path from "node:path";

// 数据文件目录：bff/data/（gitignore）。相对 cwd，与 chat.ts 的 .env.local 加载同前提：
// 依赖 npm workspace 脚本保证 cwd=bff/，勿从其他目录直接启动
const DATA_DIR = path.resolve(process.cwd(), "data");
mkdirSync(DATA_DIR, { recursive: true });

const db = new Database(path.join(DATA_DIR, "sessions.db"));
db.pragma("journal_mode = WAL");
db.pragma("foreign_keys = ON");

// 建表：改编自 sql/tables.sql（方案三设计源为 PostgreSQL 方言）。
// SQLite 运行时适配：UUID 由应用层 crypto.randomUUID 生成、时间戳存 ISO 字符串、布尔存 0/1
db.exec(`
  CREATE TABLE IF NOT EXISTS users (
    id TEXT PRIMARY KEY,
    username TEXT UNIQUE,
    created_at TEXT NOT NULL
  );

  CREATE TABLE IF NOT EXISTS sessions (
    id TEXT PRIMARY KEY,
    user_id TEXT REFERENCES users(id),
    title TEXT NOT NULL DEFAULT '新对话',
    model_key TEXT NOT NULL DEFAULT 'qwen',
    created_at TEXT NOT NULL,
    updated_at TEXT NOT NULL
  );

  CREATE TABLE IF NOT EXISTS messages (
    id TEXT PRIMARY KEY,
    session_id TEXT NOT NULL REFERENCES sessions(id) ON DELETE CASCADE,
    role TEXT NOT NULL CHECK (role IN ('user', 'assistant', 'system')),
    content TEXT NOT NULL,
    reasoning TEXT,
    error INTEGER NOT NULL DEFAULT 0,
    interrupted INTEGER NOT NULL DEFAULT 0,
    token_count INTEGER,
    created_at TEXT NOT NULL
  );

  CREATE INDEX IF NOT EXISTS idx_messages_session ON messages(session_id);
  CREATE INDEX IF NOT EXISTS idx_sessions_user ON sessions(user_id);
`);

// ---------- 行类型（对外统一 camelCase，与前端 types/chat 命名习惯对齐） ----------

export interface SessionRow {
  id: string;
  userId: string | null;
  title: string;
  modelKey: string;
  createdAt: string;
  updatedAt: string;
}

export interface MessageRow {
  id: string;
  sessionId: string;
  role: "user" | "assistant" | "system";
  content: string;
  reasoning: string | null;
  error: boolean;
  interrupted: boolean;
  tokenCount: number | null;
  createdAt: string;
}

interface SessionDbRow {
  id: string;
  user_id: string | null;
  title: string;
  model_key: string;
  created_at: string;
  updated_at: string;
}

interface MessageDbRow {
  id: string;
  session_id: string;
  role: string;
  content: string;
  reasoning: string | null;
  error: number;
  interrupted: number;
  token_count: number | null;
  created_at: string;
}

const now = () => new Date().toISOString();

const mapSession = (row: SessionDbRow): SessionRow => ({
  id: row.id,
  userId: row.user_id,
  title: row.title,
  modelKey: row.model_key,
  createdAt: row.created_at,
  updatedAt: row.updated_at,
});

const mapMessage = (row: MessageDbRow): MessageRow => ({
  id: row.id,
  sessionId: row.session_id,
  role: row.role as MessageRow["role"],
  content: row.content,
  reasoning: row.reasoning,
  error: row.error === 1,
  interrupted: row.interrupted === 1,
  tokenCount: row.token_count,
  createdAt: row.created_at,
});

// ---------- CRUD ----------

export function listSessions(): SessionRow[] {
  const rows = db
    .prepare("SELECT * FROM sessions ORDER BY updated_at DESC")
    .all() as SessionDbRow[];
  return rows.map(mapSession);
}

export function getSession(id: string): SessionRow | undefined {
  const row = db.prepare("SELECT * FROM sessions WHERE id = ?").get(id) as SessionDbRow | undefined;
  return row ? mapSession(row) : undefined;
}

export function createSession(input: {
  title?: string;
  modelKey?: string;
  userId?: string;
}): SessionRow {
  const row: SessionDbRow = {
    id: randomUUID(),
    user_id: input.userId ?? null,
    title: input.title?.trim() || "新对话",
    model_key: input.modelKey?.trim() || "qwen",
    created_at: now(),
    updated_at: now(),
  };
  db.prepare(
    "INSERT INTO sessions (id, user_id, title, model_key, created_at, updated_at) VALUES (?, ?, ?, ?, ?, ?)",
  ).run(row.id, row.user_id, row.title, row.model_key, row.created_at, row.updated_at);
  return mapSession(row);
}

export function deleteSession(id: string): boolean {
  const result = db.prepare("DELETE FROM sessions WHERE id = ?").run(id);
  return result.changes > 0;
}

export function listMessages(sessionId: string): MessageRow[] {
  const rows = db
    .prepare("SELECT * FROM messages WHERE session_id = ? ORDER BY created_at ASC")
    .all(sessionId) as MessageDbRow[];
  return rows.map(mapMessage);
}

export function addMessage(
  sessionId: string,
  input: {
    role: MessageRow["role"];
    content: string;
    reasoning?: string;
    error?: boolean;
    interrupted?: boolean;
    tokenCount?: number;
  },
): MessageRow {
  const row: MessageDbRow = {
    id: randomUUID(),
    session_id: sessionId,
    role: input.role,
    content: input.content,
    reasoning: input.reasoning ?? null,
    error: input.error ? 1 : 0,
    interrupted: input.interrupted ? 1 : 0,
    token_count: input.tokenCount ?? null,
    created_at: now(),
  };
  const insert = db.transaction(() => {
    db.prepare(
      "INSERT INTO messages (id, session_id, role, content, reasoning, error, interrupted, token_count, created_at) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)",
    ).run(
      row.id,
      row.session_id,
      row.role,
      row.content,
      row.reasoning,
      row.error,
      row.interrupted,
      row.token_count,
      row.created_at,
    );
    // 消息写入同时刷新会话活跃时间
    db.prepare("UPDATE sessions SET updated_at = ? WHERE id = ?").run(now(), sessionId);
  });
  insert();
  return mapMessage(row);
}
