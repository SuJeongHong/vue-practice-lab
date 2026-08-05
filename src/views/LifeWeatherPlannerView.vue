<script setup>
import { computed, ref, watch } from 'vue'
import { storeToRefs } from 'pinia'
import { useRoute, useRouter } from 'vue-router'

import LocationSearchBar from '@/components/weather/LocationSearchBar.vue'
import { useConfigStore } from '@/stores/configStore'
import { useLifeWeatherStore } from '@/stores/lifeWeatherStore'

const route = useRoute()
const router = useRouter()
const configStore = useConfigStore()
const lifeWeatherStore = useLifeWeatherStore()

const { selectedLocation, currentWeather, dailyForecast, isLoading, errorMessage, locationSuggestions, isLocationLoading, locationErrorMessage } = storeToRefs(lifeWeatherStore)

const isLocationSearchOpen = ref(!selectedLocation.value)

const getRouteQueryValue = (value) => (Array.isArray(value) ? value[0] : value)

// Router 쿼리의 지역 이름과 좌표를 검증해 Store에서 사용할 객체로 변환합니다.
const routeLocation = computed(() => {
  const name = getRouteQueryValue(route.query.name)
  const latitudeValue = getRouteQueryValue(route.query.lat)
  const longitudeValue = getRouteQueryValue(route.query.lon)

  if (typeof name !== 'string' || !name.trim() || typeof latitudeValue !== 'string' || !latitudeValue.trim() || typeof longitudeValue !== 'string' || !longitudeValue.trim()) {
    return null
  }

  const latitude = Number(latitudeValue)
  const longitude = Number(longitudeValue)

  if (!Number.isFinite(latitude) || latitude < -90 || latitude > 90 || !Number.isFinite(longitude) || longitude < -180 || longitude > 180) {
    return null
  }

  return {
    name: name.trim(),
    lat: latitude,
    lon: longitude,
  }
})

// URL에 지역이 있으면 즉시 조회하고 없으면 마지막 저장 지역을 URL에 복원합니다.
watch(
  () => route.fullPath,
  async () => {
    if (routeLocation.value) {
      isLocationSearchOpen.value = false
      await lifeWeatherStore.fetchPlanner(routeLocation.value)
      return
    }

    if (selectedLocation.value) {
      await router.replace({
        name: 'LifeWeatherPlanner',
        query: {
          name: selectedLocation.value.name,
          lat: String(selectedLocation.value.lat),
          lon: String(selectedLocation.value.lon),
        },
      })
      return
    }

    isLocationSearchOpen.value = true
  },
  { immediate: true },
)

// 지역 변경 버튼을 누르면 공통 지역 검색 컴포넌트를 다시 표시합니다.
const openLocationSearch = () => {
  isLocationSearchOpen.value = true
}

const closeLocationSearch = () => {
  lifeWeatherStore.clearLocationSuggestions()
  isLocationSearchOpen.value = false
}

// 선택한 지역을 쿼리에 저장해 URL 변경과 동시에 새 날씨를 불러옵니다.
const selectLocation = async (location) => {
  isLocationSearchOpen.value = false

  const targetRoute = router.resolve({
    name: 'LifeWeatherPlanner',
    query: {
      name: location.name,
      lat: String(location.lat),
      lon: String(location.lon),
    },
  })

  if (targetRoute.fullPath === route.fullPath) {
    await lifeWeatherStore.fetchPlanner(location)
    return
  }

  await router.push(targetRoute)
}

// 섭씨 원본 값을 기존 전역 설정에 맞춰 섭씨 또는 화씨로 표시합니다.
const formatTemperature = (temperature) => {
  if (temperature === null || temperature === undefined) {
    return '예보 없음'
  }

  const displayTemperature = configStore.unit === 'fahrenheit' ? (temperature * 9) / 5 + 32 : temperature

  return `${Math.round(displayTemperature)}${configStore.unitSymbol}`
}

