<!-- 侧边栏容器:BasicCollapse 包裹(展开 260px / 折叠 36px 图标栏),展开态=标题行+CvMenu(弹性滚动区)+CvSetting(固定底栏),折叠态=图标列(展开+新会话) -->
<script setup lang="ts">
import { Fold, Expand, Plus } from '@element-plus/icons-vue'
import BasicCollapse from '@/components/common/BasicCollapse.vue'
import CvMenu from './CvMenu.vue'
import CvSetting from './CvSetting.vue'
import { useConversationStore } from '@/store/conversation'

const store = useConversationStore()
const collapsed = ref(false)
const newSession = () => store.openEmptySession()
</script>

<template>
  <!-- width 必须带单位:无单位非零字符串是非法 CSS 值,展开时浏览器会拒绝赋值、保留上次的 0,导致收起后展不开 -->
  <basic-collapse
    v-model:collapsed="collapsed"
    width="260px"
    collapsed-width="36px"
    side="left"
    class="cv-sidebar shadow"
  >
    <!-- 折叠/新会话入口已内置于两种形态内,外缘切换图标弃用:插槽置空并隐藏其容器 -->
    <template #icon><span /></template>
    <!-- 展开态:标题行(折叠按钮+「会话」) + 会话列表 + 底栏 -->
    <div v-if="!collapsed" class="cv-sidebar__inner">
      <div class="cv-sidebar__header">
        <span class="cv-sidebar__title">会话列表</span>
        <el-icon class="cv-sidebar__toggle" @click="collapsed = true"><Fold /></el-icon>
      </div>
      <cv-menu class="cv-sidebar__menu" />
      <cv-setting />
    </div>
    <!-- 折叠态:36px 图标栏(展开侧栏 + 新会话) -->
    <div v-else class="cv-sidebar__rail">
      <el-icon class="cv-sidebar__rail-icon" @click="collapsed = false"><Expand /></el-icon>
      <el-icon class="cv-sidebar__rail-icon" @click="newSession"><Plus /></el-icon>
    </div>
  </basic-collapse>
</template>

<style scoped lang="scss">
// 外缘切换图标已弃用,隐藏其容器(避免残留占位与不可见点击区)
.cv-sidebar :deep(.basic-collapse__icon) {
  display: none;
}

.cv-sidebar__inner {
  display: flex;
  flex-direction: column;
  height: 100%;
  padding: 12px;
}

.cv-sidebar__header {
  display: flex;
  align-items: center;
  justify-content: space-between; // 标题与折叠图标两端对齐（2026-11-05 用户拍板）
  gap: 8px;
  padding-bottom: 8px;
}

.cv-sidebar__toggle,
.cv-sidebar__rail-icon {
  font-size: 16px;
  color: var(--el-text-color-secondary);
  cursor: pointer;

  &:hover {
    color: var(--el-color-primary);
  }
}

.cv-sidebar__title {
  font-size: 14px;
  font-weight: 600;
  color: var(--el-text-color-primary);
}

.cv-sidebar__menu {
  // 显式 grow/basis,避免与 BasicLayout 的 > * 规则冲突导致不撑满
  flex-grow: 1;
  flex-basis: 0;
  min-height: 0;
}

.cv-sidebar__rail {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 12px;
  height: 100%;
  padding: 12px 0;
}
</style>
