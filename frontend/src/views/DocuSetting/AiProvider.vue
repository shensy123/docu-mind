<!-- AI 供应商设置页(批3 MVP):预置模板只读 + 我的供应商增删改/启用 + 表单(获取模型列表/测试连接)。 -->
<!-- 溯源:批3「AI 接入可配」MVP(任务书 2026-11-18);钥匙仅存访客浏览器 localStorage,bff 只随请求透传不落盘。 -->
<!-- 约束:顶层路由 /ai-provider(CvSetting 设置按钮入口);MVP 不做供应商 logo/多供应商切换 UI 精细化。 -->
<script setup lang="ts">
import { Back, Plus, Delete, Refresh, Connection } from '@element-plus/icons-vue'
import { ElMessageBox } from 'element-plus' // ElMessageBox 不在 auto-import 生效集(同 CvSetting 显式引入)
import 'element-plus/es/components/message-box/style/css'
import {
  PRESET_PROVIDERS,
  type ProviderConfig,
  type ProviderModelItem,
} from '@/types/chat/aiProvider'
import { useProviderStore } from '@/store/provider'
import { fetchProviderModels } from '@/api/provider'

const router = useRouter()
const providerStore = useProviderStore()

// ---------- 表单态 ----------
const formVisible = ref(false)
const editingId = ref<string | null>(null) // null=新增;有值=编辑既有供应商
const form = reactive({
  name: '',
  baseURL: '',
  apiKey: '',
  models: [] as ProviderModelItem[],
})
const probing = ref(false) // 获取模型列表/测试连接共用一个在途标记(同一探测端点)

const openCreate = (preset?: (typeof PRESET_PROVIDERS)[number]) => {
  editingId.value = null
  form.name = preset?.name || ''
  form.baseURL = preset?.baseURL || ''
  form.apiKey = ''
  form.models = []
  formVisible.value = true
}

const openEdit = (provider: ProviderConfig) => {
  editingId.value = provider.id
  form.name = provider.name
  form.baseURL = provider.baseURL
  form.apiKey = provider.apiKey
  form.models = provider.models.map(m => ({ ...m }))
  formVisible.value = true
}

const addModelRow = () => form.models.push({ id: '', label: '' })
const removeModelRow = (idx: number) => form.models.splice(idx, 1)

const validateForm = (): string | null => {
  if (!form.name.trim()) return '名称不能为空'
  if (!form.baseURL.trim()) return 'API 地址不能为空'
  if (!form.apiKey.trim()) return 'API Key 不能为空'
  if (!form.models.length || form.models.some(m => !m.id.trim()))
    return '至少填写一个模型,且模型 ID 不能为空'
  return null
}

const saveProvider = () => {
  const invalid = validateForm()
  if (invalid) {
    ElMessage.warning(invalid)
    return
  }
  providerStore.upsertProvider({
    id: editingId.value || providerStore.generateProviderId(),
    name: form.name.trim(),
    baseURL: form.baseURL.trim(),
    apiKey: form.apiKey.trim(),
    models: form.models.map(m => ({ id: m.id.trim(), label: m.label.trim() || m.id.trim() })),
    enabled: true,
  })
  formVisible.value = false
  ElMessage.success(editingId.value ? '供应商已更新' : '供应商已添加')
}

const removeProvider = (provider: ProviderConfig) => {
  ElMessageBox.confirm(`确定删除供应商「${provider.name}」吗?`, '删除供应商', { type: 'warning' })
    .then(() => {
      providerStore.removeProvider(provider.id)
      ElMessage.success('删除成功')
    })
    .catch(() => {})
}

// ---------- 探测(获取模型列表/测试连接共用 /chat/models 中转) ----------
const probeModels = async (fillList: boolean) => {
  if (!form.baseURL.trim() || !form.apiKey.trim()) {
    ElMessage.warning('请先填写 API 地址与 API Key')
    return
  }
  probing.value = true
  try {
    const models = await fetchProviderModels(form.baseURL.trim(), form.apiKey.trim())
    if (fillList) {
      if (!models.length) {
        ElMessage.warning('连接成功,但供应商未返回任何模型')
      } else {
        // 保留用户已填 label 的行,其余以返回 id 重填(label 默认=id)
        const kept = new Map(
          form.models.filter(m => m.id && m.label && m.id !== m.label).map(m => [m.id, m.label])
        )
        form.models = models.map(id => ({ id, label: kept.get(id) || id }))
        ElMessage.success(`已获取 ${models.length} 个模型`)
      }
    } else {
      ElMessage.success(`连接成功,该供应商返回 ${models.length} 个模型`)
    }
  } catch (error) {
    ElMessage.error(`连接失败:${error instanceof Error ? error.message : '未知错误'}`)
  } finally {
    probing.value = false
  }
}
</script>

