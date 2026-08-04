<script setup>
import {computed} from 'vue'
import { useConfigStore } from '@/stores/configStore'


const configStore = useConfigStore()

const displayTemp = computed(() => {
  const temp = props.weather.temp

  if (configStore.unit === 'fahrenheit') {
    return Math.round((temp * 9) / 5 + 32)
  }

  return temp
})

const props = defineProps({
  weather: {
    type: Object,
    required: true,
  },
})

const emit = defineEmits([
  'select-card',
  'click-detail',
])

const selectCard = () => {
  emit(
    'select-card',
    props.weather,
  )
}

const clickDetail = () => {
  emit(
    'click-detail',
    props.weather,
  )
}
</script>

<template>
  <div
    class="weather-card"
    @click="selectCard"
  >
    <div class="weather-information">
      <h4>
        {{ weather.name }}
      </h4>
      <p class="weather-condition">
        {{ weather.conditionIcon }}
        {{ weather.condition }}
      </p>

      <p>
        현재 기온: {{ displayTemp }}{{ configStore.unitSymbol }}
      </p>

      <span v-if="weather.temp >= 35" class="very_hot">🥵 폭염 </span>
      <span v-else-if="weather.temp >= 30" class="badge_hot">🔥 매우 더움</span>
      <span v-else-if="weather.temp >= 25" class="badge_warm">☀️ 더움 </span>
      <span v-else-if="weather.temp >= 20" class="badge_mild">🙂 따뜻함 </span>
      <span v-else-if="weather.temp >= 10" class="badge_cool">🍃 선선함 </span>
      <span v-else-if="weather.temp >= 0" class="very_cold">🥶 추움 </span>
      <span v-else class="freezing">❄️ 한파 (0도 미만)</span>
    </div>

    <button
      class="btn-detail"
      @click.stop="clickDetail"
    >
      상세보기
    </button>
  </div>
</template>

<style scoped>
.weather-card {
  display: flex;
  justify-content: space-between;
  align-items: center;

  padding: 15px;
  background-color: white;
  border: 1px solid #dddddd;
  border-radius: 12px;
  cursor: pointer;
}

.weather-card:hover {
  background-color: #f8f9fa;
}

.temperature-badge {
  display: inline-block;
  padding: 5px 8px;
  color: white;
  border-radius: 8px;
  font-size: 13px;
}

.very-hot {
  background-color: #b71c1c;
}

.hot {
  background-color: #e53935;
}

.warm {
  background-color: #ff9800;
}

.mild {
  background-color: #66bb6a;
}

.cool {
  background-color: #42a5f5;
}

.cold {
  background-color: #5c6bc0;
}

.freezing {
  background-color: #28349314;
}

.btn-detail {
  padding: 8px 12px;
  cursor: pointer;
}
</style>
