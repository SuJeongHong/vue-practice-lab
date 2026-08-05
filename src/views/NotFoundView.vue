<script setup>
import { RouterLink, useRoute } from 'vue-router'

const route = useRoute()
</script>

<template>
  <main class="not-found-page">
    <section class="not-found-card">
      <div class="error-visual" aria-hidden="true">
        <span>🌦️</span>
        <strong>404</strong>
      </div>

      <div class="error-content">
        <p class="eyebrow">PAGE NOT FOUND</p>
        <h1>페이지를 찾을 수 없습니다</h1>
        <p class="description">주소가 잘못 입력되었거나 페이지가 이동되었어요.<br />날씨 대시보드에서 다시 시작해 주세요.</p>

        <div class="requested-path">
          <span>요청한 주소</span>
          <code>{{ route.fullPath }}</code>
        </div>

        <RouterLink class="home-link" to="/">날씨 대시보드로 돌아가기</RouterLink>
      </div>
    </section>
  </main>
</template>

<style scoped>
.not-found-page {
  box-sizing: border-box;
  width: 100%;
  max-width: 900px;
  margin: 0 auto;
  padding: 36px 0 48px;
}

.not-found-card {
  display: grid;
  grid-template-columns: minmax(220px, 0.75fr) minmax(0, 1.25fr);
  gap: 42px;
  align-items: center;
  padding: 52px 48px;
  overflow: hidden;
  background:
    radial-gradient(circle at 12% 15%, rgba(112, 190, 219, 0.2), transparent 32%),
    #ffffff;
  border: 1px solid #e2e8ec;
  border-radius: 16px;
  box-shadow: 0 8px 24px rgba(39, 55, 64, 0.07);
}

.error-visual {
  position: relative;
  display: grid;
  min-height: 230px;
  place-items: center;
  background: linear-gradient(145deg, #edf7f9, #f8fbfc);
  border: 1px solid #d9e8ec;
  border-radius: 18px;
}

.error-visual::before,
.error-visual::after {
  position: absolute;
  content: '';
  background: rgba(63, 128, 153, 0.09);
  border-radius: 999px;
}

.error-visual::before {
  top: 24px;
  right: 28px;
  width: 54px;
  height: 54px;
}

.error-visual::after {
  bottom: 28px;
  left: 24px;
  width: 30px;
  height: 30px;
}

.error-visual span {
  position: absolute;
  top: 37px;
  font-size: 43px;
  filter: drop-shadow(0 5px 8px rgba(45, 105, 128, 0.14));
}

.error-visual strong {
  margin-top: 55px;
  color: #3f8099;
  font-size: clamp(64px, 10vw, 92px);
  line-height: 1;
  letter-spacing: -0.07em;
}

.eyebrow {
  margin: 0 0 7px;
  color: #3d758b;
  font-size: 10px;
  font-weight: 800;
  letter-spacing: 0.14em;
}

.error-content h1 {
  margin: 0;
  color: #263d47;
  font-size: clamp(28px, 4vw, 38px);
  letter-spacing: -0.04em;
}

.description {
  margin: 14px 0 0;
  color: #607783;
  font-size: 14px;
  line-height: 1.7;
}

.requested-path {
  display: flex;
  flex-direction: column;
  gap: 5px;
  margin-top: 22px;
  padding: 11px 13px;
  background: #f5f8f9;
  border: 1px solid #e4ebee;
  border-radius: 8px;
}

.requested-path span {
  color: #718790;
  font-size: 10px;
  font-weight: 700;
}

.requested-path code {
  overflow-wrap: anywhere;
  color: #3d6675;
  font-family: inherit;
  font-size: 12px;
  font-weight: 700;
}

.home-link {
  display: inline-block;
  margin-top: 22px;
  padding: 11px 16px;
  color: #ffffff;
  font-size: 13px;
  font-weight: 800;
  text-decoration: none;
  background: #3f8099;
  border-radius: 9px;
  box-shadow: 0 4px 10px rgba(45, 105, 128, 0.2);
  transition:
    background-color 0.2s ease,
    transform 0.2s ease;
}

.home-link:hover {
  background: #356f86;
  transform: translateY(-1px);
}

@media (max-width: 680px) {
  .not-found-page {
    padding-top: 10px;
  }

  .not-found-card {
    grid-template-columns: 1fr;
    gap: 28px;
    padding: 28px 22px;
  }

  .error-visual {
    min-height: 190px;
  }

  .error-content {
    text-align: center;
  }

  .requested-path {
    text-align: left;
  }
}
</style>
