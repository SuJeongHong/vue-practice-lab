import { computed, ref } from 'vue'
import { defineStore } from 'pinia'

export const useConfigStore = defineStore('config', () => {
  const unit = ref('celsius')

  // 선택된 온도 단위에 맞는 기호를 모든 날씨 화면에 제공합니다.
  const unitSymbol = computed(() => (unit.value === 'celsius' ? '°C' : '°F'))

  return { unit, unitSymbol }
})
