<script setup>
defineProps({
  query: {
    type: String,
    default: '',
  },
})

const emit = defineEmits(['update-query'])

// 입력값이 바뀔 때 부모가 검색어 상태를 갱신하도록 새 값을 전달합니다.
const handleInput = (event) => {
  emit('update-query', event.target.value)
}
</script>

<template>
  <div class="search-area">
    <input type="text" :value="query" placeholder="검색할 도시 이름 입력" @input="handleInput" />

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
