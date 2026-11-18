<!-- 用户信息 + 设置入口 + 删除所有会话(预留:后续挂头像/用户名等扩展位) -->
<script setup lang="ts">
import { Setting, Delete } from '@element-plus/icons-vue'
import { ElMessageBox } from 'element-plus' // ElMessageBox 不在 auto-import 生效集(见 ChatList.vue 同款显式引入)
import 'element-plus/es/components/message-box/style/css' // 显式引入绕过 unplugin 解析,须手动补按需样式(同 CvMenu)
import { useConversationStore } from '@/store/conversation'

const store = useConversationStore()
const router = useRouter()

// 批3(2026-11-18):设置入口接 AI 供应商设置页(顶层路由,不依赖 /setting 的 SettingLayout)
const openSetting = () => router.push('/ai-provider')

const deleteAllSession = () => {
  ElMessageBox.confirm('确定要删除所有会话吗?', '删除所有会话', { type: 'warning' })
    .then(() => store.deleteAllSessions())
    .catch(() => {})
}
</script>

<template>
  <footer class="cv-setting">
    <el-button :icon="Delete" class="cv-setting__button" text @click="deleteAllSession"
      >删除所有会话</el-button
    >
    <el-button :icon="Setting" class="cv-setting__button" text @click="openSetting">设置</el-button>
  </footer>
</template>

<style scoped lang="scss">
.cv-setting {
  margin-top: 12px;

  &__button {
    width: 100%;

    & + & {
      margin-top: 4px; // 纵向排列:覆盖 el-button 相邻默认 margin-left,改为垂直间距
      margin-left: 0;
    }
  }
}
</style>
