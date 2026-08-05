<script setup>
import { RouterLink, useRoute } from 'vue-router'

const route = useRoute()
</script>

<template>
  <section class="not-found">
    <h1>404</h1>

    <h2>페이지를 찾을 수 없습니다.</h2>

    <p>
      요청한 주소:
      {{ route.fullPath }}
    </p>

    <RouterLink to="/">
      날씨 대시보드로 돌아가기
    </RouterLink>
  </section>
</template>

<style scoped>
.not-found {
  max-width: 600px;
  margin: 80px auto;
  padding: 32px;
  text-align: center;
}

.not-found h1 {
  margin: 0;
  color: #42a5f5;
  font-size: 72px;
}

.not-found a {
  display: inline-block;
  margin-top: 20px;
}
</style>