import { defineStore } from 'pinia'

interface AuthState {
  isLogin: boolean
}

export const useAuthStore = defineStore('auth', {
  state: (): AuthState => ({
    isLogin: false,
  }),
  actions: {
    // 登录（模型密钥已统一由 bff 持有，此处仅维护登录标记）
    login() {
      this.isLogin = true
      localStorage.setItem('auth_login', '1')
    },
    // 退出登录
    logout() {
      this.isLogin = false
      localStorage.removeItem('auth_login')
    },
    // 初始化鉴权状态（页面刷新后）；顺带清除旧版密钥机制的本地残留
    initAuthState() {
      localStorage.removeItem('authKeys')
      this.isLogin = localStorage.getItem('auth_login') === '1'
    },
  },
})
