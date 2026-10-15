import { createRouter, createWebHistory, type RouteRecordRaw } from 'vue-router'
import Login from '@/views/login/index.vue'
import MainLayout from '@/layouts/MainLayout.vue'
// import DocuLayout from '@/layouts/DocuLayout.vue'
import SettingLayout from '@/views/DocuSetting/SettingLayout.vue'
import menuRoutes from './menuRoutes'
import settingRoutes from './settingRoutes'
import { setupAuthGuard } from './guards/auth'

// 导入组件
// const Login = () => import('@/views/login/index.vue')

// constantRoutes: 不需要鉴权的路由
const constantRoutes: RouteRecordRaw[] = [
  {
    path: '/login',
    name: 'Login',
    component: Login,
    meta: {
      title: '智能文档问答助手 - 登录',
      requiresAuth: false,
    },
  },
  {
    path: '/404',
    name: 'NotFound',
    component: () => import('@/views/NotFound.vue'),
  },
]

// asyncRoutes: 需要鉴权的路由
const asyncRoutes: RouteRecordRaw[] = [
  {
    path: '/',
    redirect: '/home',
    // component: DocuLayout,
    component: MainLayout,
    children: menuRoutes,
  },
  {
    path: '/setting',
    redirect: '/setting/theme',
    component: SettingLayout,
    children: settingRoutes,
  },
  {
    path: '/:catchAll(.*)',
    redirect: '/404',
  },
]

const routes: RouteRecordRaw[] = [...constantRoutes, ...asyncRoutes]

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes,
})

// 路由前置守卫：鉴权 + 设置页面标题（实现在 guards/auth.ts）
setupAuthGuard(router)

export default router
