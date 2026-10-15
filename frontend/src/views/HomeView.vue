<template>
  <div>
    <el-space fill :size="16" style="width: 100%">
      <el-card header="Home">
        <template #header>
          <div class="card-header">
            <span>Table</span>
            <el-button type="primary" size="small" @click="handleClick">Add</el-button>
          </div>
        </template>
        <h1>Home</h1>
      </el-card>

      <el-card header="Table">
        <el-table
          :data="tableData"
          height="250"
          :header-cell-style="{ 'text-align': 'center' }"
          :cell-style="{ 'text-align': 'center' }"
        >
          <el-table-column fixed prop="date" label="Date" width="150" />
          <el-table-column prop="name" label="Name" width="120" />
          <el-table-column prop="state" label="State" width="120" />
          <el-table-column prop="city" label="City" width="120" />
          <el-table-column prop="address" label="Address" width="200" />
          <el-table-column prop="zip" label="Zip" width="120" />
          <el-table-column fixed="right" label="Operations" min-width="120">
            <template #default>
              <el-button link type="primary" size="small" @click="handleClick"> Detail </el-button>
              <el-button link type="primary" size="small">Edit</el-button>
            </template>
          </el-table-column>
        </el-table>
      </el-card>
      <div style="width: 100%; height: 20px; background: #ccc"></div>

      <p>
        在 Flex 布局中，当 flex: 1 的元素内部使用了 Element Plus 的
        el-scroller（或其他滚动容器），内容的最小宽度很可能因为滚动容器的默认样式而无法正确传递，导致元素被压缩到比内容还窄。下面分析原因并给出直接有效的解决方案。
        问题原因 Flex 项目的默认 min-width: auto 可能会被内部的 overflow 打断
        当子元素是滚动容器（overflow: auto / hidden）时，浏览器可能会将 flex 项目的 min-width: auto
        解析为 0，从而允许项目无限收缩，忽略内容最小宽度。 el-scroller 内部结构会影响宽度计算
        Element Plus 的滚动组件通常会生成 .el-scrollbar__wrap 和
        .el-scrollbar__view，它们的宽度可能默认为 100%
        或受限于父容器，导致内部内容即使有长单词也无法撑开外部容器。 纵向滚动需求下的宽度冲突
        既要让容器出现纵向滚动条，又希望横向宽度由内容决定（不被剪裁），这需要明确区分滚动方向的行为。
      </p>
      <div v-for="(item, idx) in Array.from({ length: 100 }, (_, i) => i + 1)" :key="idx">
        <p>内容段落 {{ item }}</p>
        <p>内容段落 {{ item }}</p>
        <p>内容段落 {{ item }}</p>
        <p>内容段落 {{ item }}</p>
        <p>内容段落 {{ item }}</p>
      </div>
    </el-space>
  </div>
</template>
<script lang="ts" setup>
const handleClick = () => {
  console.log('click')
}

const tableData = [
  {
    date: '2016-05-03',
    name: 'Tom3356',
    state: 'California',
    city: 'Los Angeles',
    address: 'No. 189, Grove St, Los Angeles',
    zip: 'CA 90036',
    tag: 'Home',
  },
  {
    date: '2016-05-02',
    name: 'Tom1',
    state: 'California',
    city: 'Los Angeles',
    address: 'No. 189, Grove St, Los Angeles',
    zip: 'CA 90036',
    tag: 'Office',
  },
  {
    date: '2016-05-04',
    name: 'Tom',
    state: 'California',
    city: 'Los Angeles',
    address: 'No. 189, Grove St, Los Angeles',
    zip: 'CA 90036',
    tag: 'Home',
  },
  {
    date: '2016-05-01',
    name: 'Tom24',
    state: 'California',
    city: 'Los Angeles',
    address: 'No. 189, Grove St, Los Angeles',
    zip: 'CA 90036',
    tag: 'Office',
  },
  {
    date: '2016-05-07',
    name: 'Tom444',
    state: 'California',
    city: 'Los Angeles',
    address: 'No. 189, Grove St, Los Angeles',
    zip: 'CA 90036',
    tag: 'Office',
  },
  {
    date: '2016-05-02',
    name: 'Tomq3wed',
    state: 'California',
    city: 'Los Angeles',
    address: 'No. 189, Grove St, Los Angeles',
    zip: 'CA 90036',
    tag: 'Office',
  },
  {
    date: '2016-05-11',
    name: 'Tom3',
    state: 'California',
    city: 'Los Angeles',
    address: 'No. 189, Grove St, Los Angeles',
    zip: 'CA 90036',
    tag: 'Office',
  },
  {
    date: '2016-05-12',
    name: 'Tom4',
    state: 'California',
    city: 'Los Angeles',
    address: 'No. 189, Grove St, Los Angeles',
    zip: 'CA 90036',
    tag: 'Office',
  },
]
</script>
