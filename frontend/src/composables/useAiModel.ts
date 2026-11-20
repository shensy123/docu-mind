// 模型选择组合式函数(批3 改造):数据源=内置出厂清单(AI_MODEL_LIST,走 bff env 默认=试用层)+启用中的访客供应商模型(走 bff 透传)。
// 溯源:任务 02(注释体系存量收敛一期,补头注);批3「AI 接入可配」MVP(2026-11-18)数据源切 ProviderConfig、切换逻辑保留。
// 约束:访客模型 key 用 custom:<providerId>:<modelId> 复合键,与内置 key 命名空间隔离(防与出厂 key 撞名导致路由误判);
// 会话 modelKey 持久化的就是该复合键,resolveModelRouting 负责还原透传三元组。

import { AI_MODEL_LIST, type AiModelItem } from '@/types/chat/aiModel'
import type { ProviderConfig } from '@/types/chat/aiProvider'
import { useProviderStore } from '@/store/provider'

/** 访客模型的复合 key 前缀(内置模型无前缀) */
export const CUSTOM_MODEL_PREFIX = 'custom:'

/** bff 透传三元组(经请求头发给 bff,钥匙只在访客浏览器与本次请求内存中) */
export interface AiPassthrough {
  baseURL: string
  apiKey: string
  model: string
}

/** 复合 key 解析结果:modelKey=回填 body.model 的值(访客模型为真实模型 id,内置为原 key) */
export interface ModelRouting {
  modelKey: string
  passthrough: AiPassthrough | null
}

export const buildCustomModelKey = (providerId: string, modelId: string) =>
  `${CUSTOM_MODEL_PREFIX}${providerId}:${modelId}`

/**
 * 按 modelKey 解析路由:访客复合键→其启用供应商的透传三元组;
 * 供应商已删/已停用/找不到时回落内置默认路径(passthrough=null,modelKey 原样传给 bff,由其 400 兜底)。
 */
export const resolveModelRouting = (
  modelKey: string,
  providers: ProviderConfig[]
): ModelRouting => {
  if (!modelKey.startsWith(CUSTOM_MODEL_PREFIX)) return { modelKey, passthrough: null }

  const [, providerId, modelId] = modelKey.split(':')
  const provider = providers.find(
    item => item.id === providerId && item.enabled && item.models.some(m => m.id === modelId)
  )
  // modelId 缺段(畸形复合键)与供应商不可用同判:回落内置默认路径
  if (!provider || !modelId) return { modelKey, passthrough: null }

  return {
    modelKey: modelId,
    passthrough: { baseURL: provider.baseURL, apiKey: provider.apiKey, model: modelId },
  }
}

export function useAiModel(modelKey?: string) {
  const providerStore = useProviderStore()
  // 当前选中模型key，默认qwen3.8-flash(内置出厂,零回归)
  const currentModelKey = ref<string>(modelKey || 'qwen3.8-flash')

  // 合并清单:内置出厂在前(试用层),启用中的访客供应商模型追加在后;访客模型不带 greeting/desc 细节
  const modelList = computed<AiModelItem[]>(() => [
    ...AI_MODEL_LIST,
    ...providerStore.enabledProviders.flatMap(provider =>
      provider.models.map(m => ({
        modelKey: buildCustomModelKey(provider.id, m.id),
        label: `${provider.name}｜${m.label}`,
        desc: '访客自配供应商',
        provider: provider.id,
      }))
    ),
  ])

  // 自动获取当前完整模型对象
  const currentModel = computed<AiModelItem | undefined>(() => {
    return modelList.value.find(item => item.modelKey === currentModelKey.value)
  })

  // 切换模型方法
  const switchAiModel = (key: string) => {
    const exists = modelList.value.some(item => item.modelKey === key)
    if (exists) currentModelKey.value = key
  }

  return {
    modelList,
    currentModelKey,
    currentModel,
    switchAiModel,
  }
}
