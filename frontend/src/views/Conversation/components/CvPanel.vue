<!-- 聊天区容器(垂直):标题行 + 消息窗口(CvMessages) + 输入工具条(CvInputTools)。流式编排在 useConversationChat,状态在 store/conversation.ts -->
<script setup lang="ts">
import { ChatRound, ChatLineRound } from '@element-plus/icons-vue'
import BasicLayout from '@/components/common/BasicLayout.vue'
import CvMessages from './CvMessages.vue'
import CvInputTools from './CvInputTools.vue'
import { useConversationStore } from '@/store/conversation'
import { useAiModel } from '@/composables/useAiModel'
import { useConversationChat } from '@/composables/useConversationChat'

const store = useConversationStore()
const { AI_MODEL_LIST } = useAiModel()

const {
  inputText,
  isStreaming,
  streamText,
  streamReasoning,
  errorMsg,
  sendMessage,
  stopStreaming,
  retryMessage,
} = useConversationChat(store)

const messages = computed(() => store.currentSession.messages || [])
const title = computed(() => store.currentSession.title || '新会话（New Chat Session）')
const greeting = computed(
  () => AI_MODEL_LIST.find(item => item.modelKey === store.currentModelKey)?.greeting || ''
)
const modelKey = computed({
  get: () => store.currentModelKey,
  set: (key: string) => store.updateModelKey(key),
})

const deleteChatMessage = (idx: number) => store.deleteMessage(idx)
const onTemporaryChat = () => store.onTemporarySession()
</script>

<template>
  <basic-layout direction="vertical" class="cv-panel">
    <header class="cv-panel__header">
      <h1 class="cv-panel__title">{{ title }}</h1>
      <div class="cv-panel__actions">
        <el-tooltip content="临时对话">
          <el-icon class="cv-panel__action" @click="onTemporaryChat"><ChatRound /></el-icon>
        </el-tooltip>
        <el-tooltip content="开启新对话">
          <el-icon class="cv-panel__action" @click="onTemporaryChat"><ChatLineRound /></el-icon>
        </el-tooltip>
      </div>
    </header>
    <cv-messages
      :messages="messages"
      :greeting="greeting"
      :is-streaming="isStreaming"
      :stream-text="streamText"
      :stream-reasoning="streamReasoning"
      :error-msg="errorMsg"
      @retry="retryMessage"
      @delete-message="deleteChatMessage"
    />
    <cv-input-tools
      v-model:input-text="inputText"
      v-model:model-key="modelKey"
      :is-streaming="isStreaming"
      :model-list="AI_MODEL_LIST"
      @send="sendMessage"
      @stop-streaming="stopStreaming"
    />
  </basic-layout>
</template>

<style scoped lang="scss">
.cv-panel {
  &__header {
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding: 16px;
    border-bottom: 1px solid var(--el-border-color-lighter);
  }

  &__title {
    margin: 0;
    font-size: 20px;
    color: var(--el-text-color-primary);
  }

  &__actions {
    display: flex;
    gap: 12px;
  }

  &__action {
    font-size: 18px;
    color: var(--el-text-color-regular);
    cursor: pointer;

    &:hover {
      color: var(--el-color-primary);
    }
  }
}
</style>
