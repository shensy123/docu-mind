<!-- 输入工具条:＋(前)/语音(后)扩展位 + 输入 + 模型选择 + 发送/停止。扩展位挂预留空组件(v-show) -->
<script setup lang="ts">
import { Plus, Microphone } from '@element-plus/icons-vue'
import type { AiModelItem } from '@/types/chat/aiModel'
import CvUploadEntry from './CvUploadEntry.vue'
import CvVoiceRecorder from './CvVoiceRecorder.vue'

interface Props {
  isStreaming?: boolean
  modelList?: AiModelItem[]
}
withDefaults(defineProps<Props>(), {
  isStreaming: false,
  modelList: () => [],
})

const emit = defineEmits<{ send: []; 'stop-streaming': [] }>()

const inputText = defineModel<string>('inputText', { default: '' })
const modelKey = defineModel<string>('modelKey', { default: '' })

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
        <el-option
          v-for="item in modelList"
          :key="item.modelKey"
          :label="item.label"
          :value="item.modelKey"
        >
          <span>{{ item.label }}</span>
          <span class="cv-input-tools__model-desc">{{ item.desc }}</span>
        </el-option>
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
