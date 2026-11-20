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

/** 全部可选AI模型列表（2026-11-05 模型轮换：百炼系 10 模型，各 100 万 Token 限免 90 天；
 *  旧代 qwen-turbo/qwen-max 及独立渠道 deepseek-chat/doubao 退出下拉，后端保留兼容条目） */
export const AI_MODEL_LIST: AiModelItem[] = [
  {
    modelKey: 'qwen3.8-flash',
    label: '通义千问 3.8-Flash',
    desc: '千问新一代性价比之王，多模态+百万上下文，日常首选',
    provider: 'aliyun',
    icon: 'icon-qwen',
    greeting:
      '我是通义千问 3.8-Flash，兼顾效果与响应速度，擅长日常问答、代码与长文档处理。你可以问我任何问题。',
  },
  {
    modelKey: 'qwen3.8-max',
    label: '通义千问 3.8-Max',
    desc: '千问旗舰（2.4 万亿参数 MoE），编程与综合能力最强',
    provider: 'aliyun',
    icon: 'icon-qwen',
    greeting:
      '我是通义千问 3.8-Max，千问系列旗舰模型，擅长复杂推理、编程与办公任务。你可以问我任何问题。',
  },
  {
    modelKey: 'qwen3.7-plus',
    label: '通义千问 3.7-Plus',
    desc: '千问均衡档，质量与成本平衡的长上下文模型',
    provider: 'aliyun',
    icon: 'icon-qwen',
    greeting: '我是通义千问 3.7-Plus，均衡型模型，适合多轮对话与长文本任务。你可以问我任何问题。',
  },
  {
    modelKey: 'qwen3.7-flash',
    label: '通义千问 3.7-Flash',
    desc: '千问最低价档，高速响应的轻量场景之选',
    provider: 'aliyun',
    icon: 'icon-qwen',
    greeting: '我是通义千问 3.7-Flash，轻量高速，适合快速问答。你可以问我任何问题。',
  },
  {
    modelKey: 'deepseek-v4-pro',
    label: 'DeepSeek V4-Pro',
    desc: '深度求索旗舰，代码与数学推理能力突出',
    provider: 'deepseek',
    icon: 'icon-deepseek',
    greeting: '我是 DeepSeek V4-Pro，擅长代码与数学推理等任务。你可以问我任何问题。',
  },
  {
    modelKey: 'deepseek-v4.1-flash',
    label: 'DeepSeek V4.1-Flash',
    desc: '深度求索轻量档，峰谷计价、闲时半价',
    provider: 'deepseek',
    icon: 'icon-deepseek',
    greeting: '我是 DeepSeek V4.1-Flash，轻量快速，擅长日常开发问答。你可以问我任何问题。',
  },
  {
    modelKey: 'kimi-k3',
    label: 'Kimi K3',
    desc: '月之暗面旗舰，长上下文与深度推理',
    provider: 'moonshot',
    icon: 'icon-kimi',
    greeting: '我是 Kimi，由月之暗面打造的 AI 助手，擅长长上下文与深度推理。你可以问我任何问题。',
  },
  {
    modelKey: 'kimi-k2.7-code',
    label: 'Kimi K2.7-Code',
    desc: '月之暗面代码特化模型，编程场景优化',
    provider: 'moonshot',
    icon: 'icon-kimi',
    greeting: '我是 Kimi K2.7-Code，代码特化模型，擅长编程任务。你可以问我任何问题。',
  },
  {
    modelKey: 'glm-5.3',
    label: 'GLM-5.3',
    desc: '智谱旗舰，通用对话与智能体能力',
    provider: 'zhipu',
    icon: 'icon-glm',
    greeting: '我是 GLM-5.3，由智谱打造的 AI 助手，擅长通用对话与智能体任务。你可以问我任何问题。',
  },
  {
    modelKey: 'MiniMax-M2.5',
    label: 'MiniMax M2.5',
    desc: 'MiniMax 均衡旗舰，多模态与长文本',
    provider: 'minimax',
    icon: 'icon-minimax',
    greeting: '我是 MiniMax M2.5，擅长多模态与长文本任务。你可以问我任何问题。',
  },
]
