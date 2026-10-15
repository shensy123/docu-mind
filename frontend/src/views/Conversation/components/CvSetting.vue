<!-- 用户信息 + 设置入口(预留:后续挂头像/用户名等扩展位) -->
<script setup lang="ts">
import { Setting } from '@element-plus/icons-vue'

const openSetting = () => ElMessage.info('打开设置：待开发')
</script>

<template>
  <footer class="cv-setting">
    <el-button :icon="Setting" class="cv-setting__button" text @click="openSetting">设置</el-button>
  </footer>
</template>

<style scoped lang="scss">
.cv-setting {
  margin-top: 12px;

  &__button {
    width: 100%;
  }
}
</style>
