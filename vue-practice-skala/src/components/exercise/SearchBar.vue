<script setup>
// [props] 부모(WeatherParent)로부터 검색도시 반응형 데이터(searchQuery)를 전달받음
defineProps({
  query: {
    type: String,
    default: '',
  },
})

// [emits] 검색어가 변경되었음을 부모에게 알리기 위한 update-query 이벤트 선언
const emit = defineEmits([
  'update-query',
])

const handleInput = (event) => {
  // [emits] 입력된 검색어를 update-query 이벤트와 함께 부모에게 전달
  emit(
    'update-query',
    event.target.value,
  )
}
</script>

<template>
  <div class="search-area">
    <!-- [props] 부모로부터 전달받은 query 값을 검색창에 표시 -->
    <input
      type="text"
      :value="query"
      placeholder="검색할 도시 이름 입력"
      @input="handleInput"
    />

    <p>
      검색 중인 도시:
      <strong>{{ query }}</strong>
    </p>
  </div>
</template>

<style scoped>
.search-area {
  display: flex;
  flex-direction: column;
  gap: 10px;
}

input {
  padding: 10px;
  border: 1px solid #aaaaaa;
  border-radius: 6px;
  font-size: 16px;
}
</style>
