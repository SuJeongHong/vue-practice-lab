<script setup>
import { computed } from 'vue'

import { useConfigStore } from '@/stores/configStore'

const props = defineProps({
  weather: {
    type: Object,
    required: true,
  },
})

const emit = defineEmits([
  'remove',
])

const configStore = useConfigStore()

const convertTemperature = (temperature) => {
  if (configStore.unit === 'fahrenheit') {
    return Math.round((temperature * 9) / 5 + 32)
  }

  return Math.round(temperature)
}

const displayTemp = computed(() =>
  convertTemperature(props.weather.temp),
)

const displayFeelsLike = computed(() =>
  convertTemperature(props.weather.feelsLike),
)

const iconUrl = computed(() => {
  if (!props.weather.icon) {
    return ''
  }

  return `https://openweathermap.org/img/wn/${props.weather.icon}@2x.png`
})

const formattedSearchTime = computed(() => {
  const searchedAt = new Date(props.weather.searchedAt)

  if (Number.isNaN(searchedAt.getTime())) {
    return '검색 시간 없음'
  }

  return new Intl.DateTimeFormat('ko-KR', {
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
  }).format(searchedAt)
})

const removeResult = () => {
  emit('remove', props.weather.id)
}
</script>

<template>
  <article class="result-card">
    <header class="result-header">
      <div>
        <p class="country-label">
          {{ weather.country || '국가 정보 없음' }}
        </p>
        <h2>{{ weather.name }}</h2>
      </div>

      <button
        type="button"
        class="remove-button"
        :aria-label="`${weather.name} 검색 결과 삭제`"
        @click="removeResult"
      >
        삭제
      </button>
    </header>

    <div class="weather-summary">
      <img
        v-if="iconUrl"
        :src="iconUrl"
        :alt="weather.description"
      >

      <div>
        <strong class="current-temp">
          {{ displayTemp }}{{ configStore.unitSymbol }}
        </strong>
        <p>{{ weather.description }}</p>
      </div>
    </div>

    <dl class="weather-details">
      <div>
        <dt>체감온도</dt>
        <dd>
          {{ displayFeelsLike }}{{ configStore.unitSymbol }}
        </dd>
      </div>

      <div>
        <dt>습도</dt>
        <dd>{{ weather.humidity }}%</dd>
      </div>
    </dl>

    <footer>
      검색 시간 {{ formattedSearchTime }}
    </footer>
  </article>
</template>

<style scoped>
.result-card {
  display: flex;
  min-width: 0;
  flex-direction: column;
  padding: 18px;
  background-color: #ffffff;
  border: 1px solid #e0e8ec;
  border-radius: 12px;
  box-shadow: 0 4px 14px rgba(39, 55, 64, 0.06);
}

.result-header {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  gap: 12px;
}

.country-label {
  margin: 0 0 3px;
  color: #78909c;
  font-size: 12px;
  font-weight: 700;
}

h2 {
  margin: 0;
  color: #263238;
  font-size: 21px;
}

.remove-button {
  padding: 6px 9px;
  color: #a23c3c;
  font-size: 12px;
  font-weight: 700;
  background-color: #fff7f7;
  border: 1px solid #ebcaca;
  border-radius: 6px;
  cursor: pointer;
}

.remove-button:hover {
  color: #ffffff;
  background-color: #b54848;
  border-color: #b54848;
}

.weather-summary {
  display: flex;
  align-items: center;
  gap: 10px;
  margin: 14px 0;
}

.weather-summary img {
  width: 70px;
  height: 70px;
  object-fit: contain;
  background-color: #f1f7f9;
  border-radius: 50%;
}

.current-temp {
  color: #263238;
  font-size: 32px;
  line-height: 1;
}

.weather-summary p {
  margin: 6px 0 0;
  color: #607d8b;
  font-size: 14px;
}

.weather-details {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 8px;
  margin: 0;
}

.weather-details > div {
  padding: 11px;
  background-color: #f6f9fa;
  border-radius: 8px;
}

dt {
  color: #78909c;
  font-size: 12px;
}

dd {
  margin: 4px 0 0;
  color: #37474f;
  font-size: 15px;
  font-weight: 800;
}

footer {
  margin-top: auto;
  padding-top: 14px;
  color: #90a4ae;
  font-size: 11px;
  text-align: right;
}
</style>
