# docu-mind · bff

docu-mind 的 **BFF（Backend for Frontend）**：基于 **Express 5** 的 AI 聊天后端，通过 OpenAI 兼容 SDK 将聊天请求代理到各家 LLM 提供商。

> 本目录由上级 `llm/` 迁入（原 ai-chat-server），包管理器由 pnpm 切换为 npm（随 workspaces 统一管理）。

## 🧱 技术栈

Express 5 · OpenAI SDK（OpenAI 兼容模式）· ts-node · dotenv

## 🚀 本地开发

```bash
cd bff             # 或从根目录 npm run dev:bff
npm install        # 在仓库根目录执行一次即可（workspaces 统一安装），此处无需单独 install
npm run dev        # ts-node index.ts，监听 :3000
```

> 📌 本工作区依赖由仓库根 `npm install` 统一安装（npm workspaces hoisting），勿在本目录单独 install。

> 需配置 `bff/.env.local` 填入密钥（见「环境变量」）。

## 🗂️ 入口与路由

| 路径                     | 说明                                                                                                                                       |
| ------------------------ | ------------------------------------------------------------------------------------------------------------------------------------------ |
| `POST /chat/qwen/stream` | SSE 流式聊天，前端唯一聊天通道（`type: reasoning\|text\|finish\|error` + `data: [DONE]`）                                                  |
| `/sessions`\*            | 会话存储 REST：GET/POST `/sessions`、GET/POST `/sessions/:id/messages`、DELETE `/sessions/:id`（数据落 SQLite `data/sessions.db`，不入库） |
| `GET /`                  | 健康检查，返回 `{ status: "ok" }`                                                                                                          |

模型映射位于 `src/api/chat.ts`（key 与前端 `types/chat/aiModel.ts` 的 `AI_MODEL_LIST` 对齐）：`qwen-turbo` / `qwen-max` → 阿里云 DashScope，`deepseek-chat` → DeepSeek，`doubao-pro-4k` → 豆包（OpenAI 兼容模式）。

> 历史注记：非流式端点 `POST /chat/qwen` 因前端零调用方已于 2026-09-10 移除（需要时从 git 历史 `91b664a^` 取回）。

## 🔑 环境变量（`bff/.env.local`）

| 变量                                           | 说明                   |
| ---------------------------------------------- | ---------------------- |
| `PORT`                                         | 服务端口（默认 3000）  |
| `DASHSCOPE_API_BASE_URL` / `DASHSCOPE_API_KEY` | 通义千问（阿里云百炼） |
| `DEEPSEEK_API_BASE_URL` / `DEEPSEEK_API_KEY`   | DeepSeek（已接线）     |
| `DOUBAO_API_BASE_URL` / `DOUBAO_API_KEY`       | 豆包（已接线）         |

由 `src/api/chat.ts` 的 `dotenv.config({ path: '.env.local' })` 加载（依赖 cwd=bff/，npm workspace 脚本已保证）。文件含真实密钥，**不提交**（已被 .gitignore 忽略）。

## ⚠️ 注意事项（WIP，2026-09-10 更新）

- **会话存储已落地**：`/sessions` 路由（`src/api/sessions.ts`）+ SQLite 存储层（`src/db.ts`，数据文件 `data/` 已 gitignore），表设计源 `src/sql/tables.sql`
- **端口已统一**：代码默认 3000（`.env.local` 的 `PORT` 可覆盖）
- **无认证**：接口无鉴权，仅限开发环境使用
- **tsconfig.json 已补**（strict + NodeNext + noEmit）：`npm run type-check` 通过；ts-node 直跑与 .ts 后缀 import 的组合已实测可用
- **CI**：已纳入仓库级最小 CI（`.github/workflows/ci.yml`）的 type-check 环节

## 📚 相关文档

- [../README.md](../README.md) — monorepo 总览
