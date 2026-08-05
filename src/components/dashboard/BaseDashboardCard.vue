<script setup>
defineProps({
  title: {
    type: String,
    required: true,
  },
})
</script>

<template>
  <el-card class="dashboard-card" shadow="never">
    <h3>{{ title }}</h3>

    <!-- 부모가 전달한 서로 다른 내용을 같은 카드 레이아웃 안에 표시합니다. -->
    <slot />
  </el-card>
</template>

<style scoped>
.dashboard-card {
  padding: 20px;
  background-color: #e8e8e8fd;
  border-radius: 12px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
}

.dashboard-card :deep(.el-card__body) {
  padding: 0;
}
</style>
