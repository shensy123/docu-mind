<template>
  <div class="docu-header">
    <div class="header-actions">
      <div class="theme-switch">主题切换</div>
      <div class="theme-history">主题历史 ▼</div>
    </div>

    <div class="user-actions">
      <el-input
        v-model="searchKeyword"
        :suffix-icon="Search"
        type="text"
        placeholder="搜索记录"
        style="width: 240px"
      />
      <el-tooltip effect="dark" content="AI助手" placement="bottom">
        <el-icon class="icon-btn" @click="$router.push('/session')">
          <ChatLineRound />
        </el-icon>
      </el-tooltip>

      <el-icon class="icon-btn"><Bell /></el-icon>
      <el-icon class="icon-btn"><Setting /></el-icon>
      <div class="logout-btn">退出登录 ▼</div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ChatLineRound, Bell, Search, Setting } from '@element-plus/icons-vue'
const searchKeyword = ref('')
</script>

<style lang="scss" scoped>
.docu-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  background: #fff;
  padding: 12px;

  &,
  & > * {
    flex-shrink: 0;
    min-width: auto;
  }
}

.theme-switch {
  background: #355db9;
  color: #fff;
  border-radius: 6px;
}

.header-actions,
.user-actions {
  display: flex;
  gap: 16px;
  align-items: center;
}

.search-box {
  display: flex;
  width: 300px;
}

.search-input {
  flex: 1;
  padding: 8px 12px;
  border: 1px solid #e5e7eb;
  border-radius: 6px 0 0 6px;
  outline: none;
}

.search-btn {
  background: #165dff;
  color: #fff;
  border: none;
  border-radius: 0 6px 6px 0;
  padding: 0 12px;
  cursor: pointer;
}

.icon-btn {
  cursor: pointer;
  font-size: 16px;

  &:hover {
    color: #165dff;
  }
}

.logout-btn {
  cursor: pointer;
  font-size: 14px;
  color: #666;

  &:hover {
    color: #165dff;
  }
}
</style>
