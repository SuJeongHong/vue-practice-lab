<script setup>
import { computed, onBeforeUnmount, watch } from 'vue'
import { storeToRefs } from 'pinia'
import { useRoute, useRouter } from 'vue-router'

import WeatherApiSearchBar from '@/components/exercise/WeatherApiSearchBar.vue'
import WeatherSearchResultList from '@/components/exercise/WeatherSearchResultList.vue'
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
} = storeToRefs(weatherSearchStore)

let suggestionTimerId

const routeCity = computed(() => {
  const city = Array.isArray(route.query.city)
    ? route.query.city[0]
    : route.query.city

  return typeof city === 'string'
    ? city.trim()
    : ''
})

const handleSearch = async (cityName) => {
  const trimmedCityName = cityName.trim()

  if (!trimmedCityName) {
    return
  }

  if (
    routeCity.value.toLowerCase() ===
    trimmedCityName.toLowerCase()
  ) {
    await weatherSearchStore.fetchWeather(trimmedCityName)
    return
  }

  await router.push({
    path: '/weather-search',
    query: {
      city: trimmedCityName,
    },
  })
}

const handleQueryChange = (query) => {
  window.clearTimeout(suggestionTimerId)

  const trimmedQuery = query.trim()

  if (!trimmedQuery) {
    weatherSearchStore.clearCitySuggestions()
    return
  }

  weatherSearchStore.prepareCitySuggestionSearch()

  suggestionTimerId = window.setTimeout(() => {
    weatherSearchStore.fetchCitySuggestions(trimmedQuery)
  }, 350)
}

const clearSuggestions = () => {
  window.clearTimeout(suggestionTimerId)
  weatherSearchStore.clearCitySuggestions()
}

watch(
  () => route.query.city,
  async () => {
    if (!routeCity.value) {
      return
    }

    await weatherSearchStore.fetchWeather(routeCity.value)
  },
  { immediate: true },
)

onBeforeUnmount(() => {
  window.clearTimeout(suggestionTimerId)
  weatherSearchStore.clearCitySuggestions()
})

const handleClearAll = () => {
  if (searchResults.value.length === 0) {
    return
  }

  const shouldClear = window.confirm(
    '저장된 날씨 검색 결과를 모두 삭제할까요?',
  )

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
      <p>
        원하는 지역이나 도시를 검색하고 최근 날씨를 저장해 보세요.
      </p>
    </header>

    <WeatherApiSearchBar
      :initial-city="routeCity"
      :loading="isLoading"
      :suggestions="citySuggestions"
      :suggestion-loading="isSuggestionLoading"
      @search="handleSearch"
      @query-change="handleQueryChange"
      @clear-suggestions="clearSuggestions"
    />

    <p
      v-if="isLoading"
      class="status-message loading-message"
      role="status"
    >
      날씨 정보를 불러오는 중입니다.
    </p>

    <p
      v-else-if="errorMessage"
      class="status-message error-message"
      role="alert"
    >
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
