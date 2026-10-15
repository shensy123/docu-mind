import { ref, computed } from 'vue'
import { AI_MODEL_LIST, type AiModelItem } from '@/types/chat/aiModel'

export function useAiModel(modelKey?: string) {
  // 当前选中模型key，默认qwen-turbo
  const currentModelKey = ref<string>(modelKey || 'qwen-turbo')

  // 自动获取当前完整模型对象
  const currentModel = computed<AiModelItem | undefined>(() => {
    return AI_MODEL_LIST.find(item => item.modelKey === currentModelKey.value)
  })

  // 切换模型方法
  const switchAiModel = (key: string) => {
    const exists = AI_MODEL_LIST.some(item => item.modelKey === key)
    if (exists) currentModelKey.value = key
  }

  return {
    AI_MODEL_LIST,
    currentModelKey,
    currentModel,
    switchAiModel,
  }
}
