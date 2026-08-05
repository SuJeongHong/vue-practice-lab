<script setup>
import { RouterLink } from 'vue-router'
</script>

<template>
  <section class="about-page">
    <h2>ℹ️ 서비스 소개</h2>

    <p>본 서비스는 Vue 3와 Vue Router를 활용한 날씨 대시보드입니다.</p>

    <RouterLink to="/"> 대시보드로 돌아가기 </RouterLink>
  </section>
</template>

<style scoped>
.about-page {
  padding: 20px;
}
</style>
