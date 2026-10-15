<!-- 页面入口+编排:横向 BasicLayout,侧边栏固定、聊天区弹性 -->
<script setup lang="ts">
import BasicLayout from '@/components/common/BasicLayout.vue'
import CvSidebar from './components/CvSidebar.vue'
import CvPanel from './components/CvPanel.vue'
</script>

<template>
  <basic-layout direction="horizontal" style="background: white">
    <cv-sidebar />
    <cv-panel />
  </basic-layout>
</template>
