import HomeView from '@/views/HomeView.vue'
import { House, Document, ChatDotRound, Setting, MessageBox, User } from '@element-plus/icons-vue'
import { type RouteRecordRaw } from 'vue-router'

const menuRoutes: RouteRecordRaw[] = [
  {
    path: '/home',
    name: 'Home',
    component: HomeView,
    meta: { title: '首页', icon: House },
  },
  {
    path: '/user',
    name: 'User',
    component: () => import('@/views/user/index.vue'),
    meta: { title: '用户中心', icon: User },
  },
  {
    path: '/document',
    name: 'Document',
    meta: { title: '文档', icon: Document },
    children: [
      {
        path: '/document/list',
        name: 'DocumentUpload',
        component: () => import('@/views/Document/DocumentUpload.vue'),
        meta: { title: '文档上传', icon: Document },
      },
      {
        path: '/document/manage',
        name: 'Documents',
        component: () => import('@/views/Document/DocumentManage.vue'),
        meta: { title: '文档管理', icon: MessageBox },
      },
    ],
  },
  {
    path: '/chat',
    name: 'Chat',
    meta: { title: '聊天', icon: ChatDotRound },
    children: [
      {
        path: '/chat/component',
        name: 'ChatComponent',
        component: () => import('@/views/Conversation/CvIndex.vue'),
        meta: { title: 'Conversation' },
      },
    ],
  },
  {
    path: '/admin',
    name: 'Admin',
    component: () => import('@/views/SettingPage.vue'),
    meta: { title: '管理员专区', icon: User, roles: ['admin'], requiresAuth: true },
  },
  {
    path: '/about',
    name: 'about',
    // route level code-splitting:Chinese
    // this generates a separate chunk (About.[hash].js) for this route:中文翻译：路由级别的代码分割：这会为这个路由生成一个单独的块（About.[hash].js），:
    // which is lazy-loaded when the route is visited.
    component: () => import('@/views/AboutView.vue'),
    meta: { title: '关于', icon: Setting, hidden: true },
  },
  {
    path: '/setMenu',
    name: 'Setting',
    component: () => import('@/views/SettingPage.vue'),
    meta: { title: '设置', icon: Setting },
  },
]

export default menuRoutes
