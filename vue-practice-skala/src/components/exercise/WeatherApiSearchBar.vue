<script setup>
import { ref, watch } from 'vue'

const props = defineProps({
  initialCity: {
    type: String,
    default: '',
  },
  loading: {
    type: Boolean,
    default: false,
  },
  suggestions: {
    type: Array,
    default: () => [],
  },
  suggestionLoading: {
    type: Boolean,
    default: false,
  },
})

const emit = defineEmits([
  'search',
  'query-change',
  'clear-suggestions',
])

const inputValue = ref('')
const validationMessage = ref('')
const isSuggestionOpen = ref(false)

watch(
  () => props.initialCity,
  (city) => {
    inputValue.value = city
    isSuggestionOpen.value = false
  },
  { immediate: true },
)

const submitSearch = () => {
  const cityName = inputValue.value.trim()

  if (!cityName) {
    validationMessage.value =
      '검색할 지역 또는 도시를 입력해 주세요.'
    return
  }

  validationMessage.value = ''
  inputValue.value = cityName
  isSuggestionOpen.value = false
  emit('clear-suggestions')
  emit('search', cityName)
}

const handleInput = () => {
  validationMessage.value = ''
  isSuggestionOpen.value = Boolean(inputValue.value.trim())
  emit('query-change', inputValue.value)
}

const handleFocus = () => {
  if (!inputValue.value.trim()) {
    return
  }

  isSuggestionOpen.value = true
  emit('query-change', inputValue.value)
}

const selectSuggestion = (city) => {
  inputValue.value = city.name
  validationMessage.value = ''
  isSuggestionOpen.value = false
  emit('clear-suggestions')
}

const formatSuggestionMeta = (city) =>
  [city.originalName, city.state, city.country]
    .filter(Boolean)
    .join(' · ')
</script>

<template>
  <form
    class="api-search-form"
    @submit.prevent="submitSearch"
  >
    <label for="weather-city-search">
      지역 또는 도시
    </label>

    <div class="search-controls">
      <div class="input-wrapper">
        <input
          id="weather-city-search"
          v-model="inputValue"
          type="search"
          placeholder="예: 서울, 제주, Seoul"
          autocomplete="off"
          :disabled="loading"
          :aria-expanded="isSuggestionOpen"
          aria-controls="weather-city-suggestions"
          @input="handleInput"
          @focus="handleFocus"
          @blur="isSuggestionOpen = false"
        >

        <div
          v-if="isSuggestionOpen && inputValue.trim()"
          id="weather-city-suggestions"
          class="suggestion-panel"
        >
          <p
            v-if="suggestionLoading"
            class="suggestion-status"
          >
            연관 도시를 찾는 중입니다.
          </p>

          <ul
            v-else-if="suggestions.length > 0"
            class="suggestion-list"
            role="listbox"
          >
            <li
              v-for="city in suggestions"
              :key="city.id"
            >
              <button
                type="button"
                class="suggestion-item"
                @mousedown.prevent="selectSuggestion(city)"
              >
                <span>{{ city.name }}</span>
                <small>{{ formatSuggestionMeta(city) }}</small>
              </button>
            </li>
          </ul>

          <p
            v-else
            class="suggestion-status"
          >
            API 검색 결과가 없습니다. 도시명을 더 입력해 주세요.
          </p>
        </div>
      </div>

      <button
        type="submit"
        class="search-button"
        :disabled="loading"
      >
        {{ loading ? '검색 중...' : '날씨 검색' }}
      </button>
    </div>

    <p
      v-if="validationMessage"
      class="validation-message"
      role="alert"
    >
      {{ validationMessage }}
    </p>
  </form>
</template>

<style scoped>
.api-search-form {
  padding: 20px;
  background-color: #ffffff;
  border: 1px solid #e0e8ec;
  border-radius: 12px;
  box-shadow: 0 4px 14px rgba(39, 55, 64, 0.06);
}

label {
  display: block;
  margin-bottom: 9px;
  color: #37474f;
  font-size: 14px;
  font-weight: 700;
}

.search-controls {
  display: flex;
  gap: 10px;
}

.input-wrapper {
  position: relative;
  min-width: 0;
  flex: 1;
}

input {
  box-sizing: border-box;
  width: 100%;
  padding: 12px 14px;
  color: #263238;
  font: inherit;
  background-color: #fafcfd;
  border: 1px solid #c9d5da;
  border-radius: 8px;
  outline: none;
}

input:focus {
  background-color: #ffffff;
  border-color: #3d7d96;
  box-shadow: 0 0 0 3px rgba(61, 125, 150, 0.12);
}

.search-button {
  padding: 0 18px;
  color: #ffffff;
  font-weight: 700;
  background-color: #3d758b;
  border: 0;
  border-radius: 8px;
  cursor: pointer;
}

.search-button:hover:not(:disabled) {
  background-color: #2f6276;
}

.search-button:disabled,
input:disabled {
  cursor: not-allowed;
  opacity: 0.65;
}

.suggestion-panel {
  position: absolute;
  z-index: 10;
  top: calc(100% + 6px);
  right: 0;
  left: 0;
  overflow: hidden;
  margin: 0;
  padding: 5px;
  background-color: #ffffff;
  border: 1px solid #d8e2e6;
  border-radius: 9px;
  box-shadow: 0 10px 24px rgba(39, 55, 64, 0.12);
}

.suggestion-list {
  margin: 0;
  padding: 0;
  list-style: none;
}

.suggestion-status {
  margin: 0;
  padding: 10px;
  color: #78909c;
  font-size: 12px;
}

.suggestion-item {
  display: flex;
  width: 100%;
  align-items: center;
  justify-content: space-between;
  padding: 9px 10px;
  color: #37474f;
  font: inherit;
  text-align: left;
  background-color: transparent;
  border: 0;
  border-radius: 6px;
  cursor: pointer;
}

.suggestion-item:hover {
  background-color: #edf5f8;
}

.suggestion-item span {
  font-weight: 700;
}

.suggestion-item small {
  color: #90a4ae;
  font-size: 12px;
}

.validation-message {
  margin: 9px 0 0;
  color: #b33a3a;
  font-size: 13px;
}

@media (max-width: 560px) {
  .search-controls {
    flex-direction: column;
  }

  .search-button {
    min-height: 43px;
  }
}
</style>
