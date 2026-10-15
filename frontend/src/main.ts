// 前端应用入口:装配 Pinia/Router/虚拟滚动/v-focus 指令并挂载根组件。
// 溯源:任务 02(注释体系存量收敛一期,头注四要素补齐);主题恢复链 2026-09-12 自 L4 恢复接线
// 约束:主题只经 ThemeManager 单例初始化(localStorage app_theme,缺省浅色);mock 模块仅 DEV 动态 import 不进生产包

import { createApp } from 'vue'
import { createPinia } from 'pinia'
import { focus } from './directives/focus'

import App from './App.vue'
import router from './router'
import '@/styles/index.scss'
import ThemeManager from './theme/index.ts'
import { THEME_STORAGE_KEY } from '@/store/setTheme'

import VueVirtualScroller from 'vue-virtual-scroller'

if (import.meta.env.DEV) {
  import('../mock/chat.ts')
}
const app = createApp(App)

const theme = ThemeManager.getInstance()
// 恢复上次选择的主题，默认浅色
theme.init(localStorage.getItem(THEME_STORAGE_KEY) === 'dark' ? 'dark' : 'light')

const pinia = createPinia()
app.use(pinia)
app.use(router)
app.use(VueVirtualScroller)
app.directive('focus', focus)

app.mount('#app')
