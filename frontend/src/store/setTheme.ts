import { ThemeManager, type ThemeType } from '@/theme'

type SpaceType = 'default' | 'small' | 'large' | number | [number, number]

// 主题持久化 key：main.ts 启动时按此恢复上次选择，切换时由 store 写入
export const THEME_STORAGE_KEY = 'app_theme'

export const useThemeStore = defineStore('theme', () => {
  const space = ref<SpaceType>(8) // 默认卡片间距为 8px
  const themeInstance = ThemeManager.getInstance()

  const theme = computed({
    get: () => themeInstance.getTheme(),
    set: (newTheme: ThemeType) => {
      themeInstance.setTheme(newTheme)
      localStorage.setItem(THEME_STORAGE_KEY, newTheme)
    },
  })

  function setSpace(newSpace: SpaceType) {
    space.value = newSpace
  }
  return { theme, space, setSpace }
})
