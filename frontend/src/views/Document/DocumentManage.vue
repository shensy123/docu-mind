<script setup lang="ts">
import type { DocumentRecord, SearchForm, SearchOption } from '@/types/document'
import type { UploadFile } from 'element-plus'
import { Upload, UploadFilled } from '@element-plus/icons-vue'

// 文档列表数据
const documentList = ref([
  {
    id: 1,
    name: '项目需求文档.docx',
    size: '2.3 MB',
    updateTime: '2023-12-15 14:30',
    author: '张三',
    status: 3,
  },
  {
    id: 2,
    name: '技术架构设计.pdf',
    size: '5.8 MB',
    updateTime: '2023-12-14 09:15',
    author: '李四',
    status: 2,
  },
  {
    id: 3,
    name: 'API接口文档.md',
    size: '1.2 MB',
    updateTime: '2023-12-13 16:45',
    author: '王五',
    status: 3,
  },
  {
    id: 4,
    name: '用户操作手册.docx',
    size: '3.5 MB',
    updateTime: '2023-12-12 11:20',
    author: '赵六',
    status: 1,
  },
  {
    id: 5,
    name: '项目进度报告.xlsx',
    size: '1.7 MB',
    updateTime: '2023-12-11 14:00',
    author: '钱七',
    status: '',
  },
])

// 搜索表单
const searchForm = reactive<SearchForm>({
  keyword: '',
  status: '',
  dateRange: [],
})

const searchOptions: SearchOption[] = [
  {
    value: '',
    label: '全部',
  },
  {
    value: 1,
    label: '待审核',
  },
  {
    value: 2,
    label: '审核中',
  },
  {
    value: 3,
    label: '已审核',
  },
]

const getStatusLabel = (value: string | number) => {
  return searchOptions.find(option => option.value === value)?.label || ''
}

// 分页
const currentPage = ref(1)
const pageSize = ref(10)
const total = ref(0)

// 对话框
const dialogVisible = ref(false)
const dialogTitle = ref('上传文档')
const uploadForm = reactive({
  name: '',
  description: '',
  file: null as UploadFile | null,
})

// 获取状态标签类型
const getStatusType = (status: string | number) => {
  switch (status) {
    case 3:
    case '3':
      return 'success'
    case 2:
    case '2':
      return 'warning'
    case 1:
    case '1':
      return 'info'
    default:
      return 'danger'
  }
}

// 搜索文档
const handleSearch = () => {
  console.log('搜索参数:', searchForm)
  // 这里应该调用API获取搜索结果
  currentPage.value = 1
  fetchDocuments()
}

// 重置搜索
const handleReset = () => {
  searchForm.keyword = ''
  searchForm.status = ''
  searchForm.dateRange = []
  fetchDocuments()
}

// 上传文档
const handleUpload = () => {
  dialogTitle.value = '上传文档'
  dialogVisible.value = true
}

// 提交上传
const handleSubmitUpload = () => {
  console.log('上传文档:', uploadForm)
  // 这里应该调用API上传文档
  dialogVisible.value = false
}

// 编辑文档
const handleEdit = (row: DocumentRecord) => {
  dialogTitle.value = '编辑文档'
  uploadForm.name = row.name
  dialogVisible.value = true
}

// 删除文档
const handleDelete = (row: DocumentRecord) => {
  console.log('删除文档:', row.id)
  // 这里应该调用API删除文档
}

// 查看文档
const handleView = (row: DocumentRecord) => {
  console.log('查看文档:', row.id)
  // 这里应该打开文档预览
}

// 获取文档列表
const fetchDocuments = () => {
  // 这里应该调用API获取文档列表
  total.value = documentList.value.length
}

// 分页变化
const handlePageChange = (page: number) => {
  currentPage.value = page
  fetchDocuments()
}

onMounted(() => {
  fetchDocuments()
})
</script>

