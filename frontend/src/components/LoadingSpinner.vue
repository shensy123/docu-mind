<template>
  <div class="loading-spinner" role="status" aria-live="polite">
    <div class="spinner" />
  </div>
</template>

<script setup lang="ts">
// 纯展示组件，无逻辑
</script>

<style scoped>
.loading-spinner {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 100%;
  height: 100%;
  padding: 24px;
}

.spinner {
  width: 48px;
  height: 48px;
  border-radius: 50%;
  border: 4px solid rgb(0 0 0 / 8%);
  border-top-color: #0b5cff; /* 主色 */
  animation: spin 1s linear infinite; /* 动画时长 1s */
}

@keyframes spin {
  from {
    transform: rotate(0deg);
  }

  to {
    transform: rotate(360deg);
  }
}
</style>
