import { computed, ref, unref } from 'vue'

const cityNameCollator = new Intl.Collator('ko-KR')

const normalizeSearchText = (value) =>
  String(value ?? '')
    .normalize('NFKC')
    .trim()
    .toLocaleLowerCase('ko-KR')

// 이미 조회한 날씨 목록을 검색용으로 한 번 가공해 입력할 때마다 같은 문자열 처리를 반복하지 않습니다.
export const useWeatherExplorer = (weatherSource) => {
  const query = ref('')
  const selectedCondition = ref('all')
  const sortOrder = ref('temperature-desc')

  const searchIndex = computed(() =>
    unref(weatherSource).map((weather) => ({
      weather,
      searchableText: normalizeSearchText(`${weather.name} ${weather.condition}`),
    })),
  )

  const conditions = computed(() => [...new Set(unref(weatherSource).map((weather) => weather.condition).filter(Boolean))].sort(cityNameCollator.compare))

  const results = computed(() => {
    const normalizedQuery = normalizeSearchText(query.value)
    const matches = searchIndex.value
      .filter(({ weather }) => selectedCondition.value === 'all' || weather.condition === selectedCondition.value)
      .filter(({ searchableText }) => !normalizedQuery || searchableText.includes(normalizedQuery))
      .map(({ weather }) => weather)

    return matches.sort((first, second) => {
      if (sortOrder.value === 'temperature-asc') {
        return first.temp - second.temp
      }

      if (sortOrder.value === 'name') {
        return cityNameCollator.compare(first.name, second.name)
      }

      return second.temp - first.temp
    })
  })

  const resetExplorer = () => {
    query.value = ''
    selectedCondition.value = 'all'
    sortOrder.value = 'temperature-desc'
  }

  return {
    conditions,
    query,
    resetExplorer,
    results,
    selectedCondition,
    sortOrder,
  }
}
