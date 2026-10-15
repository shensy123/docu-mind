<template>
  <el-aside class="sidebar-left" :width="isCollapse ? '64px' : 'auto'">
    <basic-layout direction="vertical" style="height: 100vh">
      <div class="sidebar-header">
        <el-image class="logo-img" :src="logoImage" alt="Logo" />
        <h2 class="app-title" v-if="!isCollapse">DocuMind</h2>
      </div>

      <!-- <el-menu
        :default-active="route.path"
        :default-openeds="openedMenus"
        :collapse="isCollapse"
        router
        ellipsis
      >
        <v-list-item
          v-for="item in sidebarRoutes"
          :key="item.path"
          :title="item.meta?.title"
          :icon="item.meta?.icon"
          :path="item.path"
        />
      </el-menu> -->

      <basic-scroll-container>
        <VMenuList
          :collapse="isCollapse"
          :data="sidebarRoutes"
          :default-active="route.path"
          :default-openeds="openedMenus"
          router
          ellipsis
          index="path"
          children="children"
          class="v-menu-list"
        >
          <template #levelOne="{ meta: { title, icon } }">
            <el-icon><component :is="icon" /></el-icon>
            <span>{{ title }}</span>
          </template>
          <template #lowLevel="{ meta: { title } }">
            {{ title }}
          </template>
        </VMenuList>
      </basic-scroll-container>

      <div class="sidebar-footer">
        <el-button type="primary" :icon="Plus">
          <span v-if="!isCollapse">新建文档</span>
        </el-button>
        <el-button :icon="isCollapse ? Expand : Fold" @click="isCollapse = !isCollapse">
          <span v-if="!isCollapse">{{ isCollapse ? '展开' : '收起' }}侧边栏</span>
        </el-button>
      </div>
    </basic-layout>
  </el-aside>
</template>

<script setup lang="ts">
import { filterHiddenRoutes, getDefaultOpenedMenus } from '@/utils/routeHelper'
import { Expand, Fold, Plus } from '@element-plus/icons-vue'
import VMenuList from './VMenuList.vue'
import logoImage from '@/assets/images/LOGO.png'
import menuRoutes from '@/router/menuRoutes'

const route = useRoute()
const sidebarRoutes = filterHiddenRoutes(menuRoutes)
const openedMenus = getDefaultOpenedMenus(sidebarRoutes)
const isCollapse = ref(false)
</script>

<style lang="scss" scoped>
.sidebar-left {
  background: #fff;
  display: flex;
  flex-direction: column;
  align-items: center;

  .sidebar-header {
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 12px;
    padding: 12px 12px 20px;

    .logo-img {
      display: block;
      width: 40px;
      height: 40px;
      cursor: pointer;
    }
  }

  .v-menu-list {
    border-right: none;

    :deep(.el-menu-item.is-active) {
      background: #409eff1a !important;
    }
  }

  .sidebar-footer {
    display: flex;
    flex-direction: column;
    gap: 8px;
    padding: 12px 6px;

    .el-button {
      margin: 0;
    }
  }
}
</style>