<template>
  <div class="ai-provider">
    <header class="ai-provider__header">
      <el-button :icon="Back" text @click="router.push('/conversation')">返回对话</el-button>
      <h1 class="ai-provider__title">AI 供应商设置</h1>
      <span class="ai-provider__spacer" />
    </header>

    <el-alert
      class="ai-provider__tip"
      type="info"
      :closable="false"
      title="钥匙只保存在你的浏览器(localStorage),服务器不存储;启用后聊天请求将按你的配置直连所选供应商。"
    />

    <section class="ai-provider__section">
      <div class="ai-provider__section-head">
        <h2 class="ai-provider__section-title">我的供应商</h2>
        <el-button type="primary" :icon="Plus" @click="openCreate()">自定义供应商</el-button>
      </div>
      <p v-if="!providerStore.providers.length" class="ai-provider__empty">
        还没有自配供应商——可从下方预置模板一键创建,或点右上角「自定义供应商」手填。
      </p>
      <div v-for="provider in providerStore.providers" :key="provider.id" class="ai-provider__item">
        <div class="ai-provider__item-main">
          <span class="ai-provider__item-name">{{ provider.name }}</span>
          <span class="ai-provider__item-url">{{ provider.baseURL }}</span>
          <span class="ai-provider__item-models">{{ provider.models.length }} 个模型</span>
        </div>
        <div class="ai-provider__item-actions">
          <el-switch
            :model-value="provider.enabled"
            aria-label="启用开关"
            @change="
              (val: string | number | boolean) =>
                providerStore.toggleProvider(provider.id, Boolean(val))
            "
          />
          <el-button text @click="openEdit(provider)">编辑</el-button>
          <el-button text type="danger" :icon="Delete" @click="removeProvider(provider)"
            >删除</el-button
          >
        </div>
      </div>
    </section>

    <section class="ai-provider__section">
      <div class="ai-provider__section-head">
        <h2 class="ai-provider__section-title">预置模板(只读)</h2>
      </div>
      <p class="ai-provider__preset-note">选模板后只需补 API Key 与模型,模板本身不可修改。</p>
      <div v-for="preset in PRESET_PROVIDERS" :key="preset.id" class="ai-provider__item">
        <div class="ai-provider__item-main">
          <span class="ai-provider__item-name">{{ preset.name }}</span>
          <span class="ai-provider__item-url">{{ preset.baseURL }}</span>
          <span class="ai-provider__item-note">{{ preset.note }}</span>
        </div>
        <el-button text type="primary" @click="openCreate(preset)">使用模板</el-button>
      </div>
    </section>

    <el-dialog
      v-model="formVisible"
      :title="editingId ? '编辑供应商' : '添加供应商'"
      width="560px"
      destroy-on-close
    >
      <el-form label-width="90px">
        <el-form-item label="名称" required>
          <el-input v-model="form.name" placeholder="如:我的 DeepSeek" />
        </el-form-item>
        <el-form-item label="API 地址" required>
          <el-input
            v-model="form.baseURL"
            placeholder="OpenAI 兼容 baseURL,如 https://api.deepseek.com/v1"
          />
        </el-form-item>
        <el-form-item label="API Key" required>
          <el-input
            v-model="form.apiKey"
            type="password"
            show-password
            placeholder="仅存本浏览器,不上服务器"
          />
        </el-form-item>
        <el-form-item label="模型列表" required>
          <div class="ai-provider__models">
            <div v-for="(m, idx) in form.models" :key="idx" class="ai-provider__model-row">
              <el-input v-model="m.id" placeholder="模型 ID(透传给供应商)" />
              <el-input v-model="m.label" placeholder="展示名(留空同 ID)" />
              <el-button text type="danger" :icon="Delete" @click="removeModelRow(idx)" />
            </div>
            <el-button text type="primary" :icon="Plus" @click="addModelRow">添加模型</el-button>
          </div>
        </el-form-item>
        <el-form-item label-width="0">
          <div class="ai-provider__probe">
            <el-button :icon="Refresh" :loading="probing" @click="probeModels(true)"
              >获取模型列表</el-button
            >
            <el-button :icon="Connection" :loading="probing" @click="probeModels(false)"
              >测试连接</el-button
            >
          </div>
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="formVisible = false">取消</el-button>
        <el-button type="primary" @click="saveProvider">保存</el-button>
      </template>
    </el-dialog>
  </div>
</template>

<style scoped lang="scss">
.ai-provider {
  max-width: 860px;
  height: 100vh;
  padding: 16px 24px;
  overflow-y: auto;
  background: var(--el-bg-color);

  &__header {
    display: flex;
    align-items: center;
    gap: 12px;
    padding-bottom: 8px;
  }

  &__title {
    margin: 0;
    font-size: 20px;
    color: var(--el-text-color-primary);
  }

  &__spacer {
    flex: 1;
  }

  &__tip {
    margin-bottom: 16px;
  }

  &__section {
    margin-bottom: 24px;
  }

  &__section-head {
    display: flex;
    align-items: center;
    justify-content: space-between;
  }

  &__section-title {
    margin: 0 0 8px;
    font-size: 16px;
    color: var(--el-text-color-primary);
  }

  &__preset-note,
  &__empty {
    margin: 0 0 8px;
    font-size: 13px;
    color: var(--el-text-color-secondary);
  }

  &__item {
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 12px;
    padding: 10px 12px;
    border: 1px solid var(--el-border-color-lighter);
    border-radius: 6px;

    & + & {
      margin-top: 8px;
    }
  }

  &__item-main {
    display: flex;
    flex-wrap: wrap;
    align-items: baseline;
    gap: 8px;
    min-width: 0;
  }

  &__item-name {
    font-weight: 600;
    color: var(--el-text-color-primary);
  }

  &__item-url {
    font-size: 12px;
    word-break: break-all;
    color: var(--el-text-color-secondary);
  }

  &__item-models,
  &__item-note {
    font-size: 12px;
    color: var(--el-text-color-secondary);
  }

  &__item-actions {
    display: flex;
    flex-shrink: 0;
    align-items: center;
    gap: 4px;
  }

  &__models {
    width: 100%;
  }

  &__model-row {
    display: flex;
    gap: 8px;
    width: 100%;
    margin-bottom: 8px;
  }

  &__probe {
    display: flex;
    gap: 8px;
  }
}
</style>
