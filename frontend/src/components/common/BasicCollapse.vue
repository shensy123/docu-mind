<script setup lang="ts">
import { Expand, Fold } from '@element-plus/icons-vue'

// 折叠状态 v-model:collapsed(Vue 3.4+ defineModel,宏自动声明 update:collapsed)
const collapsed = defineModel<boolean>('collapsed', { default: false })

const props = withDefaults(
  defineProps<{
    width?: string | number
    collapsedWidth?: string | number
    side?: 'left' | 'right'
    iconSize?: number | string
    iconColor?: string
  }>(),
  {
    width: 'auto',
    collapsedWidth: '0',
    side: 'left',
    iconSize: 16,
  }
)

const panelWidth = computed(() => (collapsed.value ? props.collapsedWidth : props.width))
const toggle = () => (collapsed.value = !collapsed.value)

// icon 方向随 side 翻转:面板从哪侧来,箭头就指向哪侧
const iconComponent = computed(() => {
  const [expandIcon, foldIcon] = props.side === 'left' ? [Expand, Fold] : [Fold, Expand]
  return collapsed.value ? expandIcon : foldIcon
})
</script>

<template>
  <div class="basic-collapse" :class="[`basic-collapse--${side}`, { 'is-collapsed': collapsed }]">
    <div class="basic-collapse__body" :style="{ width: panelWidth }">
      <slot />
    </div>
    <div class="basic-collapse__icon" @click="toggle">
      <slot name="icon" :collapsed="collapsed">
        <el-icon :size="iconSize" v-bind="iconColor !== undefined ? { color: iconColor } : {}">
          <component :is="iconComponent" />
        </el-icon>
      </slot>
    </div>
  </div>
</template>

<style scoped lang="scss">
.basic-collapse {
  display: flex;
  flex-shrink: 0;

  &--left {
    flex-direction: row;
  }

  &--right {
    flex-direction: row-reverse;
  }

  &__body {
    flex-shrink: 0;
    min-width: 0;
    overflow: hidden;
    transition: width 0.2s;
  }

  &__icon {
    display: flex;
    align-items: center;
    justify-content: center;
    flex-shrink: 0;
    padding: 8px 4px;
    cursor: pointer;
    color: inherit;

    &:hover {
      color: #409eff;
    }
  }
}
</style>
