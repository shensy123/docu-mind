<template>
  <el-menu v-bind="attrs">
    <template v-for="item in data" :key="item[index]">
      <el-sub-menu v-if="item[children]?.length" :index="item[index]">
        <template #title>
          <slot :name="!!slots.levelOne ? 'levelOne' : 'default'" v-bind="item"></slot>
        </template>
        <template v-for="childrenItem in item.children" :key="childrenItem[index]">
          <el-menu-item :index="childrenItem[index]">
            <slot :name="!!slots.lowLevel ? 'lowLevel' : 'default'" v-bind="childrenItem"></slot>
          </el-menu-item>
        </template>
      </el-sub-menu>
      <el-menu-item :index="item[index]" v-else>
        <slot :name="!!slots.levelOne ? 'levelOne' : 'default'" v-bind="item"></slot>
      </el-menu-item>
    </template>
  </el-menu>
</template>

<script setup lang="ts" generic="T extends Record<string, any>">
const attrs = useAttrs()
const slots = useSlots()

const props = withDefaults(
  defineProps<{
    data: T[]
    index: keyof T
    children?: keyof T & string
  }>(),
  {
    children: 'children',
  }
)
const { data, index, children } = toRefs(props)
</script>