<template>
  <div class="documents">
    <!-- 搜索区域 -->
    <el-card class="search-card" header-class="search-card-header">
      <template #header>
        <h2 v-focus>文档管理</h2>
      </template>
      <el-form :inline="true" :model="searchForm" v-focus>
        <el-form-item label="关键词">
          <el-input v-model="searchForm.keyword" placeholder="请输入文档名称" clearable />
        </el-form-item>
        <el-form-item label="状态">
          <el-select v-model="searchForm.status" placeholder="请选择状态" clearable>
            <el-option
              v-for="opt in searchOptions"
              :key="opt.value"
              :label="opt.label"
              :value="opt.value"
            />
          </el-select>
        </el-form-item>
        <el-form-item label="更新时间">
          <el-date-picker
            v-model="searchForm.dateRange"
            type="daterange"
            value-format="YYYY/MM/DD"
            range-separator="至"
            start-placeholder="开始日期"
            end-placeholder="结束日期"
          />
        </el-form-item>
        <el-form-item>
          <el-button type="primary" @click="handleSearch" v-focus>搜索</el-button>
          <el-button @click="handleReset" v-focus>重置</el-button>
        </el-form-item>
      </el-form>
    </el-card>

    <!-- 文档列表 -->
    <el-card class="table-card">
      <div class="documents-header" v-focus>
        <h1 v-focus>文档管理</h1>
        <el-button type="primary" @click="handleUpload" v-focus>
          <el-icon><Upload /></el-icon>
          上传文档
        </el-button>
      </div>

      <el-table :data="documentList" stripe border>
        <el-table-column prop="id" label="ID" width="80" />
        <el-table-column prop="name" label="文档名称" min-width="200" />
        <el-table-column prop="size" label="文件大小" width="120" />
        <el-table-column prop="updateTime" label="更新时间" width="180" />
        <el-table-column prop="author" label="作者" width="120" />
        <el-table-column prop="status" label="状态" width="120">
          <template #default="{ row }">
            <el-tag v-if="row.status" :type="getStatusType(row.status)">{{
              getStatusLabel(row.status)
            }}</el-tag>
          </template>
        </el-table-column>
        <el-table-column label="操作" width="200" fixed="right">
          <template #default="{ row }">
            <el-button type="primary" link @click="handleView(row)">查看</el-button>
            <el-button type="primary" link @click="handleEdit(row)">编辑</el-button>
            <el-button type="danger" link @click="handleDelete(row)">删除</el-button>
          </template>
        </el-table-column>
      </el-table>

      <!-- 分页 -->
      <div class="pagination-container">
        <el-pagination
          v-model:current-page="currentPage"
          v-model:page-size="pageSize"
          :page-sizes="[10, 20, 50, 100]"
          :total="total"
          layout="total, sizes, prev, pager, next, jumper"
          @current-change="handlePageChange"
        />
      </div>
    </el-card>

    <!-- 上传/编辑对话框 -->
    <el-dialog v-model="dialogVisible" :title="dialogTitle" width="500px">
      <el-form :model="uploadForm" label-width="80px">
        <el-form-item label="文档名称">
          <el-input v-model="uploadForm.name" placeholder="请输入文档名称" />
        </el-form-item>
        <el-form-item label="描述">
          <el-input
            v-model="uploadForm.description"
            type="textarea"
            :rows="3"
            placeholder="请输入文档描述"
          />
        </el-form-item>
        <el-form-item label="文件">
          <el-upload
            drag
            action="#"
            :auto-upload="false"
            :on-change="(file: UploadFile) => (uploadForm.file = file)"
          >
            <el-icon class="el-icon--upload"><UploadFilled /></el-icon>
            <div class="el-upload__text">拖拽文件到此处或 <em>点击上传</em></div>
            <template #tip>
              <div class="el-upload__tip">支持 doc/docx/pdf/md 等格式，文件大小不超过 10MB</div>
            </template>
          </el-upload>
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="dialogVisible = false">取消</el-button>
        <el-button type="primary" @click="handleSubmitUpload">确定</el-button>
      </template>
    </el-dialog>
  </div>
</template>

<style lang="scss" scoped>
.documents {
  padding: 20px;
}

.documents-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20px;
}

.search-card {
  margin-bottom: 20px;

  .search-card-header {
    border-bottom: none !important;
  }
}

.table-card {
  margin-bottom: 20px;
}

.pagination-container {
  display: flex;
  justify-content: flex-end;
  margin-top: 20px;
}
</style>
