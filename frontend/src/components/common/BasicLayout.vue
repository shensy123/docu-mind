<script setup lang="ts">
interface Props {
  direction?: 'vertical' | 'horizontal'
}

const props = withDefaults(defineProps<Props>(), {
  direction: 'horizontal',
})

const layoutClass = computed(() => `basic-layout--${props.direction}`)
</script>

<template>
  <div :class="['basic-layout', layoutClass]">
    <slot />
  </div>
</template>

<style scoped lang="scss">
.basic-layout {
  display: flex;
  height: 100%;

  // 固定部分默认不被压缩;min-*:0 允许弹性区收缩到内容尺寸以下
  & > * {
    flex-shrink: 0;
    min-width: 0;
    min-height: 0;
  }

  // 弹性区:3 元素=中间,2 元素=横向右侧/纵向底部
  & > :nth-child(2) {
    flex: 1;
  }

  // 单元素填满容器
  & > :only-child {
    flex: 1;
  }

  &--vertical {
    flex-direction: column;
  }
}
</style>
