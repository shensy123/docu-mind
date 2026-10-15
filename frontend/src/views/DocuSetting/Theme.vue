<template>
  <div class="theme-setting">
    <el-card class="theme-setting__card" shadow="never">
      <template #header>主题设置</template>
      <el-radio-group v-model="theme">
        <el-radio-button value="light">浅色</el-radio-button>
        <el-radio-button value="dark">深色</el-radio-button>
      </el-radio-group>
      <p class="theme-setting__tip">切换立即生效，刷新页面后保持所选主题。</p>
    </el-card>
  </div>
</template>

<script setup lang="ts">
import { useThemeStore } from '@/store/setTheme'

// theme 为 store 内的可写 computed（代理 ThemeManager 单例），v-model 切换并持久化
const { theme } = storeToRefs(useThemeStore())
</script>

<style scoped lang="scss">
.theme-setting__tip {
  margin-top: 12px;
  font-size: 12px;
  color: var(--el-text-color-secondary);
}
</style>
