// store/setTheme.ts 主题切换实装回归——该件自 _archive/L4 恢复接线后（Theme.vue v-model + main.ts 启动恢复）
// 覆盖：①theme 跟随 ThemeManager ②切换写单例并持久化 ③space 默认与更新
import { beforeEach, describe, expect, it } from 'vitest'
import { createPinia, setActivePinia } from 'pinia'
import { ThemeManager } from '@/theme'
import { THEME_STORAGE_KEY, useThemeStore } from '@/store/setTheme'

beforeEach(() => {
  localStorage.clear()
  // ThemeManager 为跨用例单例，先归位浅色模拟 main.ts 启动态
  ThemeManager.getInstance().setTheme('light')
  setActivePinia(createPinia())
})

describe('store/setTheme（主题切换实装）', () => {
  it('theme 读取跟随 ThemeManager 当前主题', () => {
    const store = useThemeStore()
    expect(store.theme).toBe('light')
  })

  it('切换主题：写入 ThemeManager 并持久化 localStorage', () => {
    const store = useThemeStore()
    store.theme = 'dark'
    expect(ThemeManager.getInstance().getTheme()).toBe('dark')
    expect(localStorage.getItem(THEME_STORAGE_KEY)).toBe('dark')
  })

  it('space 默认 8，setSpace 可更新', () => {
    const store = useThemeStore()
    expect(store.space).toBe(8)
    store.setSpace(16)
    expect(store.space).toBe(16)
  })
})
