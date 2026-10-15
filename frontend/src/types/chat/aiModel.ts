/** AI模型基础类型 */
export interface AiModelItem {
  // 唯一标识（用于存储、接口传参、下拉value）
  modelKey: string
  // 展示名称（下拉框显示文本）
  label: string
  // 简短描述
  desc: string
  // 模型分类标识
  provider: string
  // 图标标识（可存图片url/图标class）
  icon?: string
  greeting?: string
}

/** 全部可选AI模型列表 */
export const AI_MODEL_LIST: AiModelItem[] = [
  {
    modelKey: 'qwen-turbo',
    label: '通义千问',
    desc: '阿里通义千问，长文本、代码、多场景问答',
    provider: 'aliyun',
    icon: 'icon-qwen',
    greeting:
      '我是通义千问，一个由阿里巴巴自研的AI助手，擅长长文本、代码、多场景问答等任务。你可以问我任何问题，我会尽力回答你。',
  },
  {
    modelKey: 'qwen-max',
    label: '通义千问',
    desc: '阿里通义千问，长文本、代码、多场景问答',
    provider: 'aliyun',
    icon: 'icon-qwen',
    greeting:
      '我是通义千问，一个由阿里巴巴自研的AI助手，擅长长文本、代码、多场景问答等任务。你可以问我任何问题，我会尽力回答你。',
  },
  {
    modelKey: 'deepseek-chat',
    label: 'DeepSeek',
    desc: '深度求索，代码与数学推理能力突出',
    provider: 'deepseek',
    icon: 'icon-deepseek',
    greeting:
      '我是DeepSeek，一个由深度求索自研的AI助手，擅长代码与数学推理等任务。你可以问我任何问题，我会尽力回答你。',
  },
  {
    modelKey: 'doubao-pro-4k',
    label: '豆包',
    desc: '字节自研大模型，通用对话、文案创作、逻辑推理',
    provider: 'bytedance',
    icon: 'icon-doubao',
    greeting:
      '我是豆包，一个由字节跳动自研的AI助手，擅长通用对话、文案创作、逻辑推理等任务。你可以问我任何问题，我会尽力回答你。',
  },
]
