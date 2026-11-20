// 访客自配 AI 供应商状态(批3 MVP):增删改/启用开关,localStorage 手动持久化(同 auth store 模式)。
// 溯源:批3「AI 接入可配」MVP(任务书 2026-11-18);类型与预置模板见 types/chat/aiProvider.ts。
// 约束:localStorage key=ai_provider_list;钥匙仅存访客浏览器、bff 不落盘(131 点 5 口径)。
import type { ProviderConfig } from '@/types/chat/aiProvider'

const PROVIDER_LIST_KEY = 'ai_provider_list'

// 读取失败(脏数据/无记录)一律回落空列表,不阻塞聊天主链路
const loadProviders = (): ProviderConfig[] => {
  try {
    const data = localStorage.getItem(PROVIDER_LIST_KEY)
    const parsed = data ? JSON.parse(data) : []
    return Array.isArray(parsed) ? (parsed as ProviderConfig[]) : []
  } catch {
    return []
  }
}

export const useProviderStore = defineStore('provider', () => {
  const providers = ref<ProviderConfig[]>(loadProviders())

  const persist = () => {
    localStorage.setItem(PROVIDER_LIST_KEY, JSON.stringify(providers.value))
  }

  // 启用中的供应商(其模型才进聊天下拉/参与透传)
  const enabledProviders = computed(() => providers.value.filter(item => item.enabled))

  // 新增或整体替换(编辑保存),按 id 匹配
  const upsertProvider = (provider: ProviderConfig) => {
    const idx = providers.value.findIndex(item => item.id === provider.id)
    if (idx >= 0) {
      providers.value.splice(idx, 1, provider)
    } else {
      providers.value.push(provider)
    }
    persist()
  }

  const removeProvider = (id: string) => {
    providers.value = providers.value.filter(item => item.id !== id)
    persist()
  }

  const toggleProvider = (id: string, enabled: boolean) => {
    const target = providers.value.find(item => item.id === id)
    if (!target) return
    target.enabled = enabled
    persist()
  }

  const generateProviderId = () => Math.random().toString(36).slice(2, 9)

  return {
    providers,
    enabledProviders,
    upsertProvider,
    removeProvider,
    toggleProvider,
    generateProviderId,
  }
})
