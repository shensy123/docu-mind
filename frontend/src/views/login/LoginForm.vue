<template>
  <div class="login-form-card">
    <h2 class="login-title">登录入口</h2>
    <el-button type="primary" class="login-btn" @click="handleLogin">登录</el-button>
  </div>
</template>

<script setup lang="ts">
// 登录不再收集 API Key（模型密钥统一由 bff 持有），仅保留登录动作
const emit = defineEmits<{
  (e: 'login'): void
}>()

// 触发父组件登录事件
const handleLogin = () => {
  emit('login')
}
</script>

<style scoped>
.login-form-card {
  width: 100%;
  padding: 2rem;
  border-radius: 8px;
  background: rgb(18 26 56 / 80%);
  box-shadow: 0 0 20px rgb(0 123 255 / 30%);
}

.login-title {
  text-align: center;
  margin-bottom: 2rem;
  color: #fff;
  font-size: 1.8rem;
}

.login-btn {
  width: 100%;
  height: 48px;
  font-size: 1rem;
  background: linear-gradient(90deg, #409eff, #67c23a);
  border: none;
}
</style>
