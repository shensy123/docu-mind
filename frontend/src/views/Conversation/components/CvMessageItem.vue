<!-- 单条消息气泡:历史 + 流式(streaming)共用;assistant 出错/中断时显示 重新生成/删除 -->
<script setup lang="ts">
import type { ChatMessage } from '@/types/chat'

interface Props {
  message: ChatMessage
  streaming?: boolean
}
const props = withDefaults(defineProps<Props>(), { streaming: false })

const emit = defineEmits<{ retry: []; delete: [] }>()

const showActions = computed(
  () =>
    props.message.role === 'assistant' &&
    !props.streaming &&
    (props.message.error || props.message.interrupted)
)
const displayText = computed(() => props.message.content || (props.streaming ? '思考中...' : ''))
const authorLabel = computed(() => (props.message.role === 'user' ? '我' : 'AI'))
const reasoningSummary = computed(() => (props.streaming ? '🤔 思考中...' : '🤔 思考过程'))
</script>

<template>
  <div
    :class="['cv-message-item', `cv-message-item--${message.role}`, { 'is-streaming': streaming }]"
  >
    <div class="cv-message-item__author">{{ authorLabel }}</div>
    <div class="cv-message-item__bubble">
      <details v-if="message.reasoning" class="cv-message-item__reasoning" :open="streaming">
        <summary>{{ reasoningSummary }}</summary>
        <div class="cv-message-item__reasoning-content">{{ message.reasoning }}</div>
      </details>
      <div class="cv-message-item__text">
        {{ displayText }}
        <span v-if="streaming" class="cv-message-item__cursor">|</span>
      </div>
      <div v-if="showActions" class="cv-message-item__actions">
        <button class="cv-message-item__retry" @click="emit('retry')">🔄 重新生成</button>
        <el-button size="small" @click="emit('delete')">删除</el-button>
      </div>
    </div>
  </div>
</template>

<style scoped lang="scss">
.cv-message-item {
  display: flex;
  gap: 12px;

  &--user {
    flex-direction: row-reverse;

    .cv-message-item__bubble {
      background: var(--el-color-primary-light-8);
    }
  }

  &--assistant .cv-message-item__bubble {
    background: var(--el-fill-color-light);
    border: 1px solid var(--el-border-color-lighter);
  }

  &__author {
    display: flex;
    align-items: center;
    justify-content: center;
    flex-shrink: 0;
    width: 36px;
    height: 36px;
    border-radius: 50%;
    background: var(--el-color-primary);
    color: #fff;
    font-size: 13px;
  }

  &__bubble {
    max-width: 70%;
    padding: 10px 14px;
    border-radius: 8px;
    line-height: 1.6;
    color: var(--el-text-color-primary);
  }

  &__text {
    white-space: pre-wrap;
    overflow-wrap: break-word;
  }

  &__cursor {
    animation: cv-message-item-blink 0.8s infinite;
  }

  &__reasoning {
    margin-bottom: 8px;
    font-size: 12px;
    color: var(--el-text-color-secondary);

    &-content {
      margin-top: 6px;
      padding: 8px;
      border-radius: 6px;
      background: var(--el-fill-color);
      white-space: pre-wrap;
      overflow-wrap: break-word;
    }
  }

  &__actions {
    display: flex;
    gap: 8px;
    margin-top: 8px;
  }

  &__retry {
    padding: 2px 8px;
    border: none;
    background: transparent;
    font-size: 12px;
    color: var(--el-color-primary);
    cursor: pointer;
  }
}

@keyframes cv-message-item-blink {
  0%,
  100% {
    opacity: 1;
  }

  50% {
    opacity: 0;
  }
}
</style>
