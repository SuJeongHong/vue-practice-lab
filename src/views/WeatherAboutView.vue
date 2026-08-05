<script setup>
import { RouterLink } from 'vue-router'

const serviceFeatures = [
  {
    icon: '🌏',
    title: '주요 도시 날씨',
    description: '국내 주요 도시의 현재 기온과 날씨를 한눈에 비교하고, 도시별 상세 정보를 확인할 수 있어요.',
  },
  {
    icon: '🔎',
    title: '전 세계 도시 검색',
    description: '자동완성으로 원하는 지역을 찾고, 최근에 확인한 날씨를 브라우저에 저장할 수 있어요.',
  },
  {
    icon: '🧥',
    title: '생활 날씨 플래너',
    description: '7일 날씨와 대기질을 함께 분석해 옷차림, 우산, 마스크, 빨래, 야외활동 조언을 제공해요.',
  },
]
</script>

<template>
  <main class="about-page">
    <section class="about-hero">
      <p class="eyebrow">ABOUT WEATHER DASHBOARD</p>
      <h1>날씨를 확인하는 것에서,<br />하루를 준비하는 것까지</h1>
      <p class="hero-description">현재 날씨와 대기질 정보를 쉽게 살펴보고, 오늘의 일상에 필요한 선택을 빠르게 내릴 수 있도록 돕는 날씨 서비스입니다.</p>

      <div class="hero-actions">
        <RouterLink class="primary-link" to="/">날씨 대시보드 보기</RouterLink>
        <RouterLink class="secondary-link" to="/life-weather-planner">생활 플래너 시작하기</RouterLink>
      </div>
    </section>

    <section class="feature-section" aria-labelledby="feature-title">
      <div class="section-heading">
        <p class="eyebrow">WHAT YOU CAN DO</p>
        <h2 id="feature-title">하나의 화면에서 만나는 날씨 정보</h2>
      </div>

      <div class="feature-grid">
        <article v-for="feature in serviceFeatures" :key="feature.title" class="feature-card">
          <span class="feature-icon" aria-hidden="true">{{ feature.icon }}</span>
          <h3>{{ feature.title }}</h3>
          <p>{{ feature.description }}</p>
        </article>
      </div>
    </section>

    <section class="data-note">
      <div>
        <p class="eyebrow">RELIABLE WEATHER DATA</p>
        <h2>실시간 데이터를 기반으로 정보를 제공해요</h2>
      </div>
      <p>OpenWeather의 현재 날씨와 Open-Meteo의 예보·대기질 데이터를 활용합니다. 실제 외출이나 안전과 관련된 결정 전에는 최신 기상 특보도 함께 확인해 주세요.</p>
    </section>

    <RouterLink class="search-link" to="/weather-search">원하는 도시의 날씨 검색하기 →</RouterLink>
  </main>
</template>

<style scoped>
.about-page {
  width: 100%;
  max-width: 960px;
  margin: 0 auto;
  padding-bottom: 48px;
}

.about-hero {
  padding: 52px 44px;
  overflow: hidden;
  background:
    radial-gradient(circle at 90% 10%, rgba(135, 206, 235, 0.34), transparent 34%),
    linear-gradient(135deg, #f3fafc 0%, #ffffff 70%);
  border: 1px solid #dce9ee;
  border-radius: 24px;
}

.eyebrow {
  margin: 0 0 10px;
  color: #3d758b;
  font-size: 12px;
  font-weight: 800;
  letter-spacing: 0.14em;
}

.about-hero h1 {
  margin: 0;
  color: #20343d;
  font-size: clamp(34px, 6vw, 56px);
  line-height: 1.18;
  letter-spacing: -0.055em;
}

.hero-description {
  max-width: 650px;
  margin: 24px 0 0;
  color: #526a75;
  font-size: 17px;
  line-height: 1.8;
}

.hero-actions {
  display: flex;
  flex-wrap: wrap;
  gap: 10px;
  margin-top: 30px;
}

.hero-actions a {
  padding: 12px 18px;
  font-size: 14px;
  font-weight: 700;
  text-decoration: none;
  border-radius: 10px;
}

.primary-link {
  color: #ffffff;
  background: #356f86;
}

.secondary-link {
  color: #356f86;
  background: #ffffff;
  border: 1px solid #bdd2da;
}

.feature-section {
  margin-top: 54px;
}

.section-heading h2,
.data-note h2 {
  margin: 0;
  color: #263d47;
  font-size: 26px;
  letter-spacing: -0.035em;
}

.feature-grid {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 16px;
  margin-top: 22px;
}

.feature-card {
  padding: 26px 22px;
  background: #ffffff;
  border: 1px solid #e0e9ed;
  border-radius: 16px;
  box-shadow: 0 8px 24px rgba(44, 75, 88, 0.06);
}

.feature-icon {
  display: grid;
  width: 46px;
  height: 46px;
  place-items: center;
  font-size: 23px;
  background: #edf6f9;
  border-radius: 12px;
}

.feature-card h3 {
  margin: 18px 0 8px;
  color: #2c4651;
  font-size: 18px;
}

.feature-card p,
.data-note > p {
  margin: 0;
  color: #607783;
  font-size: 14px;
  line-height: 1.75;
}

.data-note {
  display: grid;
  grid-template-columns: minmax(240px, 0.8fr) 1.2fr;
  gap: 40px;
  align-items: center;
  margin-top: 54px;
  padding: 30px;
  background: #f7fafb;
  border-left: 4px solid #5f94a8;
  border-radius: 0 14px 14px 0;
}

.search-link {
  display: inline-block;
  margin-top: 30px;
  color: #356f86;
  font-weight: 800;
  text-decoration: none;
}

.hero-actions a:hover,
.search-link:hover {
  filter: brightness(0.94);
}

@media (max-width: 720px) {
  .about-hero {
    padding: 38px 24px;
  }

  .feature-grid,
  .data-note {
    grid-template-columns: 1fr;
  }

  .data-note {
    gap: 16px;
  }
}
</style>
