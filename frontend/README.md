# docu-mind · frontend

docu-mind 的前端应用：基于 **Vue 3 + Vite** 的多模型 AI 对话助手，接入通义千问 / DeepSeek / 豆包，提供会话管理、文档上传与亮暗主题切换。

> 项目当前为 **WIP（开发中）**。lint / build / 单元测试全绿（type-check 余 8 条 element-plus + vue-tsc 兼容误报，已知、运行时正常）。

## ✨ 功能特性

- **多模型聊天**：通义千问（qwen-turbo / qwen-max）、DeepSeek、豆包，支持模型切换与问候语
- **流式输出**：SSE 流式渲染，支持思考过程（reasoning）展示、停止生成、失败重试
- **会话管理**：多会话列表、消息持久化（localStorage）、临时对话、历史会话
- **文档管理**：文档上传（进度/成功/失败状态）、文档列表与搜索
- **主题系统**：亮 / 暗双主题（Element Plus CSS 变量注入），默认浅色，切换即持久化
- **布局体系**：`BasicLayout` 三层布局 + 侧边栏 / 面包屑 / 页签历史

## 🧱 技术栈

| 类别        | 技术                                                                      |
| ----------- | ------------------------------------------------------------------------- |
| 框架        | Vue 3.5 · TypeScript 6（严格）· Vite 8                                    |
| UI          | Element Plus 2.13                                                         |
| 状态 / 路由 | Pinia 3 · Vue Router 5（history）                                         |
| AI 通道     | 原生 fetch + SSE 流式解析（经 bff 代理到各家模型）                        |
| HTTP        | Axios                                                                     |
| 样式        | SCSS · Element Plus CSS 变量主题                                          |
| 工具        | @vueuse/core · localforage · vue-virtual-scroller · marked · highlight.js |
| 质量        | oxlint · ESLint · Stylelint · Prettier · Vitest                           |

## 🚀 本地开发

```bash
cd frontend        # 或从根目录 npm run dev:frontend
npm install        # 在仓库根目录执行一次即可（workspaces 统一安装），此处无需单独 install
npm run dev        # http://localhost:5173
npm run dev:mock   # 启用 Mock API，不依赖真实 AI
```

> 📌 本工作区依赖由仓库根 `npm install` 统一安装（npm workspaces hoisting），勿在本目录单独 install。

> AI 密钥统一配置在 `bff/.env.local`（前端经 bff 代理调用，自身无需密钥）。

## 📦 常用脚本（frontend/ 目录下）

| 命令                                    | 说明                                        |
| --------------------------------------- | ------------------------------------------- |
| `npm run dev` / `dev:host` / `dev:mock` | 开发服务器（本地 / 网络可访问 / 启用 Mock） |
| `npm run build`                         | 类型检查 + 构建                             |
| `npm run build-only`                    | 仅构建                                      |
| `npm run preview`                       | 预览生产构建                                |
| `npm run type-check`                    | vue-tsc 类型检查                            |
| `npm run test:unit`                     | Vitest 单元测试                             |
| `npm run lint` / `lint:fix`             | oxlint + ESLint + Stylelint                 |
| `npm run format`                        | Prettier 格式化                             |

## 🗂️ 目录结构

```
frontend/
├── src/
│   ├── api/          # API 接口定义（chat.ts 流式主通道）
│   ├── components/   # 通用组件（common/ 三层布局体系、__tests__/）
│   ├── composables/  # useConversationChat（主力编排）、useChatSession、useAiModel
│   ├── directives/   # 自定义指令（v-focus）
│   ├── layouts/      # MainLayout 六件套
│   ├── router/       # 路由组装 + guards/auth.ts 守卫
│   ├── store/        # Pinia 状态（auth、conversation、document、setTheme）
│   ├── styles/       # SCSS 变量 / mixins / 全局样式
│   ├── theme/        # 主题系统（ThemeManager + Light/Dark 工厂）
│   ├── types/        # TypeScript 类型（chat/ 模型清单单一源、document）
│   ├── utils/        # 工具（request、routeHelper）
│   └── views/        # 页面（Conversation 现役聊天、Document、DocuSetting、login…）
├── mock/             # 开发 Mock API（vite-plugin-mock，dev:mock 启用）
└── public/           # 静态资源
```

## 🔑 环境变量

位于 `frontend/.env.development` / `frontend/.env.production`（Vite 环境变量）：

| 变量                | 说明                                                        |
| ------------------- | ----------------------------------------------------------- |
| `VITE_API_BASE_URL` | API 基础地址（当前 src 零消费，聊天走相对路径 + vite 代理） |
| `VITE_APP_TITLE`    | 应用标题                                                    |
| `VITE_MODE`         | 运行模式                                                    |
| `VITE_API_TIMEOUT`  | 请求超时（ms）                                              |

> ⚠️ 这两个文件当前被 .gitignore 忽略**不入库**，克隆后可按需补建（变量当前为预留，应用不依赖其运行）。

## 🛠️ Mock

- 基于 `vite-plugin-mock`，文件位于 `frontend/mock/`
- 仅 `npm run dev:mock` 时启用（`npm_lifecycle_event` 判定），普通 dev 不拦截

## ✅ 测试与代码质量

- **单元测试：** Vitest + jsdom，测试文件位于 `frontend/src/**/__tests__/*`
- **代码检查：** oxlint（正确性）+ ESLint（Vue/TS）+ Stylelint（SCSS）三层流水线
- **提交规范：** 由仓库根 husky + lint-staged + commitlint 统一管理（conventional commits，如 `feat:`、`fix:`）

## 📚 相关文档

- [../README.md](../README.md) — monorepo 总览
- [../bff/README.md](../bff/README.md) — 后端 BFF 说明（密钥配置、模型映射）
