<!-- 消息窗口:欢迎 + 历史 + 流式(均走 CvMessageItem)+ 错误条。滚动目标为 BasicScrollContainer 的 wrapRef -->
<script setup lang="ts">
import type { ChatMessage } from '@/types/chat'
import BasicScrollContainer from '@/components/common/BasicScrollContainer.vue'
import CvMessageItem from './CvMessageItem.vue'

interface Props {
  messages: ChatMessage[]
  greeting?: string
  isStreaming?: boolean
  streamText?: string
  streamReasoning?: string
  errorMsg?: string
}
const props = withDefaults(defineProps<Props>(), {
  greeting: '',
  isStreaming: false,
  streamText: '',
  streamReasoning: '',
  errorMsg: '',
})

const emit = defineEmits<{ retry: [idx: number]; 'delete-message': [idx: number] }>()

interface ScrollContainerApi {
  scrollbar?: { wrapRef?: HTMLElement }
}
const scrollRef = useTemplateRef<ScrollContainerApi>('scrollRef')

const welcomeMessage = computed<ChatMessage>(() => ({
  role: 'assistant',
  content: props.greeting,
}))

const streamingMessage = computed<ChatMessage | null>(() =>
  props.isStreaming || props.streamText
    ? {
        role: 'assistant',
        content: props.streamText,
        reasoning: props.streamReasoning || undefined,
      }
    : null
)

const scrollToBottom = () => {
  const wrap = scrollRef.value?.scrollbar?.wrapRef
  if (wrap) wrap.scrollTo({ top: wrap.scrollHeight, behavior: 'smooth' })
}

watch(
  [() => props.messages.length, () => props.streamText, () => props.streamReasoning],
  async () => {
    await nextTick()
    scrollToBottom()
  }
)
</script>

<template>
  <basic-scroll-container ref="scrollRef" class="cv-messages">
    <div class="cv-messages__inner">
      <cv-message-item :message="welcomeMessage" />
      <cv-message-item
        v-for="(item, idx) in messages"
        :key="idx"
        :message="item"
        @retry="emit('retry', idx)"
        @delete="emit('delete-message', idx)"
      />
      <cv-message-item v-if="streamingMessage" :message="streamingMessage" streaming />
      <div v-if="errorMsg" class="cv-messages__error">❌ {{ errorMsg }}</div>
    </div>
  </basic-scroll-container>
</template>

<style scoped lang="scss">
.cv-messages {
  &__inner {
    display: flex;
    flex-direction: column;
    gap: 16px;
    padding: 16px;
  }

  &__error {
    padding: 8px 12px;
    border-radius: 6px;
    font-size: 13px;
    color: var(--el-color-danger);
    background: var(--el-color-danger-light-9);
  }
}
</style>
