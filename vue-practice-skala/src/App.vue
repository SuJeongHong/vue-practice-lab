<script setup>
import NavigationBar from './components/navigation/NavigationBar.vue'
</script>

<template>
  <div class="app-container">
    <!-- 모든 페이지에서 공통 메뉴를 보여 주고 현재 경로의 화면을 렌더링합니다. -->
    <NavigationBar />

    <RouterView />
  </div>
</template>

<style scoped>
.app-container {
  width: 100%;
  max-width: 900px;
  margin: 0 auto;
  padding: 24px;
}
</style>
