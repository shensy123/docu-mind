# docu-mind

AI 智能文档问答助手 monorepo（frontend + bff）。

> 在线 Demo（前端静态演示版）：https://docu-mind-demo.vercel.app ——AI 对话与流式输出需本地运行 BFF（`npm install && npm run dev`，详见下文）；线上版用于界面与交互演示。

> 状态：WIP（开发中）。`lint` / `build` / 单元测试当前全绿；`type-check` 余 8 条 element-plus 2.13 + vue-tsc 的模板 prop 类型解析误报（标准用法、运行时正常）。

## 仓库结构

```
docu-mind/                  ← npm workspaces monorepo
├── frontend/               # Vue 3 前端（多模型聊天、会话管理、文档管理、主题切换）
├── bff/                    # Express 后端（BFF），代理 AI 聊天请求到各家模型
├── .github/workflows/      # CI：push / PR 跑 lint + test + build
├── .husky/                 # git 钩子：commitlint + lint-staged 提交门禁
└── package.json            # 根包：一键启动双端 + 工程化门禁
```

各模块详细介绍见对应 README：

- [frontend/README.md](frontend/README.md) — 前端应用说明
- [bff/README.md](bff/README.md) — 后端 BFF 说明

## 快速开始

**环境要求：** Node.js `^20.19.0 || >=22.12.0`（npm）

```bash
# 1. 在仓库根目录安装依赖（workspaces 统一安装 frontend + bff，勿在子目录单独 install）
npm install

# 2. 配置模型密钥（可选，仅使用 AI 聊天需要）
#    密钥统一由 bff 持有：新建 bff/.env.local 填入（该文件不入库）
#    可用变量见 bff/README.md「环境变量」（PORT / DASHSCOPE_API_KEY / DEEPSEEK_API_KEY / DOUBAO_API_KEY）

# 3. 一键启动双端
npm run dev                # 前端 http://localhost:5173 + 后端 :3000

# 或单独启动某端
npm run dev:frontend       # 仅前端
npm run dev:bff            # 仅后端
npm run dev:mock           # 前端 + Mock API（不依赖真实 AI）
```

## 常用脚本（根目录执行）

| 命令                               | 说明                             |
| ---------------------------------- | -------------------------------- |
| `npm run dev`                      | 一键并行启动前端 + 后端          |
| `npm run dev:frontend` / `dev:bff` | 单独启动某端                     |
| `npm run dev:mock`                 | 前端 + Mock API                  |
| `npm run build`                    | 前端类型检查 + 构建              |
| `npm run type-check`               | 前端 vue-tsc 类型检查            |
| `npm run test:unit`                | 前端 Vitest 单元测试             |
| `npm run lint` / `lint:fix`        | 前端 oxlint + ESLint + Stylelint |
| `npm run format`                   | 前端 Prettier 格式化             |

## 提交规范

提交信息遵循 Conventional Commits（`feat:` / `fix:` / `docs:` / `refactor:` 等，中文 subject），由 husky + commitlint + lint-staged 在提交时自动校验与格式化（`npm install` 后生效）。
