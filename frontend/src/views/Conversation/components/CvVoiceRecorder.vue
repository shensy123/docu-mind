<!-- 预留空组件:语音收音态(动效/计时/取消),后续步骤实现,本次仅占位 -->
<script setup lang="ts">
// 收音态由 CvInputTools 通过 v-show 控制,本组件是自包含交互态(独立小组件比事件+样式干净)
// 未来结构:
//   - 收音动效(声波动画)
//   - 计时(录音时长)
//   - 取消(MediaRecorder 停止并丢弃)
</script>

<template>
  <div class="cv-voice-recorder">
    <!-- 未来:收音动效 / 计时 / 取消 -->
  </div>
</template>
