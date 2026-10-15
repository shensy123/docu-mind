<template>
  <div class="sidebar-right-wrapper">
    <div class="sidebar-right-header">
      <h1>快捷问答</h1>
      <el-icon class="icon-btn" size="24" @click="onNewSession">
        <ChatLineRound />
      </el-icon>
    </div>
    <div class="sidebar-right-content">
      <div class="sidebar-right-title">快捷问答侧边栏</div>
      <div class="doc-preview-placeholder">文档预览/交互区域</div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ChatLineRound } from '@element-plus/icons-vue'

const onNewSession = () => {
  ElMessage.info('新建会话')
}
</script>

<style lang="scss" scoped>
.sidebar-right-wrapper {
  height: 100%;
  flex-shrink: 0;
  background: #fff;

  .sidebar-right-header {
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding: 10px;
  }

  .sidebar-right-content {
    padding: 10px;

    .sidebar-right-title {
      font-weight: bold;
      margin-bottom: 10px;
    }

    .doc-preview-placeholder {
      height: 200px;
      background-color: #eaeaea;
      display: flex;
      align-items: center;
      justify-content: center;
      color: #999;
    }
  }
}
</style>
