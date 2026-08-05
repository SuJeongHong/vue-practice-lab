<script setup>
import { computed, onBeforeUnmount, ref, watch } from 'vue'

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
  suggestionErrorMessage: {
    type: String,
    default: '',
  },
  label: {
    type: String,
    default: '지역 또는 도시',
  },
  placeholder: {
    type: String,
    default: '예: 서울, 제주, Seoul',
  },
  submitText: {
    type: String,
    default: '날씨 검색',
  },
  inputId: {
    type: String,
    default: 'location-search',
  },
  selectionRequired: {
    type: Boolean,
    default: false,
  },
  embedded: {
    type: Boolean,
    default: false,
  },
})

const emit = defineEmits(['search', 'request-suggestions', 'clear-suggestions'])

const inputValue = ref('')
const validationMessage = ref('')
const isSuggestionOpen = ref(false)
const isDebouncing = ref(false)
const hasSuggestionResult = ref(false)
let debounceTimer = null
let ignoreNextInputChange = false

const suggestionPanelId = computed(() => `${props.inputId}-suggestions`)
const isSubmitLoading = computed(() => props.loading || (props.selectionRequired && props.suggestionLoading))

// 진행 중인 자동완성 예약을 취소해 이전 입력의 요청이 실행되지 않도록 합니다.
const clearDebounceTimer = () => {
  if (debounceTimer === null) {
    return
  }

  window.clearTimeout(debounceTimer)
  debounceTimer = null
}

// 자동완성 패널과 관련 상태를 초기화하고 부모의 후보 데이터도 비웁니다.
const closeSuggestions = () => {
  clearDebounceTimer()
  isSuggestionOpen.value = false
  isDebouncing.value = false
  hasSuggestionResult.value = false
  emit('clear-suggestions')
}

// 공백을 제외한 검색어가 1글자 이상이면 150ms 뒤 부모에 후보 조회를 요청합니다.
watch(inputValue, (query) => {
  validationMessage.value = ''

  if (ignoreNextInputChange) {
    ignoreNextInputChange = false
    return
  }

  clearDebounceTimer()
  emit('clear-suggestions')
  hasSuggestionResult.value = false

  const trimmedQuery = query.trim()

  if (trimmedQuery.length < 1) {
    isSuggestionOpen.value = false
    isDebouncing.value = false
    return
  }

  isSuggestionOpen.value = true
  isDebouncing.value = true

  debounceTimer = window.setTimeout(() => {
    debounceTimer = null
    isDebouncing.value = false
    hasSuggestionResult.value = true
    emit('request-suggestions', trimmedQuery)
  }, 150)
})

// URL에서 전달된 초기 지역명이 바뀌면 입력창도 같은 이름으로 맞춥니다.
watch(
  () => props.initialCity,
  (city) => {
    if (inputValue.value !== city) {
      ignoreNextInputChange = true
      inputValue.value = city
    }

    closeSuggestions()
  },
  { immediate: true },
)

// 일반 검색은 입력값을 전달하고 선택이 필수인 화면은 후보 검색만 즉시 실행합니다.
const submitSearch = () => {
  const cityName = inputValue.value.trim()

  if (!cityName) {
    validationMessage.value = '검색할 지역 또는 도시를 입력해 주세요.'
    return
  }

  validationMessage.value = ''

  if (inputValue.value !== cityName) {
    ignoreNextInputChange = true
    inputValue.value = cityName
  }

  if (props.selectionRequired) {
    clearDebounceTimer()
    emit('clear-suggestions')
    isSuggestionOpen.value = true
    isDebouncing.value = false
    hasSuggestionResult.value = true
    emit('request-suggestions', cityName)
    return
  }

  closeSuggestions()
  emit('search', { name: cityName })
}

// 자동완성 후보를 선택하면 이름과 좌표를 함께 부모에 전달합니다.
const selectSuggestion = (location) => {
  if (inputValue.value !== location.name) {
    ignoreNextInputChange = true
    inputValue.value = location.name
  }

  validationMessage.value = ''
  closeSuggestions()
  emit('search', location)
}

