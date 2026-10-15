import { defineStore } from 'pinia'
import { ref } from 'vue'
import { type DocumentItem, DocumentUploadStatus } from '@/types/document'

export const useDocumentStore = defineStore('document', () => {
  // 文档列表
  const documentList = ref<DocumentItem[]>([])

  // 添加文档到上传队列
  const addDocument = (file: File) => {
    const newDoc: DocumentItem = {
      id: crypto.randomUUID(), // 生成唯一ID
      name: file.name,
      size: file.size,
      type: file.type || file.name.split('.').pop() || '',
      progress: 0,
      status: DocumentUploadStatus.PENDING,
    }
    documentList.value.push(newDoc)
    return newDoc.id
  }

  // 更新文档上传进度
  const updateProgress = (docId: string, progress: number) => {
    const doc = documentList.value.find(item => item.id === docId)
    if (doc) {
      doc.progress = progress
      if (progress === 100) {
        doc.status = DocumentUploadStatus.SUCCESS
        doc.uploadTime = new Date().toLocaleString() // 记录上传完成时间
      } else if (progress > 0) {
        doc.status = DocumentUploadStatus.UPLOADING
      }
    }
  }

  // 标记文档上传失败
  const markFailed = (docId: string, errorMsg: string) => {
    const doc = documentList.value.find(item => item.id === docId)
    if (doc) {
      doc.status = DocumentUploadStatus.FAILED
      doc.errorMsg = errorMsg
    }
  }

  // 删除文档
  const deleteDocument = (docId: string) => {
    documentList.value = documentList.value.filter(item => item.id !== docId)
  }

  // 搜索文档（按名称）
  const searchDocuments = (keyword: string) => {
    if (!keyword) return documentList.value
    return documentList.value.filter(item =>
      item.name.toLowerCase().includes(keyword.toLowerCase())
    )
  }

  return {
    documentList,
    addDocument,
    updateProgress,
    markFailed,
    deleteDocument,
    searchDocuments,
  }
})
