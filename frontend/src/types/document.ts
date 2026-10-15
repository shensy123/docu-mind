// 文档状态枚举
export enum DocumentUploadStatus {
  PENDING = 'pending', // 待上传
  UPLOADING = 'uploading', // 上传中
  SUCCESS = 'success', // 上传成功
  FAILED = 'failed', // 上传失败
}

// 文档信息类型
export interface DocumentItem {
  id: string // 唯一ID
  name: string // 文件名
  size: number // 文件大小（字节）
  type: string // 文件类型（pdf/word/txt）
  uploadTime?: string // 上传时间
  progress: number // 上传进度（0-100）
  status: DocumentUploadStatus // 上传状态
  errorMsg?: string // 错误信息
}

// 分片上传参数类型
export interface ChunkUploadParams {
  file: File
  chunkIndex: number
  chunkSize: number
  totalChunks: number
  fileHash: string
}

// 文档列表记录（管理页展示用；与上传项 DocumentItem 字段体系不同，改名消除同名异型）
export interface DocumentRecord {
  id: number
  name: string
  size: string // 展示用格式化大小（如 "2.3 MB"）
  updateTime: string
  author: string
  status: number | string // 状态码或空串（全部）
}

// 搜索表单
export interface SearchForm {
  keyword: string
  status: string | number
  dateRange: []
}
export interface SearchOption {
  value: string | number
  label: string
}
