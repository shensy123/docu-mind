import type { Router } from 'vue-router'
import { useAuthStore } from '@/store/auth'

export function setupAuthGuard(router: Router) {
  // router.beforeEach((to, from, next) => {
  //   const isLoggedIn = !!localStorage.getItem('token')
  //   if (to.meta.requiresAuth && !isLoggedIn) {
  //     next('/login')
  //   } else {
  //     next()
  //   }
  // })

  // 路由前置守卫：鉴权 + 设置页面标题
  router.beforeEach(to => {
    const authStore = useAuthStore()
    // 初始化鉴权状态
    authStore.initAuthState()

    // 设置页面标题
    if (to.meta.title) {
      document.title = to.meta.title as string
    }

    // 鉴权校验
    if (to.meta.requiresAuth && !authStore.isLogin) {
      ElMessage.warning('请先登录')
      return '/login'
    } else {
      return true
    }
  })
}
