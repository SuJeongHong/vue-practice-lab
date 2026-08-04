<script setup>
import { RouterLink } from 'vue-router'
import UnitToggler from './UnitToggler.vue'
</script>

<template>
  <nav
    class="navigation-bar"
    aria-label="주요 메뉴"
  >
    <div class="navigation-links">
      <RouterLink
        to="/"
        class="navigation-link"
        exact-active-class="navigation-link--active"
      >
        <span aria-hidden="true">🌤️</span>
        <span>날씨 대시보드</span>
      </RouterLink>

      <RouterLink
        to="/about"
        class="navigation-link"
        exact-active-class="navigation-link--active"
      >
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
  max-width: 800px;
  box-sizing: border-box;

  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 24px;

  margin: 0 auto 32px;
  padding: 16px 20px;

  background: rgba(255, 255, 255, 0.96);
  border: 1px solid #e3edf3;
  border-radius: 16px;
  box-shadow: 0 8px 24px rgba(55, 71, 79, 0.08);
}

.navigation-links {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 5px;

  background-color: #f3f7f9;
  border-radius: 12px;
}

.navigation-link {
  display: inline-flex;
  align-items: center;
  gap: 7px;
  padding: 10px 14px;

  color: #546e7a;
  font-weight: 700;
  text-decoration: none;
  border-radius: 9px;

  transition:
    color 0.2s ease,
    background-color 0.2s ease,
    box-shadow 0.2s ease,
    transform 0.2s ease;
}

.navigation-link:hover {
  color: #0288d1;
  background-color: #ffffff;
  transform: translateY(-1px);
}

.navigation-link--active {
  color: #ffffff;
  background: linear-gradient(135deg, #29b6f6, #0288d1);
  box-shadow: 0 5px 12px rgba(2, 136, 209, 0.24);
}

.navigation-link--active:hover {
  color: #ffffff;
  background: linear-gradient(135deg, #29b6f6, #0277bd);
}

@media (max-width: 700px) {
  .navigation-bar {
    flex-direction: column;
    align-items: stretch;
  }

  .navigation-links {
    justify-content: center;
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
