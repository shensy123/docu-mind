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
    // 默认落地页(2026-11-05 拍板):Conversation 顶层整页渲染,不套后台 MainLayout;
    // 后台路由(/home /user /document/* /chat/component /admin /setMenu /setting/*)不变,仅地址栏直达
    path: '/conversation',
    name: 'Conversation',
    component: () => import('@/views/Conversation/CvIndex.vue'),
    meta: { title: 'Conversation' },
  },
  {
    // AI 供应商设置(批3 MVP 2026-11-18):顶层整页,同 /conversation 惯例;
    // 不挂 /setting 子路由——SettingLayout 现无 router-view,子路由无法渲染(现状疑点,见批3回执)
    path: '/ai-provider',
    name: 'AiProvider',
    component: () => import('@/views/DocuSetting/AiProvider.vue'),
    meta: { title: 'AI 供应商设置' },
  },
  {
    path: '/',
    redirect: '/conversation',
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
