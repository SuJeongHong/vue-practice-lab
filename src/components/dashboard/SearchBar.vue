<script setup>
defineProps({
  query: {
    type: String,
    default: '',
  },
  cities: {
    type: Array,
    default: () => [],
  },
})

const emit = defineEmits(['update-query'])

// 입력값이 바뀔 때 부모가 검색어 상태를 갱신하도록 새 값을 전달합니다.
const handleInput = (event) => {
  emit('update-query', event.target.value)
}

const clearQuery = () => {
  emit('update-query', '')
}
</script>

<template>
  <div class="search-area">
    <div class="search-intro">
      <div>
        <p class="eyebrow">KOREA WEATHER NOW</p>
        <p class="description">서울부터 제주까지, 대한민국 주요 도시의 현재 날씨를 검색하거나 지도에서 선택해 보세요.</p>
      </div>

      <span class="city-count">{{ cities.length || 12 }}개 도시</span>
    </div>

    <label class="search-label" for="korea-city-search">도시 이름으로 찾기</label>
    <div class="search-input-wrapper">
      <span class="search-icon" aria-hidden="true">⌕</span>
      <input id="korea-city-search" type="search" :value="query" placeholder="예: 서울, 부산, 제주" autocomplete="off" @input="handleInput" />
      <button v-if="query" type="button" class="clear-button" aria-label="도시 검색어 지우기" @click="clearQuery">지우기</button>
    </div>

    <p class="search-status" aria-live="polite">
      <template v-if="query"><strong>{{ query }}</strong> 날씨를 표시하고 있어요.</template>
      <template v-else>지도와 목록에 주요 도시 전체를 표시하고 있어요.</template>
    </p>
  </div>
</template>

<style scoped>
.search-area {
  display: flex;
  flex-direction: column;
  gap: 11px;
}

.search-intro {
  display: flex;
  gap: 20px;
  align-items: flex-start;
  justify-content: space-between;
}

.eyebrow {
  margin: 0 0 4px;
  color: #39778f;
  font-size: 10px;
  font-weight: 800;
  letter-spacing: 0.14em;
}

.description {
  margin: 0;
  color: #607780;
  font-size: 13px;
  line-height: 1.5;
}

.city-count {
  flex: 0 0 auto;
  padding: 6px 10px;
  color: #356f86;
  font-size: 11px;
  font-weight: 800;
  background: #eaf5f8;
  border-radius: 999px;
}

.search-label {
  color: #425e69;
  font-size: 12px;
  font-weight: 800;
}

.search-input-wrapper {
  position: relative;
  display: flex;
  align-items: center;
}

.search-icon {
  position: absolute;
  left: 13px;
  color: #5d8798;
  font-size: 21px;
  pointer-events: none;
}

.search-input-wrapper input {
  box-sizing: border-box;
  width: 100%;
  min-height: 46px;
  padding: 11px 72px 11px 42px;
  color: #263238;
  font-size: 15px;
  background: #f8fbfc;
  border: 1px solid #cbdde4;
  border-radius: 11px;
  outline: none;
  transition:
    background-color 0.2s ease,
    border-color 0.2s ease,
    box-shadow 0.2s ease;
}

.search-input-wrapper input:focus {
  background: #ffffff;
  border-color: #4f91aa;
  box-shadow: 0 0 0 3px rgba(79, 145, 170, 0.13);
}

.clear-button {
  position: absolute;
  right: 9px;
  padding: 6px 9px;
  color: #607d88;
  font-size: 11px;
  font-weight: 700;
  background: #eaf1f4;
  border: 0;
  border-radius: 7px;
  cursor: pointer;
}

.search-status {
  min-height: 18px;
  margin: 0;
  color: #78909c;
  font-size: 12px;
}

.search-status strong {
  color: #356f86;
}

@media (max-width: 520px) {
  .search-intro {
    gap: 10px;
  }

  .description {
    font-size: 12px;
  }
}
</style>
