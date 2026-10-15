# Mock 目录说明

本目录用于开发时本地 API Mock，配合 `vite-plugin-mock` 使用。推荐结构：

- `mock/moments.ts`：数据生成器（使用 `mockjs` 的 `Random` API 来生成随机内容）。
- `mock/moments-api.ts`：导出 `vite-plugin-mock` 推荐格式的路由定义（`export default [...]`）。
- `mock/chat.ts`：示例聊天接口的 mock 路由（同样导出路由数组）。

使用说明

1. 安装依赖（推荐作为 devDependencies）:

```bash
npm install -D mockjs @types/mockjs
```

2. 在 `vite.config.ts` 中启用 `vite-plugin-mock`（开发环境）：

```ts
import { viteMockServe } from 'vite-plugin-mock'

plugins: [
  // ...
  viteMockServe({ mockPath: 'mock', enable: true, watchFiles: true }),
]
```

3. mock 文件须导出默认路由数组，示例：

```ts
export default [
  { url: '/api/moments', method: 'get', response: ({ query }) => ({ code: 0, data: [] }) },
]
```

注意

- `mockjs` 可用于生成随机数据（如 `Random.integer`、`Random.csentence`、`Random.pick` 等），但不应该被打包到生产依赖中，建议以 devDependency 安装。
- 若你使用 `Mock.mock(...)` 全局注入风格，请改为 `vite-plugin-mock` 的导出格式，插件会在开发时加载路由。

调试

- 更改 mock 文件后，`vite-plugin-mock` 的 `watchFiles: true` 会自动热重载。
- 若请求返回 HTML（index.html），请确认 `vite-plugin-mock` 已启用，或检查是否有自定义 dev server 中间件拦截请求。

作者：自动重构脚本
