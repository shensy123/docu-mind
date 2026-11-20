<!-- 输入工具条:＋(前)/语音(后)扩展位 + 输入 + 模型选择(二级分组) + 发送/停止。扩展位挂预留空组件(v-show) -->
<script setup lang="ts">
import { Plus, Microphone } from '@element-plus/icons-vue'
import type { AiModelItem } from '@/types/chat/aiModel'
import { CUSTOM_MODEL_PREFIX } from '@/composables/useAiModel'
import CvUploadEntry from './CvUploadEntry.vue'
import CvVoiceRecorder from './CvVoiceRecorder.vue'

interface Props {
  isStreaming?: boolean
  modelList?: AiModelItem[]
}
const props = withDefaults(defineProps<Props>(), {
  isStreaming: false,
  modelList: () => [],
})

const emit = defineEmits<{ send: []; 'stop-streaming': [] }>()

const inputText = defineModel<string>('inputText', { default: '' })
const modelKey = defineModel<string>('modelKey', { default: '' })

// U3(批3.5):二级分组——内置出厂模型归「内置(试用)」组,访客自配模型按供应商分组(组名取 label 的供应商名前缀)
interface ModelGroup {
  label: string
  options: AiModelItem[]
}

const modelGroups = computed<ModelGroup[]>(() => {
  const builtin: ModelGroup = { label: '内置（试用）', options: [] }
  const custom = new Map<string, ModelGroup>()
  for (const item of props.modelList) {
    if (item.modelKey.startsWith(CUSTOM_MODEL_PREFIX)) {
      let group = custom.get(item.provider)
      if (!group) {
        group = { label: item.label.split('｜')[0] || item.label, options: [] }
        custom.set(item.provider, group)
      }
      group.options.push(item)
    } else {
      builtin.options.push(item)
    }
  }
  return builtin.options.length ? [builtin, ...custom.values()] : [...custom.values()]
})

// 组内短名:访客模型 label 带「供应商名｜」前缀,组头已示供应商名,去前缀防重复;内置模型无前缀原样展示
const optionLabel = (item: AiModelItem) =>
  item.modelKey.startsWith(CUSTOM_MODEL_PREFIX)
    ? item.label.split('｜').slice(1).join('｜') || item.label
    : item.label

// 扩展预留:＋/语音暂未实现,点击 toast 提示"待开发"避免无反馈;
// 入口组件与 v-show 结构保留(uploadOpen/recording 恒 false),后续步骤接入真实交互时替换 onUpload/onVoice
const uploadOpen = ref(false)
const recording = ref(false)

const onUpload = () => ElMessage.info('上传功能待开发')
const onVoice = () => ElMessage.info('语音功能待开发')
</script>

<template>
  <footer class="cv-input-tools">
    <cv-upload-entry v-show="uploadOpen" class="cv-input-tools__extend" />
    <cv-voice-recorder v-show="recording" class="cv-input-tools__extend" />
    <div class="cv-input-tools__row">
      <el-icon class="cv-input-tools__tool" @click="onUpload"><Plus /></el-icon>
      <el-icon class="cv-input-tools__tool" @click="onVoice"><Microphone /></el-icon>
      <el-input
        v-model="inputText"
        type="text"
        spellcheck="false"
        autocomplete="off"
        placeholder="输入消息，按 Enter 发送..."
        :disabled="isStreaming"
        @keyup.enter="emit('send')"
      />
      <el-select
        v-model="modelKey"
        class="cv-input-tools__model"
        placeholder="选择AI模型"
        filterable
      >
        <el-option-group v-for="group in modelGroups" :key="group.label" :label="group.label">
          <el-option
            v-for="item in group.options"
            :key="item.modelKey"
            :label="item.label"
            :value="item.modelKey"
          >
            <span>{{ optionLabel(item) }}</span>
            <span class="cv-input-tools__model-desc">{{ item.desc }}</span>
          </el-option>
        </el-option-group>
      </el-select>
      <el-button v-show="!isStreaming" type="primary" @click="emit('send')">发送</el-button>
      <el-button v-show="isStreaming" type="danger" plain @click="emit('stop-streaming')">
        停止
      </el-button>
    </div>
  </footer>
</template>

<style scoped lang="scss">
.cv-input-tools {
  padding: 12px 16px;
  border-top: 1px solid var(--el-border-color-lighter);

  &__extend {
    margin-bottom: 12px;
  }

  &__row {
    display: flex;
    align-items: center;
    gap: 8px;

    .el-input {
      flex: 1;
    }
  }

  &__tool {
    flex-shrink: 0;
    font-size: 18px;
    color: var(--el-text-color-regular);
    cursor: pointer;

    &:hover {
      color: var(--el-color-primary);
    }
  }

  &__model {
    width: 160px;
  }

  &__model-desc {
    margin-left: 8px;
    font-size: 12px;
    color: var(--el-text-color-secondary);
  }
}
</style>