const formatDate = (date) =>
  new Intl.DateTimeFormat('ko-KR', {
    month: 'numeric',
    day: 'numeric',
  }).format(new Date(`${date}T00:00:00`))

const formatWeekday = (date) => new Intl.DateTimeFormat('ko-KR', { weekday: 'short' }).format(new Date(`${date}T00:00:00`))

const formatAirQuality = (value) => (value === null ? '예보 없음' : `${value}㎍/㎥`)
const formatPrecipitation = (value) => (value === null ? '예보 없음' : `${value}%`)

// 오늘의 기온·강수·미세먼지 조건으로 다섯 가지 생활 조언을 계산합니다.
const lifeAdvice = computed(() => {
  const today = dailyForecast.value[0]

  if (!today) {
    return []
  }

  const clothingAdvice = []

  if (today.maxTemp === null) {
    clothingAdvice.push('기온 예보가 없어 외출 전 현재 기온을 확인하세요.')
  } else if (today.maxTemp >= 33) {
    clothingAdvice.push('통풍이 잘되는 아주 가벼운 옷을 입고 야외에서는 자주 쉬세요.')
  } else if (today.maxTemp >= 28) {
    clothingAdvice.push('반소매처럼 가벼운 옷을 입고 수분을 충분히 섭취하세요.')
  } else if (today.maxTemp >= 23) {
    clothingAdvice.push('반소매나 얇은 긴소매가 잘 맞는 날씨예요.')
  } else if (today.maxTemp >= 18) {
    clothingAdvice.push('얇은 긴소매에 가벼운 가디건을 준비하세요.')
  } else if (today.maxTemp >= 12) {
    clothingAdvice.push('니트나 맨투맨과 가벼운 재킷을 추천해요.')
  } else {
    clothingAdvice.push('두꺼운 니트와 보온이 되는 외투를 입으세요.')
  }

  if (today.minTemp !== null) {
    if (today.minTemp <= 0) {
      clothingAdvice.push('아침저녁에는 패딩과 목도리·장갑으로 보온하세요.')
    } else if (today.minTemp <= 5) {
      clothingAdvice.push('아침저녁 추위에 대비해 두꺼운 외투를 챙기세요.')
    } else if (today.minTemp <= 10 && today.maxTemp !== null && today.maxTemp >= 18) {
      clothingAdvice.push('아침저녁에는 쌀쌀하므로 얇은 외투를 챙기세요.')
    }
  }

  if (today.maxTemp !== null && today.minTemp !== null && today.maxTemp - today.minTemp >= 10) {
    clothingAdvice.push('일교차가 크므로 벗어 입기 쉬운 옷이 좋아요.')
  }

  const hasAirQuality = today.pm10 !== null && today.pm2_5 !== null
  const needsUmbrella = today.precipitationProbability !== null && today.precipitationProbability >= 50
  const needsMask = today.pm2_5 !== null && today.pm2_5 >= 36
  const isLaundryFriendly = hasAirQuality && today.precipitationProbability !== null && today.precipitationProbability < 30 && today.pm10 < 80 && today.pm2_5 < 36

  let outdoorAdvice = '야외활동하기 무난한 날씨입니다.'

  if (!hasAirQuality) {
    outdoorAdvice = '대기질 예보가 없어 외출 전 최신 정보를 확인하세요.'
  } else if (needsUmbrella || needsMask) {
    outdoorAdvice = '비나 미세먼지에 대비해 야외활동 시간을 조절하세요.'
  } else if (today.maxTemp !== null && today.maxTemp >= 33) {
    outdoorAdvice = '더운 시간대를 피해 야외활동하세요.'
  }

  let ventilationAdvice = '대기질이 무난해 10분 정도 환기하기 좋아요.'

  if (!hasAirQuality) {
    ventilationAdvice = '대기질 정보가 없어 환기 전 최신 미세먼지를 확인하세요.'
  } else if (needsMask || today.pm10 >= 80) {
    ventilationAdvice = '미세먼지가 높아 창문을 닫고 환기는 짧게 해 주세요.'
  } else if (needsUmbrella) {
    ventilationAdvice = '비가 오지 않는 시간을 골라 짧게 환기해 주세요.'
  } else if (currentWeather.value?.humidity !== null && currentWeather.value?.humidity >= 70) {
    ventilationAdvice = '습도가 높아 짧게 환기하고 제습기를 함께 사용하면 좋아요.'
  }

  return [
    {
      title: '옷차림',
      icon: '👕',
      text: clothingAdvice.join(' '),
    },
    {
      title: '우산',
      icon: '☔',
      text: needsUmbrella ? '강수 확률이 높아 우산을 추천해요.' : '우산 없이 외출해도 괜찮아요.',
    },
    {
      title: '마스크',
      icon: '😷',
      text: today.pm2_5 === null ? '초미세먼지 예보가 없어 최신 정보를 확인하세요.' : needsMask ? 'PM2.5가 높아 마스크를 추천해요.' : '미세먼지용 마스크 없이도 무난해요.',
    },
    {
      title: '빨래',
      icon: '🧺',
      text: !hasAirQuality ? '대기질 예보가 없어 빨래 지수를 판단하기 어려워요.' : isLaundryFriendly ? '강수와 미세먼지가 낮아 빨래하기 좋아요.' : '실내 건조를 고려해 보세요.',
    },
    {
      title: '야외활동',
      icon: '🚶',
      text: outdoorAdvice,
    },
    {
      title: '환기',
      icon: '🪟',
      text: ventilationAdvice,
    },
  ]
})

