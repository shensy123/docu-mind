import { ThemeFactory, DarkThemeFactory, LightThemeFactory } from './factory'

export type ThemeType = 'light' | 'dark'

export class ThemeManager {
  private static instance: ThemeManager
  private currentFactory: ThemeFactory
  private theme: ThemeType
  private constructor() {
    this.currentFactory = new LightThemeFactory()
    this.theme = 'light'
  }

  public static getInstance(): ThemeManager {
    if (!ThemeManager.instance) {
      ThemeManager.instance = new ThemeManager()
    }
    return ThemeManager.instance
  }

  public init(initTheme: ThemeType = 'light') {
    this.setTheme(initTheme)
  }

  public getTheme(): ThemeType {
    return this.theme
  }

  public setTheme(themeType: ThemeType) {
    this.theme = themeType
    // 应用配置到根元素
    this.applyConfig()
  }

  private applyConfig() {
    // 兼容 SSR / 非浏览器环境
    if (typeof document === 'undefined') return
    // 根据主题类型切换工厂
    this.currentFactory = this.theme === 'dark' ? new DarkThemeFactory() : new LightThemeFactory()
    const config = this.currentFactory.getConfig()
    const root = document.getElementById('app') || document.documentElement

    // 将工厂生成的CSS变量注入根元素
    Object.entries(config).forEach(([key, value]) => {
      root.style.setProperty(key, value)
    })
  }
}
export default ThemeManager
