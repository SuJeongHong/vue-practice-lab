<script setup>
import { computed } from 'vue'

import { useWeatherExplorer } from '@/composables/useWeatherExplorer'

const props = defineProps({
  weatherList: {
    type: Array,
    default: () => [],
  },
  loading: {
    type: Boolean,
    default: false,
  },
})

const emit = defineEmits(['select-city'])
const weatherSource = computed(() => props.weatherList)
const { conditions, query, resetExplorer, results, selectedCondition, sortOrder } = useWeatherExplorer(weatherSource)

const selectCity = (weather) => {
  emit('select-city', weather)
}
</script>

<template>
  <section class="weather-explorer" aria-labelledby="weather-explorer-title">
    <div class="explorer-heading">
      <div>
        <p class="eyebrow">SMART CITY EXPLORER</p>
        <h3 id="weather-explorer-title">날씨로 도시 빠르게 찾기</h3>
        <p>이미 불러온 데이터에서 검색하므로 추가 API 요청 없이 바로 결과를 보여 줍니다.</p>
      </div>

      <span class="result-count">{{ results.length }}개 도시</span>
    </div>

    <div class="explorer-controls">
      <label class="search-control">
        <span>도시 또는 날씨 검색</span>
        <input v-model="query" type="search" placeholder="예: 서울, 맑음, 구름" :disabled="loading" />
      </label>

      <label class="sort-control">
        <span>정렬</span>
        <select v-model="sortOrder" :disabled="loading">
          <option value="temperature-desc">기온 높은 순</option>
          <option value="temperature-asc">기온 낮은 순</option>
          <option value="name">도시 이름 순</option>
        </select>
      </label>
    </div>

    <div v-if="conditions.length > 0" class="condition-filters" aria-label="날씨 상태 필터">
      <button type="button" :class="{ active: selectedCondition === 'all' }" @click="selectedCondition = 'all'">전체</button>
      <button v-for="condition in conditions" :key="condition" type="button" :class="{ active: selectedCondition === condition }" @click="selectedCondition = condition">
        {{ condition }}
      </button>
    </div>

    <p v-if="loading" class="explorer-status">도시 날씨 데이터를 준비하고 있습니다.</p>

    <div v-else-if="results.length > 0" class="explorer-results">
      <button v-for="weather in results" :key="weather.id" type="button" class="city-result" @click="selectCity(weather)">
        <span class="condition-icon" aria-hidden="true">{{ weather.conditionIcon }}</span>
        <span class="city-summary">
          <strong>{{ weather.name }}</strong>
          <small>{{ weather.condition }}</small>
        </span>
        <span class="temperature">{{ Math.round(weather.temp) }}°C</span>
        <span class="select-label">기존 카드로 보기</span>
      </button>
    </div>

    <div v-else class="empty-result">
      <p>조건에 맞는 도시가 없습니다.</p>
      <button type="button" @click="resetExplorer">검색 조건 초기화</button>
    </div>
  </section>
</template>

<style scoped>
.weather-explorer {
  padding: 24px;
  background: linear-gradient(145deg, #f5fbfd, #ffffff);
  border: 1px solid #d7e7ed;
  border-radius: 16px;
  box-shadow: 0 8px 24px rgba(46, 83, 98, 0.06);
}

.explorer-heading {
  display: flex;
  gap: 20px;
  justify-content: space-between;
  align-items: flex-start;
}

.eyebrow {
  margin: 0 0 5px;
  color: #3d758b;
  font-size: 10px;
  font-weight: 800;
  letter-spacing: 0.14em;
}

.explorer-heading h3 {
  margin: 0;
  color: #263f49;
  font-size: 20px;
}

.explorer-heading p:last-child {
  margin: 7px 0 0;
  color: #657b85;
  font-size: 13px;
}

.result-count {
  flex: 0 0 auto;
  padding: 6px 10px;
  color: #356f86;
  font-size: 12px;
  font-weight: 800;
  background: #e9f4f7;
  border-radius: 999px;
}

.explorer-controls {
  display: grid;
  grid-template-columns: 1fr 180px;
  gap: 10px;
  margin-top: 20px;
}

.explorer-controls label {
  display: flex;
  flex-direction: column;
  gap: 6px;
  color: #536b75;
  font-size: 12px;
  font-weight: 700;
}

.explorer-controls input,
.explorer-controls select {
  box-sizing: border-box;
  width: 100%;
  min-height: 42px;
  padding: 9px 12px;
  color: #263238;
  font: inherit;
  background: #ffffff;
  border: 1px solid #cbdce3;
  border-radius: 9px;
  outline: none;
}

.explorer-controls input:focus,
.explorer-controls select:focus {
  border-color: #4f8fa8;
  box-shadow: 0 0 0 3px rgba(79, 143, 168, 0.12);
}

.condition-filters {
  display: flex;
  gap: 7px;
  margin-top: 14px;
  padding-bottom: 2px;
  overflow-x: auto;
}

.condition-filters button,
.empty-result button {
  flex: 0 0 auto;
  padding: 7px 11px;
  color: #4d6873;
  font-size: 12px;
  font-weight: 700;
  background: #ffffff;
  border: 1px solid #d2e0e5;
  border-radius: 999px;
  cursor: pointer;
}

.condition-filters button.active {
  color: #ffffff;
  background: #447f96;
  border-color: #447f96;
}

.explorer-results {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 8px;
  max-height: 284px;
  margin-top: 16px;
  overflow-y: auto;
}

.city-result {
  display: grid;
  grid-template-columns: auto 1fr auto;
  gap: 10px;
  align-items: center;
  padding: 12px;
  text-align: left;
  background: #ffffff;
  border: 1px solid #e0e8ec;
  border-radius: 10px;
  cursor: pointer;
}

.city-result:hover {
  border-color: #8fb4c2;
  transform: translateY(-1px);
}

.condition-icon {
  font-size: 22px;
}

.city-summary {
  display: flex;
  flex-direction: column;
  min-width: 0;
}

.city-summary strong {
  color: #2b424c;
  font-size: 14px;
}

.city-summary small {
  margin-top: 2px;
  overflow: hidden;
  color: #71858e;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.temperature {
  color: #315f72;
  font-size: 16px;
  font-weight: 800;
}

.select-label {
  grid-column: 2 / -1;
  color: #4d8297;
  font-size: 11px;
  font-weight: 700;
}

.explorer-status,
.empty-result {
  margin: 16px 0 0;
  padding: 22px;
  color: #607780;
  text-align: center;
  background: rgba(255, 255, 255, 0.8);
  border-radius: 10px;
}

.empty-result p {
  margin: 0 0 10px;
}

@media (max-width: 640px) {
  .weather-explorer {
    padding: 20px 16px;
  }

  .explorer-heading,
  .explorer-controls {
    grid-template-columns: 1fr;
  }

  .explorer-heading {
    flex-direction: column;
    gap: 10px;
  }

  .explorer-results {
    grid-template-columns: 1fr;
  }
}
</style>