const getSuggestionArea = (location) => [location.state || location.admin1, location.country].filter(Boolean).join(', ')

// 입력창에 다시 초점을 맞추면 진행했거나 완료한 자동완성 패널을 다시 엽니다.
const handleFocus = () => {
  if (inputValue.value.trim().length >= 1 && (isDebouncing.value || props.suggestionLoading || hasSuggestionResult.value || props.suggestions.length > 0)) {
    isSuggestionOpen.value = true
  }
}

// 한글 조합 중인 값도 v-model에 반영해 완성된 글자부터 검색할 수 있게 합니다.
const handleComposingInput = (event) => {
  if (!event.isComposing) {
    return
  }

  const composingValue = event.target.value

  if (inputValue.value !== composingValue) {
    inputValue.value = composingValue
  }
}

onBeforeUnmount(() => {
  closeSuggestions()
})
</script>

<template>
  <form class="location-search-form" :class="{ 'location-search-form--embedded': embedded }" @submit.prevent="submitSearch">
    <label :for="inputId">{{ label }}</label>

    <div class="search-controls">
      <div class="input-wrapper">
        <input
          :id="inputId"
          v-model="inputValue"
          type="search"
          :placeholder="placeholder"
          autocomplete="off"
          :disabled="loading"
          :aria-expanded="isSuggestionOpen"
          :aria-controls="suggestionPanelId"
          @input="handleComposingInput"
          @focus="handleFocus"
          @blur="isSuggestionOpen = false"
          @keydown.esc="isSuggestionOpen = false"
        />

        <div v-if="isSuggestionOpen" :id="suggestionPanelId" class="suggestion-panel">
          <p v-if="isDebouncing || suggestionLoading" class="suggestion-status" role="status">연관 지역을 찾는 중입니다.</p>

          <p v-else-if="suggestionErrorMessage" class="suggestion-status suggestion-error" role="alert">
            {{ suggestionErrorMessage }}
          </p>

          <ul v-else-if="suggestions.length > 0" class="suggestion-list" role="listbox">
            <li v-for="location in suggestions" :key="location.id">
              <button type="button" class="suggestion-item" role="option" @mousedown.prevent="selectSuggestion(location)">
                <strong>{{ location.name }}</strong>
                <small>{{ getSuggestionArea(location) }}</small>
              </button>
            </li>
          </ul>

          <p v-else-if="hasSuggestionResult" class="suggestion-status">검색 결과가 없습니다.</p>
        </div>
      </div>

      <button type="submit" class="search-button" :disabled="isSubmitLoading">
        {{ isSubmitLoading ? '검색 중...' : submitText }}
      </button>
    </div>

    <p v-if="validationMessage" class="validation-message" role="alert">
      {{ validationMessage }}
    </p>
  </form>
</template>

<style scoped>
.location-search-form {
  padding: 20px;
  background-color: #ffffff;
  border: 1px solid #e0e8ec;
  border-radius: 12px;
  box-shadow: 0 4px 14px rgba(39, 55, 64, 0.06);
}

.location-search-form--embedded {
  padding: 0;
  border: 0;
  border-radius: 0;
  box-shadow: none;
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

.suggestion-panel {
  position: absolute;
  z-index: 20;
  top: calc(100% + 6px);
  right: 0;
  left: 0;
  overflow: hidden;
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

.suggestion-item {
  display: flex;
  width: 100%;
  align-items: center;
  justify-content: space-between;
  gap: 16px;
  padding: 10px;
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

.suggestion-item small {
  color: #78909c;
  font-size: 12px;
  text-align: right;
}

.suggestion-status {
  margin: 0;
  padding: 10px;
  color: #78909c;
  font-size: 12px;
}

.suggestion-error {
  color: #b33a3a;
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
