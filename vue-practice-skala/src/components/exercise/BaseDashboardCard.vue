<script setup>
defineProps({
  title: {
    type: String,
    required: true,
  },
})
</script>

<template>
  <section class="dashboard-card">
    <h3>{{ title }}</h3>

    <slot />
    <!-- 도시검색, 지역별 잘씨 현황 박스slot 해옴 -->
  </section>
</template>

<style scoped>
.dashboard-card {
  padding: 20px;
  background-color: #e8e8e8fd;
  border-radius: 12px;
  box-shadow:
    0 4px 12px rgba(0, 0, 0, 0.15);
}
</style>