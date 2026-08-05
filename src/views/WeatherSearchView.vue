<script setup>
import { computed, watch } from 'vue'
import { storeToRefs } from 'pinia'
import { useRoute, useRouter } from 'vue-router'

import LocationSearchBar from '@/components/weather/LocationSearchBar.vue'
import WeatherSearchResultList from '@/components/weather/WeatherSearchResultList.vue'
import { useWeatherSearchStore } from '@/stores/weatherSearchStore'

const route = useRoute()
const router = useRouter()
const weatherSearchStore = useWeatherSearchStore()

const {
  searchResults,
  isLoading,
  errorMessage,
  resultCount,
  citySuggestions,
  isSuggestionLoading,
  suggestionErrorMessage,
} = storeToRefs(weatherSearchStore)

const routeCity = computed(() => {
  const city = Array.isArray(route.query.city) ? route.query.city[0] : route.query.city

  return typeof city === 'string' ? city.trim() : ''
})

const getRouteQueryValue = (value) => (Array.isArray(value) ? value[0] : value)

// URL의 도시명과 좌표를 날씨 Store가 사용할 검색 객체로 변환합니다.
const routeLocation = computed(() => {
  const latitude = Number(getRouteQueryValue(route.query.lat))
  const longitude = Number(getRouteQueryValue(route.query.lon))

  return {
    name: routeCity.value,
    lat: Number.isFinite(latitude) ? latitude : undefined,
    lon: Number.isFinite(longitude) ? longitude : undefined,
  }
})

// 검색한 도시를 URL에 기록해 새로고침하거나 공유해도 같은 검색을 재현합니다.
const handleSearch = async (locationInput) => {
  const location = locationInput
  const trimmedCityName = String(location?.name ?? '').trim()

  if (!trimmedCityName) {
    return
  }

  const query = {
    city: trimmedCityName,
  }
  const latitude = Number(location.lat)
  const longitude = Number(location.lon)

  if (Number.isFinite(latitude) && Number.isFinite(longitude)) {
    query.lat = String(latitude)
    query.lon = String(longitude)
  }

  const targetRoute = router.resolve({
    path: '/weather-search',
    query,
  })

  if (targetRoute.fullPath === route.fullPath) {
    await weatherSearchStore.fetchWeather(location)
    return
  }

  await router.push(targetRoute)
}

// 검색 URL이 바뀌면 해당 도시의 날씨를 조회합니다.
watch(
  () => route.fullPath,
  async () => {
    if (!routeCity.value) {
      return
    }

    await weatherSearchStore.fetchWeather(routeLocation.value)
  },
  { immediate: true },
)

// 사용자의 확인을 받은 뒤 최근 검색 결과 전체를 삭제합니다.
const handleClearAll = () => {
  if (searchResults.value.length === 0) {
    return
  }

  const shouldClear = window.confirm('저장된 날씨 검색 결과를 모두 삭제할까요?')

  if (shouldClear) {
    weatherSearchStore.clearSearchResults()
  }
}
</script>

<template>
  <main class="weather-search-view">
    <header class="page-header">
      <p class="eyebrow">OPENWEATHER SEARCH</p>
      <h1>날씨 검색 대시보드</h1>
      <p>원하는 지역이나 도시를 검색하고 최근 날씨를 저장해 보세요.</p>
    </header>

    <LocationSearchBar
      input-id="weather-city-search"
      :initial-city="routeCity"
      :loading="isLoading"
      :suggestions="citySuggestions"
      :suggestion-loading="isSuggestionLoading"
      :suggestion-error-message="suggestionErrorMessage"
      @request-suggestions="weatherSearchStore.fetchCitySuggestions"
      @clear-suggestions="weatherSearchStore.clearCitySuggestions"
      @search="handleSearch"
    />

    <p v-if="isLoading" class="status-message loading-message" role="status">
      날씨 정보를 불러오는 중입니다.
    </p>

    <p v-else-if="errorMessage" class="status-message error-message" role="alert">
      {{ errorMessage }}
    </p>

    <WeatherSearchResultList
      :results="searchResults"
      :result-count="resultCount"
      @remove="weatherSearchStore.removeSearchResult"
      @clear="handleClearAll"
    />
  </main>
</template>

<style scoped>
.weather-search-view {
  width: 100%;
  max-width: 800px;
  margin: 0 auto;
  padding-bottom: 40px;
}

.page-header {
  margin-bottom: 18px;
}

.eyebrow {
  margin: 0 0 5px;
  color: #3d758b;
  font-size: 11px;
  font-weight: 800;
  letter-spacing: 0.14em;
}

.page-header h1 {
  margin: 0;
  color: #263238;
  font-size: 28px;
  letter-spacing: -0.03em;
}

.page-header > p:last-child {
  margin: 7px 0 0;
  color: #607d8b;
  font-size: 14px;
}

.status-message {
  margin: 12px 0 0;
  padding: 11px 13px;
  font-size: 13px;
  border-radius: 8px;
}

.loading-message {
  color: #356d83;
  background-color: #edf6f9;
}

.error-message {
  color: #a33434;
  background-color: #fff1f1;
}

@media (max-width: 560px) {
  .page-header h1 {
    font-size: 24px;
  }
}
</style>
