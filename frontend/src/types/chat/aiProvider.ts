// 访客自配 AI 供应商数据模型(批3「AI 接入可配」MVP,任务书 2026-11-18)。
// 溯源:调研件 ai-workflow/outputs/2026-10-14-AI接入可配市场调研.md §五落地草案 + 设计方案 2026-11-18(透传模式)。
// 约束:钥匙只存访客浏览器 localStorage(store/provider.ts),bff 仅随请求透传、不落盘(131 点 5 口径)。

/** 供应商下的单个模型(id 透传给供应商,label 仅下拉展示) */
export interface ProviderModelItem {
  id: string
  label: string
}

/** 访客自配供应商(「我的供应商」条目,可增删改) */
export interface ProviderConfig {
  id: string
  name: string
  baseURL: string
  apiKey: string
  models: ProviderModelItem[]
  enabled: boolean
}

/** 预置供应商模板(出厂只读,「使用模板」= 以模板为底本新建用户供应商,模板本身不可改删) */
export interface PresetProviderTemplate {
  id: string
  name: string
  baseURL: string
  note: string
  /** 官方 API Key 获取页(表单内渲染「去获取 API Key ↗」外链);本地无 Key 服务(如 Ollama)留空 */
  keyUrl: string
}

// 预置九家 OpenAI 兼容端点(调研件 §三表,2026-10 核实;额度政策变动频繁,实施前按各供应商 rate-limit 页复核)
// keyUrl=各家官方 Key 管理页(2026-11-20 批3.5 U4 逐家核实:智谱为新域名 bigmodel.cn、方舟/硅基为控制台密钥页)
export const PRESET_PROVIDERS: PresetProviderTemplate[] = [
  {
    id: 'dashscope',
    name: '阿里百炼 DashScope',
    baseURL: 'https://dashscope.aliyuncs.com/compatible-mode/v1',
    note: '本站默认试用渠道;新用户有赠额',
    keyUrl: 'https://bailian.console.aliyun.com/?apiKey=1#/api-key',
  },
  {
    id: 'deepseek',
    name: 'DeepSeek',
    baseURL: 'https://api.deepseek.com/v1',
    note: '便宜按量,无真免费档',
    keyUrl: 'https://platform.deepseek.com/api_keys',
  },
  {
    id: 'moonshot',
    name: 'Moonshot Kimi',
    baseURL: 'https://api.moonshot.cn/v1',
    note: 'OpenAI 兼容',
    keyUrl: 'https://platform.moonshot.cn/console/api-keys',
  },
  {
    id: 'zhipu',
    name: '智谱 GLM',
    baseURL: 'https://open.bigmodel.cn/api/paas/v4',
    note: '历史上有免费入门档',
    keyUrl: 'https://bigmodel.cn/usercenter/proj-mgmt/apikeys',
  },
  {
    id: 'volcark',
    name: '豆包（火山方舟）',
    baseURL: 'https://ark.cn-beijing.volces.com/api/v3',
    note: 'OpenAI 兼容',
    keyUrl: 'https://console.volcengine.com/ark/apiKey',
  },
  {
    id: 'openrouter',
    name: 'OpenRouter',
    baseURL: 'https://openrouter.ai/api/v1',
    note: '聚合 300+ 模型,:free 档约 20 RPM',
    keyUrl: 'https://openrouter.ai/settings/keys',
  },
  {
    id: 'siliconflow',
    name: 'SiliconFlow 硅基流动',
    baseURL: 'https://api.siliconflow.cn/v1',
    note: '国产开源模型聚合,有免费模型',
    keyUrl: 'https://cloud.siliconflow.cn/account/ak',
  },
  {
    id: 'groq',
    name: 'Groq',
    baseURL: 'https://api.groq.com/openai/v1',
    note: '免费档速率公开、推理最快',
    keyUrl: 'https://console.groq.com/keys',
  },
  {
    id: 'ollama',
    name: 'Ollama（本地）',
    baseURL: 'http://localhost:11434/v1',
    note: '本地免费,需本机已装 Ollama',
    keyUrl: '',
  },
]
