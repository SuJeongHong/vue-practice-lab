<script setup>
import { RouterLink } from 'vue-router'
import UnitToggler from './UnitToggler.vue'
</script>

<template>
  <!-- 주요 화면 이동 링크와 전역 온도 단위 스위치를 공통 메뉴로 제공합니다. -->
  <nav class="navigation-bar" aria-label="주요 메뉴">
    <div class="navigation-links">
      <RouterLink to="/" class="navigation-link" exact-active-class="navigation-link--active">
        <span aria-hidden="true">🌤️</span>
        <span>날씨 대시보드</span>
      </RouterLink>

      <RouterLink to="/weather-search" class="navigation-link" exact-active-class="navigation-link--active">
        <span aria-hidden="true">🔎</span>
        <span>날씨 검색</span>
      </RouterLink>

      <RouterLink to="/life-weather-planner" class="navigation-link" exact-active-class="navigation-link--active">
        <span aria-hidden="true">📅</span>
        <span>생활 날씨 플래너</span>
      </RouterLink>

      <RouterLink to="/about" class="navigation-link" exact-active-class="navigation-link--active">
        <span aria-hidden="true">ℹ️</span>
        <span>서비스 소개</span>
      </RouterLink>
    </div>

    <UnitToggler />
  </nav>
</template>

<style scoped>
.navigation-bar {
  width: 100%;
  max-width: 900px;
  box-sizing: border-box;
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 18px;
  margin: 0 auto 24px;
  padding: 12px;
  background: #ffffff;
  border: 1px solid #e2e8ec;
  border-radius: 12px;
  box-shadow: 0 4px 14px rgba(39, 55, 64, 0.06);
}

.navigation-links {
  display: flex;
  align-items: center;
  flex-wrap: wrap;
  gap: 4px;
  padding: 4px;
  background: #f1f6f8;
  border: 1px solid #e3ecef;
  border-radius: 10px;
}

.navigation-link {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  padding: 9px 12px;
  color: #52717d;
  font-size: 13px;
  font-weight: 700;
  text-decoration: none;
  border: 1px solid transparent;
  border-radius: 8px;
  transition:
    color 0.2s ease,
    background-color 0.2s ease,
    border-color 0.2s ease,
    box-shadow 0.2s ease,
    transform 0.2s ease;
}

.navigation-link:hover {
  color: #356f82;
  background: #ffffff;
  border-color: #d5e3e8;
  transform: translateY(-1px);
}

.navigation-link--active {
  color: #ffffff;
  background: #3f8099;
  border-color: #3f8099;
  box-shadow: 0 4px 10px rgba(45, 105, 128, 0.22);
}

.navigation-link--active:hover {
  color: #ffffff;
  background: #356f86;
  border-color: #356f86;
}

@media (max-width: 700px) {
  .navigation-bar {
    flex-direction: column;
    align-items: stretch;
    gap: 10px;
  }

  .navigation-links {
    justify-content: center;
  }

  .navigation-bar :deep(.unit-toggler) {
    align-self: flex-end;
  }
}

@media (max-width: 440px) {
  .navigation-links {
    flex-direction: column;
  }

  .navigation-link {
    width: 100%;
    box-sizing: border-box;
    justify-content: center;
  }
}
</style>
