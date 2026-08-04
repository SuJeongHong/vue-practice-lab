<script setup>
import {
  ref,
  computed,
  watch,
  watchEffect,
  onMounted,
} from 'vue'
import { useRouter } from 'vue-router'

import BaseDashboardCard from '@/components/exercise/BaseDashboardCard.vue'
import SearchBar from '@/components/exercise/SearchBar.vue'
import WeatherCard from '@/components/exercise/WeatherCard.vue'
import { fetchAllWeather } from '@/api/weatherApi'
import { useConfigStore } from '@/stores/configStore'

// 모든 날씨 데이터는 부모 컴포넌트에서 관리
const weatherList = ref([])
const loading = ref(false)
const errorMessage = ref('')

const loadWeatherList = async () => {
  loading.value = true
  errorMessage.value = ''

  try {
    weatherList.value = await fetchAllWeather()
  } catch (error) {
    console.error('날씨 API 요청 실패:', error)

    errorMessage.value =
      '날씨 정보를 가져오지 못했습니다.'
  } finally {
    loading.value = false
  }
}

onMounted(() => {
  loadWeatherList()
})

// 부모가 관리하는 반응형 상태
const searchQuery = ref('')

const selectedCityInfo = ref('카드를 클릭하거나 검색해 보세요.',)

// 검색어에 해당하는 도시 목록 계산
const filteredWeatherList = computed(() => {
  const query = searchQuery.value.trim()

  // 검색어가 비어 있으면 원본 데이터 반환
  if (!query) {
    return weatherList.value
  }

  // 검색어와 일치하는 도시만 반환
  return weatherList.value.filter((item) =>
    item.name.includes(query),
  )
})

// SearchBar의 update-query 이벤트 처리
const handleUpdateQuery = (newQuery) => {
  searchQuery.value = newQuery
}

// WeatherCard의 select-card 이벤트 처리
const handleSelectCard = (weather) => {
  selectedCityInfo.value =
    `${weather.name}이 선택되었습니다.`
}

// // WeatherCard의 click-detail 이벤트 처리
// const handleClickDetail = (weather) => {
//   window.alert(
//     `${weather.name}의 현재 날씨는 ` +
//     `[${weather.status}] 상태이며, ` +
//     `현재 기온은 ${weather.temp}℃입니다.`,
//   )
// }
// const handleClickDetail = (weather) => {
//   window.alert(
//     `${weather.name}의 현재 날씨는 ` +
//       `[${weather.status}] 상태이며, ` +
//       `현재 기온은 ${weather.temp}℃입니다.`,
//   )
// }

const router = useRouter()
const configStore = useConfigStore()

const handleClickDetail = (weather) => {
  router.push('/weather/' + weather.id)
}



// 상태바 문구 변경 감시
watch(
  selectedCityInfo,
  (newValue, oldValue) => {
    console.log('✅ [watch / 카드 선택]', {
      이전상태: oldValue,
      현재상태: newValue,
    })
  },
)

// API 데이터 수신 감시
watch(
  weatherList,
  (newList, oldList) => {
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
  },
)

// API 로딩 상태 감시
watch(
  loading,
  (isLoading) => {
    console.log(
      `⏳ [watch / API 로딩] ${
        isLoading ? '요청 시작' : '요청 완료'
      }`,
    )
  },
)

// 섭씨·화씨 단위 변경 감시
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

// 검색어와 필터링 결과 자동 감시
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
    
    <!-- 검색 영역 -->
    <BaseDashboardCard title="🔍 도시 검색">
      <!-- [props] 부모의 반응형 검색어를 SearchBar의 query prop으로 전달 -->
      <!-- [emits] SearchBar의 update-query 이벤트를 받아 부모 데이터 변경 -->
      <SearchBar
        :query="searchQuery"
        @update-query="handleUpdateQuery"
      />
    </BaseDashboardCard>

    <!-- 날씨 목록 영역 -->
    <BaseDashboardCard title="🏙️ 지역별 날씨 현황">
      <p
        v-if="loading"
        class="loading-message"
      >
        날씨 정보를 불러오는 중입니다.
      </p>

      <p
        v-else-if="errorMessage"
        class="error-message"
      >
        {{ errorMessage }}
      </p>

      <!-- 검색 결과가 있을 때 -->
      <div
        v-else-if="filteredWeatherList.length > 0"
        class="weather-list"
      >
        <WeatherCard
          v-for="item in filteredWeatherList"
          :key="item.id"
          :weather="item"
          @select-card="handleSelectCard"
          @click-detail="handleClickDetail"
        />
      </div>

      <!-- 검색 결과가 없을 때 -->
      <p
        v-else
        class="empty-message"
      >
        검색 결과와 일치하는 도시가 없습니다.
      </p>

      <!-- 부모가 관리하는 selectedCityInfo를 BaseDashboardCard의 slot에 주입 -->
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

.dashboard-wrapper > h1 {
  margin: 4px 0 2px;
  color: #263238;
  font-size: 28px;
  line-height: 1.3;
  letter-spacing: -0.03em;
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

.weather-list :deep(.very_hot),
.weather-list :deep(.badge_hot) {
  color: #a12b2b;
  background-color: #fff0f0;
}

.weather-list :deep(.badge_warm),
.weather-list :deep(.badge_mild) {
  color: #8a5a12;
  background-color: #fff7e6;
}

.weather-list :deep(.badge_cool),
.weather-list :deep(.very_cold),
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

  .dashboard-wrapper > h1 {
    font-size: 23px;
  }

  .dashboard-wrapper > :deep(.dashboard-card) {
    padding: 16px;
  }

  .weather-list :deep(.weather-card) {
    gap: 12px;
  }
}
</style>
