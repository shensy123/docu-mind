import type { RouteRecordRaw } from 'vue-router'

const settingRoutes: RouteRecordRaw[] = [
  {
    name: 'ThemeSetting',
    path: '/setting/theme',
    component: () => import('@/views/DocuSetting/Theme.vue'),
    meta: {
      title: '主题设置',
    },
  },
  {
    name: 'DcuSetting',
    path: '/docuSetting',
    component: () => import('@/views/DocuSetting/Document.vue'),
    meta: { title: '文档设置' },
  },
]
export default settingRoutes
