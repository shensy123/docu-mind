<template>
  <div class="document-page">
    <!-- 文档上传区域 -->
    <el-card class="upload-area">
      <div
        class="upload-card"
        @drop.prevent="handleDrop"
        @dragover.prevent
        @click="triggerFileInput"
        :class="{ hover: isUploadHover }"
      >
        <input
          ref="fileInputRef"
          type="file"
          multiple
          accept=".pdf,.docx,.txt"
          class="file-input"
          @change="handleFileSelect"
        />

        <div class="upload-icon">📄</div>
        <div class="upload-text">上传文档</div>
        <div class="upload-tip">拖拽或点击上传 PDF/Word/TXT 文件</div>
      </div>
    </el-card>

    <!-- 文档列表（卡片式） -->
    <div class="doc-list">
      <div class="doc-list-title">文档卡片流式</div>
      <div class="doc-cards">
        <!-- 过滤后的文档列表 -->
        <div
          v-for="doc in filteredDocs"
          :key="doc.id"
          class="doc-card"
          @mouseenter="hoveredDocId = doc.id"
          @mouseleave="hoveredDocId = ''"
        >
          <!-- 文档卡片主体 -->
          <div class="doc-card-body">
            <div class="doc-icon">
              <span v-if="doc.type === 'pdf'">📄</span>
              <span v-else-if="doc.type === 'docx'">📝</span>
              <span v-else>📜</span>
            </div>
            <div class="doc-info">
              <div class="doc-name">{{ doc.name }}</div>
              <div class="doc-size">{{ formatFileSize(doc.size) }}</div>
              <div v-if="doc.uploadTime" class="doc-time">{{ doc.uploadTime }}</div>
            </div>
            <!-- 上传进度条 -->
            <div v-if="doc.status === 'uploading'" class="progress-bar">
              <div class="progress-fill" :style="{ width: `${doc.progress}%` }"></div>
            </div>
            <!-- 状态提示 -->
            <div v-if="doc.status === 'failed'" class="error-msg">{{ doc.errorMsg }}</div>
          </div>

          <!-- 鼠标悬浮操作栏（右侧展开） -->
          <div v-if="hoveredDocId === doc.id" class="doc-card-actions">
            <button class="action-btn" @click="deleteDocument(doc.id)">删除</button>
            <button class="action-btn" @click="retryUpload(doc.id)">重试</button>
            <div class="doc-card-tip">上传状态/操作按钮卡片</div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
defineOptions({ name: 'DocumentIndex' })
import { ref, computed } from 'vue'
// import DocuLayout from '@/layouts/DocuLayout.vue'
import { useDocumentStore } from '@/store/document.ts'
import type { DocumentItem } from '@/types/document.ts'

// 状态管理实例
const documentStore = useDocumentStore()

// 上传相关 Ref
const fileInputRef = ref<HTMLInputElement | null>(null)
const isUploadHover = ref(false)
const hoveredDocId = ref('')
const searchKeyword = ref('')

// 过滤后的文档列表（搜索）
const filteredDocs = computed(() => {
  return documentStore.searchDocuments(searchKeyword.value)
})

// 触发文件选择框
const triggerFileInput = () => {
  fileInputRef.value?.click()
}

// 处理文件选择
const handleFileSelect = (e: Event) => {
  const target = e.target as HTMLInputElement
  const files = target.files
  if (!files || files.length === 0) return
  Array.from(files).forEach(file => {
    handleFileUpload(file)
  })
  // 清空选择框（允许重复选择同一文件）
  target.value = ''
}

// 处理拖拽上传
const handleDrop = (e: DragEvent) => {
  isUploadHover.value = false
  const files = e.dataTransfer?.files
  if (!files || files.length === 0) return
  Array.from(files).forEach(file => {
    // 校验文件类型
    const validTypes = [
      'application/pdf',
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
      'text/plain',
    ]
    const fileExt = file.name.split('.').pop()?.toLowerCase()
    if (!validTypes.includes(file.type) && !['pdf', 'docx', 'txt'].includes(fileExt || '')) {
      alert(`文件 ${file.name} 类型不支持，仅支持 PDF/Word/TXT`)
      return
    }
    handleFileUpload(file)
  })
}

