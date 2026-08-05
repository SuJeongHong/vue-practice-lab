<script setup>
defineProps({
  cities: {
    type: Array,
    default: () => [],
  },
  selectedCity: {
    type: String,
    default: '',
  },
})

const emit = defineEmits(['select-city'])
const mapImageUrl = `${import.meta.env.BASE_URL}images/korea-weather-map.png`

const cityPositions = {
  서울: { x: '39%', y: '20%' },
  인천: { x: '25%', y: '24%' },
  수원: { x: '33%', y: '32%' },
  춘천: { x: '55%', y: '18%' },
  강릉: { x: '76%', y: '27%' },
  대전: { x: '49%', y: '49%' },
  전주: { x: '35%', y: '58%' },
  대구: { x: '66%', y: '59%' },
  광주: { x: '34%', y: '69%' },
  울산: { x: '78%', y: '66%' },
  부산: { x: '68%', y: '77%' },
  제주: { x: '29%', y: '94%' },
}

const getCityPosition = (cityName) => ({
  '--city-x': cityPositions[cityName]?.x ?? '50%',
  '--city-y': cityPositions[cityName]?.y ?? '50%',
})
</script>

<template>
  <section class="map-card" aria-labelledby="korea-map-title">
    <header class="map-header">
      <div>
        <p>MAP WEATHER</p>
        <h2 id="korea-map-title">대한민국 날씨</h2>
      </div>

      <button type="button" :class="{ active: !selectedCity }" @click="emit('select-city', '')">전체 보기</button>
    </header>

    <div class="map-stage" role="group" aria-label="대한민국 주요 도시 날씨 지도">
      <img :src="mapImageUrl" alt="대한민국 지형 지도" />

      <button
        v-for="city in cities"
        :key="city.id"
        type="button"
        class="city-marker"
        :class="{ active: selectedCity === city.name }"
        :style="getCityPosition(city.name)"
        :aria-label="`${city.name}, ${city.condition}, ${Math.round(city.temp)}도 선택`"
        @click="emit('select-city', city.name)"
      >
        <span aria-hidden="true">{{ city.conditionIcon }}</span>
        <strong>{{ city.name }}</strong>
        <small>{{ Math.round(city.temp) }}°</small>
      </button>
    </div>

    <p class="map-guide">지도 마커를 누르면 오른쪽 목록에서 해당 도시만 확인할 수 있어요.</p>
  </section>
</template>

<style scoped>
.map-card {
  box-sizing: border-box;
  height: 100%;
  padding: 18px;
  background: #ffffff;
  border: 1px solid #e2e8ec;
  border-radius: 12px;
  box-shadow: 0 4px 14px rgba(39, 55, 64, 0.06);
}

.map-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 14px;
  padding-bottom: 12px;
  border-bottom: 1px solid #edf1f3;
}

.map-header p {
  margin: 0 0 3px;
  color: #3d7d94;
  font-size: 9px;
  font-weight: 800;
  letter-spacing: 0.14em;
}

.map-header h2 {
  margin: 0;
  color: #37474f;
  font-size: 18px;
}

.map-header button {
  padding: 7px 10px;
  color: #52717d;
  font-size: 11px;
  font-weight: 800;
  background: #f1f6f8;
  border: 1px solid #d5e3e8;
  border-radius: 999px;
  cursor: pointer;
}

.map-header button.active {
  color: #ffffff;
  background: #3f8099;
  border-color: #3f8099;
}

.map-stage {
  position: relative;
  width: 100%;
  aspect-ratio: 4 / 5;
  margin-top: 14px;
  overflow: hidden;
  background: #73d1e1;
  border-radius: 12px;
}

.map-stage img {
  display: block;
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.city-marker {
  position: absolute;
  top: var(--city-y);
  left: var(--city-x);
  display: grid;
  grid-template-columns: auto auto;
  gap: 1px 4px;
  align-items: center;
  min-width: 58px;
  padding: 4px 6px;
  color: #315461;
  background: rgba(255, 255, 255, 0.94);
  border: 1px solid rgba(84, 140, 160, 0.58);
  border-radius: 9px;
  box-shadow: 0 4px 10px rgba(35, 82, 99, 0.18);
  cursor: pointer;
  transform: translate(-50%, -50%);
  transition:
    box-shadow 0.2s ease,
    transform 0.2s ease;
}

.city-marker > span {
  grid-row: 1 / 3;
  font-size: 15px;
}

.city-marker strong {
  font-size: 10px;
  line-height: 1;
}

.city-marker small {
  font-size: 9px;
  line-height: 1;
  opacity: 0.76;
}

.city-marker:hover,
.city-marker:focus-visible,
.city-marker.active {
  z-index: 2;
  color: #ffffff;
  background: #3f8099;
  outline: none;
  box-shadow: 0 6px 14px rgba(27, 92, 117, 0.3);
  transform: translate(-50%, -50%) scale(1.08);
}

.map-guide {
  margin: 11px 0 0;
  color: #718790;
  font-size: 11px;
  line-height: 1.45;
}

@media (max-width: 760px) {
  .map-stage {
    max-width: 430px;
    margin-right: auto;
    margin-left: auto;
  }
}
</style>
