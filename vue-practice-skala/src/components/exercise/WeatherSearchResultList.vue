<script setup>
import WeatherSearchResultCard from './WeatherSearchResultCard.vue'

defineProps({
  results: {
    type: Array,
    required: true,
  },
  resultCount: {
    type: Number,
    required: true,
  },
})

const emit = defineEmits(['remove', 'clear'])
</script>

<template>
  <section class="result-section">
    <!-- 결과 목록을 렌더링하고 개별 삭제와 전체 삭제 동작을 부모에 전달합니다. -->
    <header class="list-header">
      <div>
        <h2>검색 결과</h2>
        <p>저장된 도시 {{ resultCount }}개</p>
      </div>

      <button v-if="results.length > 0" type="button" @click="emit('clear')">전체 삭제</button>
    </header>

    <div v-if="results.length > 0" class="result-grid">
      <WeatherSearchResultCard
        v-for="weather in results"
        :key="weather.id"
        :weather="weather"
        @remove="emit('remove', $event)"
      />
    </div>

    <p v-else class="empty-message">검색한 도시가 없습니다</p>
  </section>
</template>

<style scoped>
.result-section {
  margin-top: 22px;
}

.list-header {
  display: flex;
  align-items: flex-end;
  justify-content: space-between;
  gap: 16px;
  margin-bottom: 12px;
}

h2 {
  margin: 0;
  color: #263238;
  font-size: 20px;
}

.list-header p {
  margin: 4px 0 0;
  color: #78909c;
  font-size: 13px;
}

.list-header button {
  padding: 7px 10px;
  color: #8f4141;
  font-weight: 700;
  background-color: #ffffff;
  border: 1px solid #dfcaca;
  border-radius: 7px;
  cursor: pointer;
}

.list-header button:hover {
  color: #ffffff;
  background-color: #a84b4b;
  border-color: #a84b4b;
}

.result-grid {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 12px;
}

.empty-message {
  padding: 40px 20px;
  color: #78909c;
  text-align: center;
  background-color: #ffffff;
  border: 1px dashed #cbd8dd;
  border-radius: 12px;
}

@media (max-width: 700px) {
  .result-grid {
    grid-template-columns: 1fr;
  }
}
</style>
