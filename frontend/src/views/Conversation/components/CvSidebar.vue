<!-- 侧边栏容器:BasicCollapse 包裹(折叠交互预留),CvMenu(弹性滚动区) + CvSetting(固定底栏) -->
<script setup lang="ts">
import BasicCollapse from '@/components/common/BasicCollapse.vue'
import CvMenu from './CvMenu.vue'
import CvSetting from './CvSetting.vue'
const collapsed = ref(false)
</script>

<template>
  <basic-collapse
    v-model:collapsed="collapsed"
    width="260"
    collapsed-width="0"
    side="left"
    class="cv-sidebar shadow"
  >
    <!-- <template #icon>
      折叠交互预留:后续改 v-model:collapsed 激活(静态 :collapsed 无监听,点击仅 emit 不翻转,惰性)
    </template> -->
    <div class="cv-sidebar__inner">
      <cv-menu class="cv-sidebar__menu" />
      <cv-setting />
    </div>
  </basic-collapse>
</template>

<style scoped lang="scss">
.cv-sidebar__inner {
  display: flex;
  flex-direction: column;
  height: 100%;
  padding: 12px;
}

.cv-sidebar__menu {
  // 显式 grow/basis,避免与 BasicLayout 的 > * 规则冲突导致不撑满
  flex-grow: 1;
  flex-basis: 0;
  min-height: 0;
}
</style>
