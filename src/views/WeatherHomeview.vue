<script setup>
import { computed, onMounted, ref, watch, watchEffect } from 'vue'
import { useRouter } from 'vue-router'

import BaseDashboardCard from '@/components/dashboard/BaseDashboardCard.vue'
import SearchBar from '@/components/dashboard/SearchBar.vue'
import WeatherCard from '@/components/weather/WeatherCard.vue'
import { fetchAllWeather } from '@/api/weatherApi'
import { useConfigStore } from '@/stores/configStore'

const weatherList = ref([])
const loading = ref(false)
const errorMessage = ref('')
const searchQuery = ref('')
const selectedCityInfo = ref('카드를 클릭하거나 검색해 보세요.')
const router = useRouter()
const configStore = useConfigStore()

// 등록된 국내 도시의 날씨를 불러오고 요청 상태를 화면에 반영합니다.
const loadWeatherList = async () => {
  loading.value = true
  errorMessage.value = ''

  try {
    weatherList.value = await fetchAllWeather()
  } catch (error) {
    console.error('날씨 API 요청 실패:', error)

    errorMessage.value = '날씨 정보를 가져오지 못했습니다.'
  } finally {
    loading.value = false
  }
}

onMounted(() => {
  loadWeatherList()
})

// 입력한 도시 이름과 일치하는 카드만 실시간으로 필터링합니다.
const filteredWeatherList = computed(() => {
  const query = searchQuery.value.trim()

  if (!query) {
    return weatherList.value
  }

  return weatherList.value.filter((item) => item.name.includes(query))
})

// 검색 입력 컴포넌트가 전달한 값을 부모의 검색어 상태에 반영합니다.
const handleUpdateQuery = (newQuery) => {
  searchQuery.value = newQuery
}

// 선택한 날씨 카드의 도시명을 화면 하단 상태 문구에 반영합니다.
const handleSelectCard = (weather) => {
  selectedCityInfo.value = `${weather.name}이 선택되었습니다.`
}

// 상세보기 버튼을 누르면 선택한 도시 ID가 포함된 상세 경로로 이동합니다.
const handleClickDetail = (weather) => {
  router.push(`/weather/${weather.id}`)
}

// 카드 선택 전후의 상태 문구를 콘솔에서 비교합니다.
watch(selectedCityInfo, (newValue, oldValue) => {
  console.log('✅ [watch / 카드 선택]', {
    이전상태: oldValue,
    현재상태: newValue,
  })
})

// API 응답으로 날씨 목록이 바뀌면 도시 수와 수신 데이터를 콘솔에 표시합니다.
watch(weatherList, (newList, oldList) => {
  console.log('🌦️ [watch / 날씨 API 수신]', {
    이전도시수: oldList.length,
    현재도시수: newList.length,
  })

  console.table(
    newList.map((weather) => ({
      도시: weather.name,
      기온: weather.temp,
      날씨: weather.condition,
    })),
  )
})

// API 요청의 시작과 완료 시점을 로딩 상태 변화로 확인합니다.
watch(loading, (isLoading) => {
  console.log(`⏳ [watch / API 로딩] ${isLoading ? '요청 시작' : '요청 완료'}`)
})

// 섭씨와 화씨 설정이 바뀔 때 이전 단위와 현재 단위를 비교합니다.
watch(
  () => configStore.unit,
  (newUnit, oldUnit) => {
    console.log('🌡️ [watch / 단위 변경]', {
      이전단위: oldUnit,
      현재단위: newUnit,
      표시기호: configStore.unitSymbol,
    })
  },
)

// 검색어나 필터 결과가 바뀌면 watchEffect가 추적한 최신 검색 상태를 출력합니다.
watchEffect(() => {
  const query = searchQuery.value.trim()
  const resultList = filteredWeatherList.value

  console.log('🔎 [watchEffect / 도시 검색]', {
    검색어: query || '(전체 도시)',
    검색결과수: resultList.length,
    검색결과: resultList.map((weather) => weather.name),
  })
})
</script>

<template>
  <div class="dashboard-wrapper">
    <BaseDashboardCard title="🔍 도시 검색">
      <!-- 검색어는 부모가 관리하고 입력 컴포넌트는 변경된 값만 전달합니다. -->
      <SearchBar :query="searchQuery" @update-query="handleUpdateQuery" />
    </BaseDashboardCard>

    <BaseDashboardCard title="🏙️ 지역별 날씨 현황">
      <p v-if="loading" class="loading-message">날씨 정보를 불러오는 중입니다.</p>

      <p v-else-if="errorMessage" class="error-message">
        {{ errorMessage }}
      </p>

      <div v-else-if="filteredWeatherList.length > 0" class="weather-list">
        <WeatherCard v-for="item in filteredWeatherList" :key="item.id" :weather="item" @select-card="handleSelectCard" @click-detail="handleClickDetail" />
      </div>

      <p v-else class="empty-message">검색 결과와 일치하는 도시가 없습니다.</p>

      <div class="status-bar">
        {{ selectedCityInfo }}
      </div>
    </BaseDashboardCard>
  </div>
