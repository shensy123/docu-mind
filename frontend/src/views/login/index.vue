<template>
  <div class="login-page">
    <!-- 主容器 -->
    <div class="main-container">
      <!-- 左侧产品介绍区 -->
      <div class="product-intro">
        <h1 class="product-title">DocuMind智能文档问答助手</h1>
        <p class="product-desc">
          产品简介智能文档能实现毛黑大震点高简介发化问手智能银键，适鱼指给，动筋管理格公用户告前治页间要点，渐入答手机管理、通流化，为创面裙符智能式流式动加载动态。
        </p>
        <div class="function-buttons">
          <RouterLink to="/document">
            <el-button type="primary" :icon="Upload">文档上传</el-button>
          </RouterLink>

          <RouterLink to="/chat">
            <el-button type="primary" :icon="ChatLineRound">AI问答</el-button>
          </RouterLink>

          <el-button type="primary" :icon="DataAnalysis">流式回复</el-button>
          <el-button type="primary" :icon="FolderOpened">多文档管理</el-button>
        </div>
      </div>

      <!-- 右侧登录表单区 -->
      <div class="login-form-wrapper">
        <LoginForm @login="handleLogin" />
      </div>
    </div>

    <!-- 底部版权信息 -->
    <div class="footer">
      <p>DocuMind 智能文档问答系统 | 版权所有© 2026 SmartDoc AI</p>
    </div>
  </div>
</template>

<script setup lang="ts">
defineOptions({ name: 'LoginIndex' })
import { useRouter } from 'vue-router'
import { useAuthStore } from '@/store/auth'
import LoginForm from './LoginForm.vue'
import '@/styles/login.scss'
import { ChatLineRound, DataAnalysis, FolderOpened, Upload } from '@element-plus/icons-vue'

const router = useRouter()
const authStore = useAuthStore()

// 登录处理逻辑
const handleLogin = () => {
  // 记录登录态
  authStore.login()
  // 登录成功跳转首页
  router.push('/')
}
</script>