const retryPlanner = () => {
  if (selectedLocation.value) {
    lifeWeatherStore.fetchPlanner(selectedLocation.value, { force: true })
  }
}
</script>

<template>
  <main class="life-planner-page">
    <header class="planner-header">
      <p class="eyebrow">LIFE WEATHER PLANNER</p>
      <h1>생활 날씨 플래너</h1>
      <p>날씨와 대기질을 함께 확인하고 오늘의 생활 계획을 준비해 보세요.</p>
    </header>

    <section v-if="selectedLocation" class="selected-location" aria-label="현재 선택 지역">
      <div>
        <span>현재 선택 지역</span>
        <strong>📍 {{ selectedLocation.name }}</strong>
      </div>

      <button type="button" @click="openLocationSearch">지역 변경</button>
    </section>

    <section v-if="isLocationSearchOpen" class="location-search-panel">
      <div class="search-panel-header">
        <div>
          <h2>지역 검색</h2>
          <p>도시나 지역을 검색한 뒤 정확한 위치를 선택해 주세요.</p>
        </div>

        <button v-if="selectedLocation" type="button" class="close-button" @click="closeLocationSearch">닫기</button>
      </div>

      <LocationSearchBar
        input-id="life-location-search"
        label="지역 이름"
        placeholder="예: 서울, 부산, Tokyo"
        submit-text="지역 검색"
        selection-required
        embedded
        :suggestions="locationSuggestions"
        :suggestion-loading="isLocationLoading"
        :suggestion-error-message="locationErrorMessage"
        @request-suggestions="lifeWeatherStore.searchLocations"
        @clear-suggestions="lifeWeatherStore.clearLocationSuggestions"
        @search="selectLocation"
      />
    </section>

    <section v-if="isLoading" class="planner-state" role="status">
      <span class="state-icon" aria-hidden="true">⛅</span>
      <h2>생활 날씨를 준비하고 있어요</h2>
      <p>날씨와 대기질 예보를 함께 불러오는 중입니다.</p>
    </section>

    <section v-else-if="errorMessage" class="planner-state error-state" role="alert">
      <span class="state-icon" aria-hidden="true">⚠️</span>
      <h2>정보를 불러오지 못했습니다</h2>
      <p>{{ errorMessage }}</p>
      <button type="button" @click="retryPlanner">다시 시도</button>
    </section>

    <template v-else-if="currentWeather && dailyForecast.length > 0">
      <section class="current-weather-card">
        <div class="current-condition">
          <span class="current-icon" aria-hidden="true">{{ currentWeather.conditionIcon }}</span>
          <div>
            <span>지금 날씨</span>
            <strong>{{ currentWeather.condition }}</strong>
          </div>
        </div>

        <dl class="current-metrics">
          <div>
            <dt>현재 기온</dt>
            <dd>{{ formatTemperature(currentWeather.temp) }}</dd>
          </div>
          <div>
            <dt>체감온도</dt>
            <dd>{{ formatTemperature(currentWeather.feelsLike) }}</dd>
          </div>
          <div>
            <dt>습도</dt>
            <dd>
              {{ currentWeather.humidity === null ? '정보 없음' : `${currentWeather.humidity}%` }}
            </dd>
          </div>
        </dl>
      </section>

      <section class="advice-section">
        <div class="section-heading">
          <span>오늘의 추천</span>
          <h2>생활 날씨 조언</h2>
        </div>

        <div class="advice-grid">
          <article v-for="advice in lifeAdvice" :key="advice.title" class="advice-card">
            <span aria-hidden="true">{{ advice.icon }}</span>
            <div>
              <h3>{{ advice.title }}</h3>
              <p>{{ advice.text }}</p>
            </div>
          </article>
        </div>
      </section>

      <section class="forecast-section">
        <div class="section-heading">
          <span>5-DAY FORECAST</span>
          <h2>5일 날씨 달력</h2>
        </div>

        <div class="forecast-grid">
          <article v-for="(day, index) in dailyForecast" :key="day.date" class="forecast-card" :class="{ 'forecast-card--today': index === 0 }">
            <header>
              <span>{{ index === 0 ? '오늘' : formatWeekday(day.date) }}</span>
              <strong>{{ formatDate(day.date) }}</strong>
            </header>

            <div class="forecast-condition">
              <span aria-hidden="true">{{ day.conditionIcon }}</span>
              <strong>{{ day.condition }}</strong>
            </div>

            <dl>
              <div>
                <dt>최고 / 최저</dt>
                <dd>
                  <span class="high-temp">{{ formatTemperature(day.maxTemp) }}</span>
                  /
                  <span class="low-temp">{{ formatTemperature(day.minTemp) }}</span>
                </dd>
              </div>
              <div>
                <dt>강수 확률</dt>
                <dd>{{ formatPrecipitation(day.precipitationProbability) }}</dd>
              </div>
              <div>
                <dt>PM10 일평균</dt>
                <dd>{{ formatAirQuality(day.pm10) }}</dd>
              </div>
              <div>
                <dt>PM2.5 일평균</dt>
                <dd>{{ formatAirQuality(day.pm2_5) }}</dd>
              </div>
            </dl>
          </article>
        </div>
      </section>
    </template>

    <section v-else-if="!selectedLocation" class="planner-state empty-state">
      <span class="state-icon" aria-hidden="true">🗺️</span>
      <h2>먼저 지역을 선택해 주세요</h2>
      <p>선택한 지역을 기준으로 5일 생활 날씨를 만들어 드립니다.</p>
    </section>
  </main>
