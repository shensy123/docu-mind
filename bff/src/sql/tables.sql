-- 【存储会话】方案三：后端存储（企业级推荐）、结合routes/sesstions.ts
-- 本文件为方案三的表结构设计源（PostgreSQL 方言）。
-- 运行时实现位于 src/db.ts，采用 SQLite 单文件适配（bff/data/sessions.db，gitignore）：
-- UUID 改应用层生成、时间戳存 ISO 字符串、布尔存 0/1，表语义与下方设计一致

-- 用户表
CREATE TABLE users (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  username VARCHAR(50) UNIQUE NOT NULL,
  created_at TIMESTAMP DEFAULT NOW()
);

-- 会话表
CREATE TABLE sessions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES users(id),
  title VARCHAR(200) DEFAULT '新对话',
  model_key VARCHAR(50) DEFAULT 'qwen',
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- 消息表
CREATE TABLE messages (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  session_id UUID REFERENCES sessions(id) ON DELETE CASCADE,
  role VARCHAR(20) NOT NULL,        -- user / assistant / system
  content TEXT NOT NULL,
  reasoning TEXT,
  error BOOLEAN DEFAULT FALSE,
  interrupted BOOLEAN DEFAULT FALSE,
  token_count INTEGER,
  created_at TIMESTAMP DEFAULT NOW()
);

-- 索引
CREATE INDEX idx_messages_session ON messages(session_id);
CREATE INDEX idx_sessions_user ON sessions(user_id);