<template>
  <el-tabs
    :model-value="activeTab"
    type="card"
    @tab-remove="removeTab"
    @tab-change="handleTabChange"
  >
    <el-tab-pane
      v-for="item in tabList"
      :key="item.path"
      :label="item.title"
      :name="item.path"
      closable
    />
  </el-tabs>
</template>

<script setup lang="ts">
const route = useRoute()
const router = useRouter()
const activeTab = ref('')
const tabList = ref<{ path: string; title: string }[]>([])

// 监听路由变化，新增标签
watch(
  () => route.path,
  path => {
    activeTab.value = path
    const has = tabList.value.some(item => item.path === path)
    if (!has && route.meta.title) {
      tabList.value.push({
        path,
        title: route.meta.title as string,
      })
    }
  },
  { immediate: true }
)

const removeTab = (path: string): undefined => {
  const idx = tabList.value.findIndex(item => item.path === path)
  if (idx > -1) {
    tabList.value.splice(idx, 1)
    // 关闭当前页则跳转到最后一个
    if (activeTab.value === path) {
      const last = tabList.value[tabList.value.length - 1]
      router.push(last?.path || '/home')
    }
  }
}

const handleTabChange = (path: string): undefined => {
  router.push(path)
}
</script>