// 分片上传核心逻辑
const handleFileUpload = async (file: File) => {
  // 1. 添加文档到状态管理
  const docId = documentStore.addDocument(file)

  // 2. 分片配置（1MB/片）
  const chunkSize = 1024 * 1024 // 1MB
  const totalChunks = Math.ceil(file.size / chunkSize)

  try {
    // 3. 分片上传
    for (let i = 0; i < totalChunks; i++) {
      // 切割文件
      const start = i * chunkSize
      const end = Math.min(start + chunkSize, file.size)
      const chunk = file.slice(start, end)

      // 模拟上传（实际项目替换为真实接口请求）
      await simulateUpload(chunk, docId, i, totalChunks)

      // 更新进度
      const progress = Math.ceil(((i + 1) / totalChunks) * 100)
      documentStore.updateProgress(docId, progress)
    }
  } catch (error) {
    documentStore.markFailed(docId, (error as Error).message || '上传失败')
  }
}

// 模拟上传（替换为真实接口）
const simulateUpload = (
  _chunk: Blob,
  _docId: string,
  _chunkIndex: number,
  _totalChunks: number
) => {
  return new Promise<void>((resolve, reject) => {
    // 模拟网络延迟
    setTimeout(() => {
      // 随机模拟失败（测试用）
      if (Math.random() < 0.1) {
        reject(new Error('分片上传失败'))
      } else {
        resolve()
      }
    }, 300)
  })
}

// 格式化文件大小
const formatFileSize = (bytes: number): string => {
  if (bytes < 1024) return `${bytes} B`
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`
}

// 删除文档
const deleteDocument = (docId: string) => {
  if (confirm('确定删除该文档吗？')) {
    documentStore.deleteDocument(docId)
  }
}

// 重试上传
const retryUpload = (docId: string) => {
  const doc = documentStore.documentList.find((item: DocumentItem) => item.id === docId)
  if (!doc) return

  // 重置状态
  documentStore.updateProgress(docId, 0)

  // 重新选择文件（简化：实际项目可缓存文件或重新读取）
  alert('请重新选择文件重试上传')
  triggerFileInput()
}
</script>

<style scoped>
/* 上传区域 */
.upload-area {
  margin-bottom: 32px;
}

.upload-card {
  width: 200px;
  height: 220px;
  background: #fff;
  border-radius: 8px;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  transition: all 0.2s;
  border: 2px dashed #e5e7eb;
}

.upload-card.hover {
  border-color: #165dff;
  background: #f0f7ff;
}

.file-input {
  display: none;
}

.upload-icon {
  font-size: 48px;
  margin-bottom: 16px;
  color: #165dff;
}

.upload-text {
  font-size: 18px;
  font-weight: 500;
  margin-bottom: 8px;
}

.upload-tip {
  font-size: 12px;
  color: #9ca3af;
}

/* 文档列表 */
.doc-list {
  margin-top: 24px;
}

.doc-list-title {
  font-size: 18px;
  font-weight: 500;
  margin-bottom: 16px;
}

.doc-cards {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(200px, 1fr));
  gap: 16px;
}

.doc-card {
  background: #fff;
  border-radius: 8px;
  padding: 16px;
  box-shadow: 0 1px 2px rgb(0 0 0 / 5%);
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  transition: box-shadow 0.2s;
}

.doc-card:hover {
  box-shadow: 0 4px 8px rgb(0 0 0 / 10%);
}

.doc-card-body {
  display: flex;
  flex-direction: column;
  gap: 8px;
  flex: 1;
}

.doc-icon {
  font-size: 24px;
  margin-bottom: 8px;
}

.doc-name {
  font-weight: 500;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  max-width: 150px;
}

.doc-size,
.doc-time {
  font-size: 12px;
  color: #9ca3af;
}

.progress-bar {
  height: 4px;
  width: 100%;
  background: #f5f7fa;
  border-radius: 2px;
  overflow: hidden;
  margin-top: 8px;
}

.progress-fill {
  height: 100%;
  background: #165dff;
  transition: width 0.2s;
}

.error-msg {
  font-size: 12px;
  color: #ff4d4f;
  margin-top: 8px;
}

/* 悬浮操作栏 */
.doc-card-actions {
  display: flex;
  flex-direction: column;
  gap: 8px;
  margin-left: 16px;
  padding-left: 16px;
  border-left: 1px solid #e5e7eb;
}

.action-btn {
  background: #fff;
  border: 1px solid #e5e7eb;
  border-radius: 4px;
  padding: 4px 8px;
  cursor: pointer;
  font-size: 12px;
  transition: background 0.2s;
}

.action-btn:hover {
  background: #f5f7fa;
}

.doc-card-tip {
  font-size: 10px;
  color: #9ca3af;
  margin-top: 8px;
}
</style>
