import { fileURLToPath } from 'node:url'
import { mergeConfig, defineConfig, configDefaults } from 'vitest/config'
import viteConfig from './vite.config'

export default mergeConfig(
  viteConfig,
  defineConfig({
    test: {
      environment: 'jsdom',
      exclude: [...configDefaults.exclude, 'e2e/**'],
      root: fileURLToPath(new URL('./', import.meta.url)),
      // element-plus 走 Vite 管线处理(否则其 .css 被 node 直接加载报 Unknown file extension)
      server: { deps: { inline: ['element-plus'] } },
    },
  })
)