</template>

<style scoped>
.life-planner-page {
  box-sizing: border-box;
  width: 100%;
  max-width: 900px;
  margin: 0 auto;
  padding-bottom: 48px;
}

.planner-header {
  margin-bottom: 18px;
  padding: 26px 28px;
  background:
    radial-gradient(circle at 90% 10%, rgba(112, 190, 219, 0.2), transparent 34%),
    linear-gradient(145deg, #f5fbfd, #ffffff);
  border: 1px solid #dce9ee;
  border-radius: 16px;
}

.eyebrow,
.section-heading > span {
  margin: 0 0 5px;
  color: #34778c;
  font-size: 11px;
  font-weight: 800;
  letter-spacing: 0.14em;
}

.planner-header h1,
.section-heading h2 {
  margin: 0;
  color: #20343d;
  letter-spacing: -0.04em;
}

.planner-header h1 {
  font-size: 28px;
}

.planner-header > p:last-child {
  margin: 8px 0 0;
  color: #647b85;
  font-size: 14px;
}

.selected-location {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 16px;
  margin-bottom: 16px;
  padding: 14px 18px;
  background: #ffffff;
  border: 1px solid #dbe7eb;
  border-left: 4px solid #4c91a9;
  border-radius: 12px;
  box-shadow: 0 4px 14px rgba(39, 70, 82, 0.05);
}

.selected-location div {
  display: flex;
  flex-direction: column;
  gap: 3px;
}

.selected-location span {
  color: #6b858f;
  font-size: 11px;
  font-weight: 700;
}

.selected-location strong {
  color: #204a58;
  font-size: 17px;
}

.selected-location button,
.planner-state button {
  padding: 9px 13px;
  color: #ffffff;
  font: inherit;
  font-size: 13px;
  font-weight: 800;
  background-color: #34778c;
  border: 0;
  border-radius: 9px;
  cursor: pointer;
}

.location-search-panel {
  margin-bottom: 18px;
  padding: 20px;
  background-color: #ffffff;
  border: 1px solid #dbe6ea;
  border-radius: 12px;
  box-shadow: 0 4px 14px rgba(39, 70, 82, 0.06);
}

.search-panel-header {
  display: flex;
  align-items: center;
  gap: 10px;
}

.search-panel-header {
  justify-content: space-between;
  margin-bottom: 16px;
}

.search-panel-header h2 {
  margin: 0;
  color: #263f49;
  font-size: 19px;
}

.search-panel-header p {
  margin: 4px 0 0;
  color: #708791;
  font-size: 13px;
}

.search-panel-header .close-button {
  padding: 7px 10px;
  color: #55727d;
  font: inherit;
  font-size: 12px;
  font-weight: 700;
  background-color: #f3f7f8;
  border: 1px solid #d8e3e7;
  border-radius: 7px;
  cursor: pointer;
}

.planner-state {
  padding: 44px 24px;
  text-align: center;
  background-color: #f5fafb;
  border: 1px solid #dbe9ec;
  border-radius: 12px;
}

.planner-state .state-icon {
  display: block;
  margin-bottom: 8px;
  font-size: 38px;
}

.planner-state h2 {
  margin: 0;
  color: #2a4b57;
  font-size: 20px;
}

.planner-state p {
  margin: 7px 0 0;
  color: #6e858e;
  font-size: 14px;
}

.planner-state button {
  margin-top: 15px;
}

.error-state {
  background-color: #fff7f7;
  border-color: #efdddd;
}

.empty-state {
  margin-top: 16px;
}

.current-weather-card {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 24px;
  margin-bottom: 0;
  padding: 22px 24px;
  color: #ffffff;
  background: linear-gradient(135deg, #246b85, #2f9a8b);
  border-radius: 14px;
  box-shadow: 0 8px 22px rgba(35, 99, 117, 0.16);
}

.current-condition {
  display: flex;
  align-items: center;
  gap: 13px;
}

.current-icon {
  font-size: 46px;
  filter: drop-shadow(0 5px 8px rgba(0, 0, 0, 0.15));
}

.current-condition div {
  display: flex;
  flex-direction: column;
  gap: 3px;
}

.current-condition div span {
  color: rgba(255, 255, 255, 0.76);
  font-size: 12px;
  font-weight: 700;
}

.current-condition strong {
  font-size: 21px;
}

.current-metrics {
  display: grid;
  min-width: 0;
  grid-template-columns: repeat(3, minmax(0, 1fr));
  gap: 8px;
  margin: 0;
}

.current-metrics div {
  min-width: 86px;
  padding: 11px;
  text-align: center;
  background-color: rgba(255, 255, 255, 0.13);
  border: 1px solid rgba(255, 255, 255, 0.16);
  border-radius: 11px;
}

.current-metrics dt {
  color: rgba(255, 255, 255, 0.72);
  font-size: 11px;
}

.current-metrics dd {
  margin: 4px 0 0;
  font-size: 16px;
  font-weight: 800;
}

.advice-section,
.forecast-section {
  margin-top: 18px;
  padding: 22px;
  background: #ffffff;
  border: 1px solid #e0e9ed;
  border-radius: 12px;
  box-shadow: 0 4px 14px rgba(39, 70, 82, 0.05);
}

.section-heading {
  margin-bottom: 16px;
  padding-bottom: 12px;
  border-bottom: 1px solid #edf2f4;
}

.section-heading h2 {
  font-size: 20px;
}

.advice-grid {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 10px;
}

.advice-card {
  display: flex;
  align-items: flex-start;
  gap: 10px;
  min-height: 92px;
  box-sizing: border-box;
  padding: 15px;
  background: #f9fbfc;
  border: 1px solid #e3ebee;
  border-radius: 10px;
}

.advice-card > span {
  display: grid;
  width: 36px;
  height: 36px;
  flex: 0 0 auto;
  place-items: center;
  font-size: 21px;
  background: #edf6f8;
  border-radius: 9px;
}

.advice-card h3 {
  margin: 0 0 5px;
  color: #304e59;
  font-size: 14px;
}

.advice-card p {
  margin: 0;
  color: #6b8189;
  font-size: 12px;
  line-height: 1.55;
}

.forecast-grid {
  display: grid;
  grid-template-columns: repeat(5, minmax(0, 1fr));
  gap: 10px;
}

.forecast-card {
  min-width: 0;
  padding: 14px 12px;
  background: #fbfcfd;
  border: 1px solid #dde7ea;
  border-radius: 11px;
  box-shadow: none;
}

.forecast-card--today {
  background: linear-gradient(180deg, #f1fbfd, #ffffff);
  border-color: #88c8d6;
  box-shadow: 0 5px 14px rgba(50, 130, 149, 0.1);
}

.forecast-card header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 4px;
  color: #71858d;
  font-size: 10px;
}

.forecast-card header span {
  color: #317d92;
  font-weight: 800;
}

.forecast-condition {
  display: flex;
  min-height: 76px;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 3px;
  padding: 8px 0;
  text-align: center;
}

.forecast-condition span {
  font-size: 28px;
}

.forecast-condition strong {
  color: #37535d;
  font-size: 12px;
}

.forecast-card dl {
  display: grid;
  gap: 7px;
  margin: 0;
}

.forecast-card dl div {
  padding-top: 7px;
  border-top: 1px solid #edf1f2;
}

.forecast-card dt {
  color: #82949b;
  font-size: 10px;
}

.forecast-card dd {
  margin: 3px 0 0;
  color: #405962;
  font-size: 11px;
  font-weight: 800;
  line-height: 1.35;
}

.high-temp {
  color: #d05e4d;
}

.low-temp {
  color: #3a7daa;
}

@media (max-width: 820px) {
  .forecast-grid {
    grid-template-columns: repeat(3, minmax(0, 1fr));
  }
}

@media (max-width: 680px) {
  .planner-header h1 {
    font-size: 26px;
  }

  .current-weather-card {
    flex-direction: column;
    align-items: stretch;
  }

  .current-metrics div {
    min-width: 0;
  }

  .forecast-grid {
    grid-template-columns: repeat(2, minmax(0, 1fr));
  }

  .forecast-card {
    padding: 15px;
  }

  .forecast-card dl {
    grid-template-columns: 1fr;
  }
}

@media (max-width: 440px) {
  .planner-header {
    padding: 22px 18px;
  }

  .selected-location,
  .search-panel-header {
    align-items: stretch;
    flex-direction: column;
  }

  .selected-location button,
  .search-panel-header .close-button {
    width: 100%;
  }

  .current-metrics {
    grid-template-columns: 1fr;
  }

  .advice-grid,
  .forecast-grid,
  .forecast-card dl {
    grid-template-columns: 1fr;
  }

  .advice-section,
  .forecast-section {
    padding: 18px 15px;
  }

  .forecast-condition {
    min-height: 58px;
    flex-direction: row;
  }
}
</style>
