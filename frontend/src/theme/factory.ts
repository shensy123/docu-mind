// 抽象工厂：定义主题配置接口
export class ThemeFactory {
  // 返回主题CSS变量配置
  getConfig(): Record<string, string> {
    return {}
  }
}

// 亮色主题工厂
export class LightThemeFactory extends ThemeFactory {
  getConfig() {
    return {
      '--el-color-primary': '#409eff',
      '--el-button-bg-color': '#409eff',
      '--el-button-text-color': '#ffffff',
      '--el-card-bg-color': '#ffffff',
      '--el-input-bg-color': '#ffffff',
      '--el-text-color-primary': '#303133',
      // 其他组件CSS变量...
    }
  }
}

// 暗色主题工厂
export class DarkThemeFactory extends ThemeFactory {
  getConfig() {
    return {
      '--el-color-primary': '#337ecc',

      '--el-button-bg-color': '#1867c0',
      '--el-button-text-color': '#e5eaf3',

      '--el-card-bg-color': '#1d1e20 !important',

      '--el-input-bg-color': '#252628',

      '--el-text-color-primary': '#e5eaf3',
      // 其他组件CSS变量...
    }
  }
}
