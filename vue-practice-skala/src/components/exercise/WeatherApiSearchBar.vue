<script setup>
import { onBeforeUnmount, ref, watch } from 'vue'
import { storeToRefs } from 'pinia'
import { useWeatherSearchStore } from '@/stores/weatherSearchStore'

const weatherSearchStore = useWeatherSearchStore()
const {
  citySuggestions,
  isSuggestionLoading,
  suggestionErrorMessage,
} = storeToRefs(weatherSearchStore)

const props = defineProps({
  initialCity: {
    type: String,
    default: '',
  },
  loading: {
    type: Boolean,
    default: false,
  },
})

const emit = defineEmits(['search'])

const inputValue = ref('')
const validationMessage = ref('')
const isSuggestionOpen = ref(false)
const isDebouncing = ref(false)
const hasSuggestionResult = ref(false)

let debounceTimer = null
let ignoreNextInputChange = false

const clearDebounceTimer = () => {
  if (debounceTimer === null) {
    return
  }

  window.clearTimeout(debounceTimer)
  debounceTimer = null
}

const closeSuggestions = () => {
  clearDebounceTimer()
  isSuggestionOpen.value = false
  isDebouncing.value = false
  hasSuggestionResult.value = false
  weatherSearchStore.clearCitySuggestions()
}

watch(inputValue, (query) => {
  validationMessage.value = ''

  if (ignoreNextInputChange) {
    ignoreNextInputChange = false
    return
  }

  clearDebounceTimer()
  weatherSearchStore.clearCitySuggestions()
  hasSuggestionResult.value = false

  const trimmedQuery = query.trim()

  if (trimmedQuery.length < 1) {
    isSuggestionOpen.value = false
    isDebouncing.value = false
    return
  }

  isSuggestionOpen.value = true
  isDebouncing.value = true

  debounceTimer = window.setTimeout(async () => {
    debounceTimer = null
    isDebouncing.value = false

    await weatherSearchStore.fetchCitySuggestions(trimmedQuery)

    if (inputValue.value.trim() === trimmedQuery) {
      hasSuggestionResult.value = true
    }
  }, 150)
})

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

const submitSearch = () => {
  const cityName = inputValue.value.trim()

  if (!cityName) {
    validationMessage.value =
      '검색할 지역 또는 도시를 입력해 주세요.'
    return
  }

  validationMessage.value = ''

  if (inputValue.value !== cityName) {
    ignoreNextInputChange = true
    inputValue.value = cityName
  }

  closeSuggestions()
  emit('search', { name: cityName })
}

const selectSuggestion = (city) => {
  if (inputValue.value !== city.name) {
    ignoreNextInputChange = true
    inputValue.value = city.name
  }

  validationMessage.value = ''
  closeSuggestions()
  emit('search', city)
}

const handleFocus = () => {
  if (
    inputValue.value.trim().length >= 1 &&
    (isDebouncing.value ||
      isSuggestionLoading.value ||
      hasSuggestionResult.value)
  ) {
    isSuggestionOpen.value = true
  }
}

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
          @input="handleComposingInput"
          @focus="handleFocus"
          @blur="isSuggestionOpen = false"
          @keydown.esc="isSuggestionOpen = false"
        >

        <div
          v-if="isSuggestionOpen"
          id="weather-city-suggestions"
          class="suggestion-panel"
        >
          <p
            v-if="isDebouncing || isSuggestionLoading"
            class="suggestion-status"
            role="status"
          >
            연관 도시를 찾는 중입니다.
          </p>

          <p
            v-else-if="suggestionErrorMessage"
            class="suggestion-status suggestion-error"
            role="alert"
          >
            {{ suggestionErrorMessage }}
          </p>

          <ul
            v-else-if="citySuggestions.length > 0"
            class="suggestion-list"
            role="listbox"
          >
            <li
              v-for="city in citySuggestions"
              :key="city.id"
            >
              <button
                type="button"
                class="suggestion-item"
                role="option"
                @mousedown.prevent="selectSuggestion(city)"
              >
                <strong>{{ city.name }}</strong>
                <small>
                  {{ [city.state, city.country].filter(Boolean).join(', ') }}
                </small>
              </button>
            </li>
          </ul>

          <p
            v-else-if="hasSuggestionResult"
            class="suggestion-status"
          >
            검색 결과가 없습니다.
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
