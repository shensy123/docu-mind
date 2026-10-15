import { fileURLToPath, URL } from 'node:url'

import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import vueJsx from '@vitejs/plugin-vue-jsx'
import vueDevTools from 'vite-plugin-vue-devtools'
import { viteMockServe } from 'vite-plugin-mock'
import AutoImport from 'unplugin-auto-import/vite'
import Components from 'unplugin-vue-components/vite'
import { ElementPlusResolver } from 'unplugin-vue-components/resolvers'

// https://vite.dev/config/
export default defineConfig({
  plugins: [
    vueDevTools(),
    vue(),
    vueJsx(),
    AutoImport({
      resolvers: [ElementPlusResolver()],
      imports: ['vue', 'vue-router', 'pinia'],
      dts: 'src/types/auto-imports.d.ts',
    }),
    Components({
      resolvers: [ElementPlusResolver({ importStyle: 'sass' })],
      dts: 'src/types/components.d.ts',
    }),
    // Mock 仅在 npm run dev:mock 时启用（npm_lifecycle_event 为 npm 注入的当前脚本名，跨平台有效；
    // 保持对象式导出，因 vitest.config.ts 需要 mergeConfig 合并本配置）
    viteMockServe({
      mockPath: 'mock', // 接口文件目录
      watchFiles: true, // 监视文件变化，自动重启服务
      enable: process.env.npm_lifecycle_event === 'dev:mock',
      logger: true, // 打印日志
    }),
  ],
  css: {
    // 配置全局 SCSS 变量和混入
    devSourcemap: true, // 开发环境启用 SCSS source map
    preprocessorOptions: {
      scss: {
        // 静默模式：禁止 Vite 输出关于 SCSS 预处理器的弃用警告，保持构建日志清晰
        silenceDeprecations: ['legacy-js-api', 'import'],
        // 全局引入 SCSS 变量和混入
        additionalData: `
          @use "@/styles/variables.scss" as *;
          @use "@/styles/mixins.scss" as *;
        `,
      },
    },
  },
  resolve: {
    alias: {
      '@': fileURLToPath(new URL('./src', import.meta.url)),
      '@components': fileURLToPath(new URL('./src/components', import.meta.url)),
      '@store': fileURLToPath(new URL('./src/store', import.meta.url)),
    },
  },
  server: {
    port: 5173,
    host: '0.0.0.0',
    // host: true, // 设置为 true 可以让服务器监听所有地址，包括 localhost 和公网 IP
    // open: true, // 启动后自动打开浏览器,
    proxy: {
      // 聊天请求转发到本地 bff（生产环境同域部署无需此代理）
      '/chat': {
        target: 'http://localhost:3000',
        changeOrigin: true,
      },
      // axios baseURL /api 的请求转发到本地 bff 并剥离 /api 前缀（会话存储等 REST 端点）
      '/api': {
        target: 'http://localhost:3000',
        changeOrigin: true,
        rewrite: path => path.replace(/^\/api/, ''),
      },
    },
  },
  // 生产构建去除 console 与 debugger（官方 esbuild 机制，语法级安全；
  // 此前自制正则插件在嵌套括号处会截断代码导致 PARSE_ERROR，已移除）
  esbuild: {
    drop: ['console', 'debugger'],
  },
  build: {
    outDir: 'dist',
    cssCodeSplit: true, // 启用 CSS 代码分割，生成独立的 CSS 文件,用于优化加载时间,减少单个文件的大小，通过按需加载提高性能
    // sourcemap: true, // 生产环境开启 sourcemap，用于调试和错误追踪，但部署时请确保正确配置服务器以保护源代码安全
    rollupOptions: {
      // 生产环境文件名添加 hash，用于缓存控制和版本管理，确保用户每次访问时都能获取最新的资源，同时也有助于区分不同版本的文件
      output: {
        entryFileNames: 'assets/[name]-[hash].js', //入口文件，比如：main.js，app.js等
        chunkFileNames: 'assets/[name]-[hash].js', //chunk是动态导入的模块，比如：import()，或者路由懒加载
        // assetFileNames: 'assets/[name]-[hash][extname]', //静态资源文件，比如：图片、字体等
        assetFileNames: assetInfo => {
          if (assetInfo.name?.endsWith('.css')) {
            return 'assets/[name]-[hash].css'
          }
          return 'assets/[name]-[hash][extname]' //extaname是文件扩展名，比如：.js，.css，.png等
        },
      },
    },
  },
})
