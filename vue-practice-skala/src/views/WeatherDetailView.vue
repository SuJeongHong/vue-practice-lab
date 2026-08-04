<script setup>
import {
  computed,
  onMounted,
  ref,
} from 'vue'

import {
  RouterLink,
  useRoute,
} from 'vue-router'

import {
  fetchWeatherByCityId,
} from '@/api/weatherApi'

import {
  useConfigStore,
} from '@/stores/configStore'

const route = useRoute()
const configStore = useConfigStore()

const selectedWeather = ref(null)
const loading = ref(false)
const errorMessage = ref('')

onMounted(async () => {
  loading.value = true

  try {
    const cityId = route.params.cityId

    selectedWeather.value =
      await fetchWeatherByCityId(cityId)
  } catch (error) {
    console.error(error)

    errorMessage.value =
      '상세 날씨 정보를 가져오지 못했습니다.'
  } finally {
    loading.value = false
  }
})

const displayTemp = computed(() => {
  const temp = selectedWeather.value?.temp

  if (temp === undefined) {
    return ''
  }

  if (configStore.unit === 'fahrenheit') {
    return Math.round((temp * 9) / 5 + 32)
  }

  return temp
})
</script>

<template>
  <section class="weather-detail">
    <p
      v-if="loading"
      class="loading-message"
    >
      상세 날씨 정보를 불러오는 중입니다.
    </p>

    <p
      v-else-if="errorMessage"
      class="error-message"
    >
      {{ errorMessage }}
    </p>

    <!-- ID와 일치하는 도시를 찾았을 때 -->
    <article
      v-else-if="selectedWeather"
      class="detail-card"
    >
      <header class="detail-header">
        <div class="header-top">
          <span class="content-label">WEATHER NOW</span>
        </div>

        <div class="title-row">
          <div>
            <h2>{{ selectedWeather.name }} 지역 날씨 </h2>
          </div>
          <span class="detail-condition"> {{ selectedWeather.conditionIcon }}</span>
        </div>
      </header>

      <div class="card-body">
        <div class="temperature-panel">
          <span class="temperature-icon" aria-hidden="true">🌡️</span>
          <div>
            <span class="temperature-label">현재 관측 기온</span>
            <strong class="temperature-value">
              {{ displayTemp }}{{ configStore.unitSymbol }}
            </strong>
          </div>
        </div>

        <dl class="weather-metrics">
          <div class="metric-item humidity-card">
            <dt>💧 습도</dt>
            <dd>{{ selectedWeather.humidity }}%</dd>
          </div>

          <div class="metric-item wind-card">
            <dt>💨 풍속</dt>
            <dd>{{ selectedWeather.windSpeed }}m/s</dd>
          </div>
        </dl>
      </div>
    </article>

    <!-- ID와 일치하는 도시가 없을 때 -->
    <div v-else>
      <h2>도시 정보를 찾을 수 없습니다.</h2>
      <p>도시 코드: {{ route.params.cityId }}</p>
    </div>

    <RouterLink
      to="/"
      class="back-link"
    >
      ← 날씨 대시보드로 돌아가기
    </RouterLink>
  </section>
</template>

<style scoped>
.weather-detail {
  width: 100%;
  max-width: 440px;
  box-sizing: border-box;
  margin: 0 auto;
  padding: 8px 0 28px;
}

.detail-card {
  overflow: hidden;
  background-color: #f7fbfd;
  border: 1px solid #dcecf2;
  border-radius: 22px;
  box-shadow: 0 14px 30px rgba(38, 74, 92, 0.14);
}

.detail-header {
  position: relative;
  isolation: isolate;
  overflow: hidden;
  padding: 20px 22px 24px;
  color: #ffffff;
  background: linear-gradient(135deg, #075985, #0ea5a8);
}

.detail-header::after {
  position: absolute;
  z-index: -1;
  right: -32px;
  bottom: -54px;
  width: 150px;
  height: 150px;
  content: '';
  background-color: rgba(255, 255, 255, 0.1);
  border-radius: 50%;
}

.header-top,
.title-row {
  display: flex;
  align-items: center;
  justify-content: space-between;
}

.content-label {
  font-size: 11px;
  font-weight: 800;
  letter-spacing: 0.16em;
}

.detail-condition {
  display: inline-block;
  font-size: 40px;
  line-height: 1;
  vertical-align: middle;
}


.city-code {
  padding: 4px 9px;
  font-size: 11px;
  font-weight: 700;
  letter-spacing: 0.04em;
  background-color: rgba(255, 255, 255, 0.2);
  border-radius: 999px;
}

.title-row {
  align-items: flex-end;
  margin-top: 22px;
}

.title-row p {
  margin: 0 0 3px;
  color: rgba(255, 255, 255, 0.76);
  font-size: 12px;
}

.title-row h2 {
  margin: 0;
  font-size: 29px;
  letter-spacing: -0.04em;
}

.header-icon {
  font-size: 45px;
  filter: drop-shadow(0 5px 8px rgba(0, 0, 0, 0.15));
}

.card-body {
  padding: 16px;
}

.temperature-panel {
  display: flex;
  align-items: center;
  gap: 14px;
  padding: 17px 18px;
  background-color: #ffffff;
  border: 1px solid #e1edf3;
  border-radius: 16px;
}

.temperature-icon {
  font-size: 34px;
}

.temperature-label {
  display: block;
  margin-bottom: 2px;
  color: #78909c;
  font-size: 14px;
  font-weight: 700;
}

.temperature-value {
  color: #263238;
  font-size: 36px;
  line-height: 1;
}

.weather-metrics {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 10px;
  margin: 10px 0 0;
  padding: 0;
}

.metric-item {
  padding: 13px 15px;
  background-color: #ffffff;
  border: 1px solid #e1edf3;
  border-radius: 14px;
}

.humidity-card {
  background: linear-gradient(145deg, #ffffff, #eef8ff);
}

.wind-card {
  background: linear-gradient(145deg, #ffffff, #effcf8);
}

.metric-item dt {
  color: #607d8b;
  font-size: 14px;
  font-weight: 700;
}

.metric-item dd {
  margin: 5px 0 0;
  color: #263238;
  font-size: 18px;
  font-weight: 800;
}

.back-link {
  display: block;
  width: fit-content;
  margin: 18px auto 0;
  padding: 9px 15px;
  font-size: 14px;
  color: #0277bd;
  font-weight: 700;
  text-decoration: none;
  background-color: #e1f5fe;
  border-radius: 999px;
  transition:
    color 0.2s ease,
    background-color 0.2s ease,
    transform 0.2s ease;
}

.back-link:hover {
  color: #ffffff;
  background-color: #0288d1;
  transform: translateY(-1px);
}

.loading-message,
.error-message {
  padding: 24px;
  text-align: center;
  border-radius: 12px;
}

.loading-message {
  color: #0277bd;
  background-color: #e1f5fe;
}

.error-message {
  color: #c62828;
  background-color: #ffebee;
}

@media (max-width: 560px) {
  .detail-header {
    padding: 18px 20px;
  }

  .weather-metrics {
    grid-template-columns: repeat(2, minmax(0, 1fr));
  }

  .temperature-value {
    font-size: 34px;
  }
}
</style>
