<template>
  <basic-layout direction="horizontal" style="height: 100vh">
    <VAsideLeft />

    <basic-layout direction="vertical" style="background-color: #eee; min-width: 600px">
      <VHeaderOperate />
      <basic-scroll-container>
        <basic-layout direction="vertical" class="content-view" style="padding: 20px">
          <div class="content-header">
            <el-breadcrumb separator="/" style="margin-bottom: 10px">
              <el-breadcrumb-item v-for="item in breadcrumbList" :key="item.path" :to="item.path">
                {{ item.title }}
              </el-breadcrumb-item>
            </el-breadcrumb>
            <VTabHistory />
          </div>
          <router-view />
        </basic-layout>
      </basic-scroll-container>
    </basic-layout>

    <FastAsideRight />
  </basic-layout>
</template>

<script setup lang="ts">
import VAsideLeft from './vAsideLeft.vue'
import VHeaderOperate from './vHeaderOperate.vue'
import VTabHistory from './vTabHistory.vue'
import FastAsideRight from './FastAsideRight.vue'
import { getBreadcrumbList } from '@/utils/routeHelper'

const route = useRoute()
const breadcrumbList = computed(() => getBreadcrumbList(route).slice(1))
</script>