</template>

<style scoped>
.dashboard-wrapper {
  width: 100%;
  max-width: 800px;
  margin: 0 auto;
  display: flex;
  flex-direction: column;
  gap: 18px;
}

.dashboard-wrapper > :deep(.dashboard-card) {
  padding: 22px;
  background-color: #ffffff;
  border: 1px solid #e2e8ec;
  border-radius: 12px;
  box-shadow: 0 4px 14px rgba(39, 55, 64, 0.06);
}

.dashboard-wrapper > :deep(.dashboard-card h3) {
  margin: 0 0 18px;
  padding-bottom: 12px;
  color: #37474f;
  font-size: 18px;
  border-bottom: 1px solid #edf1f3;
}

.dashboard-wrapper :deep(.search-area) {
  gap: 8px;
}

.dashboard-wrapper :deep(.search-area input) {
  box-sizing: border-box;
  width: 100%;
  padding: 12px 14px;
  color: #263238;
  background-color: #fafcfd;
  border: 1px solid #cfd8dc;
  border-radius: 8px;
  outline: none;
  transition:
    border-color 0.2s ease,
    box-shadow 0.2s ease;
}

.dashboard-wrapper :deep(.search-area input:focus) {
  background-color: #ffffff;
  border-color: #4f8fa8;
  box-shadow: 0 0 0 3px rgba(79, 143, 168, 0.12);
}

.dashboard-wrapper :deep(.search-area p) {
  margin: 0;
  color: #78909c;
  font-size: 13px;
}

.weather-list {
  display: grid;
  gap: 10px;
}

.weather-list :deep(.weather-card) {
  padding: 14px 16px;
  background-color: #ffffff;
  border: 1px solid #e1e7ea;
  border-radius: 10px;
  box-shadow: none;
  transition:
    border-color 0.2s ease,
    box-shadow 0.2s ease,
    transform 0.2s ease;
}

.weather-list :deep(.weather-card:hover) {
  background-color: #ffffff;
  border-color: #aebfc7;
  box-shadow: 0 5px 12px rgba(43, 62, 72, 0.07);
  transform: translateY(-1px);
}

.weather-list :deep(.weather-information h4) {
  margin: 0 0 6px;
  color: #263238;
  font-size: 16px;
}

.weather-list :deep(.weather-information p) {
  margin: 0 0 9px;
  color: #546e7a;
  font-size: 14px;
}

.weather-list :deep(.weather-information span) {
  display: inline-block;
  padding: 4px 8px;
  color: #455a64;
  font-size: 12px;
  font-weight: 700;
  background-color: #eef3f5;
  border-radius: 6px;
}

.weather-list :deep(.very-hot),
.weather-list :deep(.hot) {
  color: #a12b2b;
  background-color: #fff0f0;
}

.weather-list :deep(.warm),
.weather-list :deep(.mild) {
  color: #8a5a12;
  background-color: #fff7e6;
}

.weather-list :deep(.cool),
.weather-list :deep(.cold),
.weather-list :deep(.freezing) {
  color: #28627a;
  background-color: #edf7fb;
}

.weather-list :deep(.btn-detail) {
  padding: 7px 11px;
  color: #356d83;
  font-size: 13px;
  font-weight: 700;
  background-color: #ffffff;
  border: 1px solid #b8cbd3;
  border-radius: 7px;
}

.weather-list :deep(.btn-detail:hover) {
  color: #ffffff;
  background-color: #477f95;
  border-color: #477f95;
}

.loading-message,
.error-message {
  padding: 24px;
  margin: 0;
  text-align: center;
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

.empty-message {
  padding: 24px;
  margin: 0;
  color: #78909c;
  text-align: center;
  background-color: #f7f9fa;
  border-radius: 8px;
}

.status-bar {
  margin-top: 14px;
  padding: 10px 12px;
  color: #55717d;
  text-align: center;
  font-size: 13px;
  font-weight: 600;
  background-color: #f1f6f8;
  border-radius: 7px;
}

@media (max-width: 600px) {
  .dashboard-wrapper {
    gap: 14px;
  }

  .dashboard-wrapper > :deep(.dashboard-card) {
    padding: 16px;
  }

  .weather-list :deep(.weather-card) {
    gap: 12px;
  }
}
</style>
