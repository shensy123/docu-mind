<script setup lang="ts">
interface ScrollbarLike {
  setScrollTop?: (top: number) => void
  wrapRef?: HTMLElement
}

const scrollbarRef = ref<ScrollbarLike>()

const setScrollTop = (top: number) => scrollbarRef.value?.setScrollTop?.(top)
const wrapScrollTo = (options: ScrollToOptions) => scrollbarRef.value?.wrapRef?.scrollTo(options)

defineExpose({ scrollbar: scrollbarRef, setScrollTop, wrapScrollTo })
</script>

<template>
  <el-scrollbar
    ref="scrollbarRef"
    wrap-class="basic-scroll-container__wrap"
    view-class="basic-scroll-container__view"
  >
    <slot />
  </el-scrollbar>
</template>

<style scoped lang="scss">
.el-scrollbar {
  height: 100%;
  width: 100%;
}

:deep(.basic-scroll-container__view) {
  display: flex;
  flex-direction: column;
  min-height: 0;
  height: 100%;
}
</style>
