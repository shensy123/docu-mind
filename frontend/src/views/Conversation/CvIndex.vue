<!-- 页面入口+编排:横向 BasicLayout,侧边栏固定、聊天区弹性 -->
<!-- 2026-11-05 起挂载为顶层路由 /conversation(默认落地页),height:100vh 撑满视口(同 MainLayout 惯例) -->
<script setup lang="ts">
import BasicLayout from '@/components/common/BasicLayout.vue'
import CvSidebar from './components/CvSidebar.vue'
import CvPanel from './components/CvPanel.vue'
</script>

<template>
  <basic-layout direction="horizontal" style="height: 100vh; background: white">
    <cv-sidebar />
    <cv-panel />
  </basic-layout>
</template>
