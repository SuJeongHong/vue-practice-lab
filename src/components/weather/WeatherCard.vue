<script setup>
import { computed } from 'vue'
import { useConfigStore } from '@/stores/configStore'

const props = defineProps({
  weather: {
    type: Object,
    required: true,
  },
})

const emit = defineEmits(['select-card', 'click-detail'])
const configStore = useConfigStore()

// 원본 섭씨 온도를 전역 설정에 맞는 표시 온도로 변환합니다.
const displayTemp = computed(() => {
  const temp = props.weather.temp

  if (configStore.unit === 'fahrenheit') {
    return Math.round((temp * 9) / 5 + 32)
  }

  return temp
})

// 현재 온도 구간에 맞는 안내 문구와 배지 색상 클래스를 결정합니다.
const temperatureBadge = computed(() => {
  const temperature = props.weather.temp

  if (temperature >= 35) {
    return { label: '🥵 폭염', className: 'very-hot' }
  }

  if (temperature >= 30) {
    return { label: '🔥 매우 더움', className: 'hot' }
  }

  if (temperature >= 25) {
    return { label: '☀️ 더움', className: 'warm' }
  }

  if (temperature >= 20) {
    return { label: '🙂 따뜻함', className: 'mild' }
  }

  if (temperature >= 10) {
    return { label: '🍃 선선함', className: 'cool' }
  }

  if (temperature >= 0) {
    return { label: '🥶 추움', className: 'cold' }
  }

  return { label: '❄️ 한파 (0도 미만)', className: 'freezing' }
})

// 카드와 상세보기 버튼의 사용자 동작을 각각 부모 컴포넌트에 전달합니다.
const selectCard = () => {
  emit('select-card', props.weather)
}

const clickDetail = () => {
  emit('click-detail', props.weather)
}
</script>

<template>
  <div class="weather-card" @click="selectCard">
    <div class="weather-information">
      <h4>
        {{ weather.name }}
      </h4>
      <p class="weather-condition">
        {{ weather.conditionIcon }}
        {{ weather.condition }}
      </p>

      <p>현재 기온: {{ displayTemp }}{{ configStore.unitSymbol }}</p>

      <el-tag effect="light" round :class="['temperature-badge', temperatureBadge.className]">
        {{ temperatureBadge.label }}
      </el-tag>
    </div>

    <el-button class="btn-detail" plain @click.stop="clickDetail">상세보기</el-button>
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
  height: auto;
  padding: 5px 8px;
  color: white;
  font-size: 13px;
  line-height: 1.2;
  border: 0;
  border-radius: 8px;
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
