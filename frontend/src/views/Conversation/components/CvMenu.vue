<!-- 会话菜单:会话列表(新建入口在 CvPanel 头部/CvSidebar 折叠栏,删除所有在 CvSetting 底栏)。状态直接读写 store/conversation.ts(受控 v-for,不用 VMenuList) -->
<script setup lang="ts">
import { Edit, Close } from '@element-plus/icons-vue'
import { ElMessageBox } from 'element-plus' // ElMessageBox 不在 auto-import 生效集(见 ChatList.vue 同款显式引入)
import 'element-plus/es/components/message-box/style/css' // 显式引入绕过 unplugin 解析,须手动补按需样式,否则弹窗 overlay 定位 CSS 缺失、弹窗渲染在页面底部
import type { BasicSession } from '@/types/chat'
import BasicLayout from '@/components/common/BasicLayout.vue'
import BasicScrollContainer from '@/components/common/BasicScrollContainer.vue'
import { useConversationStore } from '@/store/conversation'

const store = useConversationStore()

const formatTime = (time?: Date) => {
  if (!time) return ''
  const date = new Date(time)
  const pad = (n: number) => String(n).padStart(2, '0')
  return `${date.getMonth() + 1}/${date.getDate()} ${pad(date.getHours())}:${pad(date.getMinutes())}`
}

const openSession = (id: string) => store.openSession(id)

const editSessionName = (session: BasicSession) => {
  ElMessageBox.prompt('请输入会话名称', '编辑会话', { inputValue: session.title })
    .then(({ value }) => {
      if (value) store.updateSessionName(session.id, value)
    })
    .catch(() => {})
}

const removeSession = (id: string) => {
  ElMessageBox.confirm('确定要删除该会话吗?', '删除会话', { type: 'warning' })
    .then(() => store.deleteSession(id))
    .catch(() => {})
}
</script>

<template>
  <basic-layout direction="vertical">
    <basic-scroll-container class="cv-menu__list">
      <!-- 空态:会话列表为空时给出提示,避免空白区 -->
      <div v-if="store.sessionList.length === 0" class="cv-menu__empty">暂无会话内容</div>
      <div
        v-for="session in store.sessionList"
        :key="session.id"
        class="cv-menu__item"
        :class="{ 'is-active': session.id === store.currentSession.id }"
        @click="openSession(session.id)"
      >
        <div class="cv-menu__item-main">
          <span class="cv-menu__item-title">{{ session.title }}</span>
          <span class="cv-menu__item-time">{{ formatTime(session.updatedTime) }}</span>
        </div>
        <div class="cv-menu__item-ops">
          <el-icon class="cv-menu__item-icon" @click.stop="editSessionName(session)"
            ><Edit
          /></el-icon>
          <el-icon class="cv-menu__item-icon" @click.stop="removeSession(session.id)"
            ><Close
          /></el-icon>
        </div>
      </div>
    </basic-scroll-container>
  </basic-layout>
</template>

<style scoped lang="scss">
.cv-menu {
  &__empty {
    padding: 24px 0;
    font-size: 14px;
    color: var(--el-text-color-secondary);
    text-align: center;
  }

  &__item {
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 8px;
    margin-bottom: 4px;
    padding: 10px 12px;
    border-radius: 6px;
    cursor: pointer;

    &:hover {
      background: var(--el-fill-color-light);
    }

    &.is-active {
      background: var(--el-color-primary-light-8);
    }

    &-main {
      display: flex;
      flex-direction: column;
      overflow: hidden;
    }

    &-title {
      font-size: 14px;
      color: var(--el-text-color-primary);
      overflow: hidden;
      text-overflow: ellipsis;
      white-space: nowrap;
    }

    &-time {
      margin-top: 4px;
      font-size: 12px;
      color: var(--el-text-color-secondary);
    }

    &-ops {
      display: flex;
      flex-shrink: 0;
      gap: 4px;
    }

    &-icon {
      color: var(--el-text-color-secondary);
      cursor: pointer;

      &:hover {
        color: var(--el-color-primary);
      }
    }
  }
}
</style>
