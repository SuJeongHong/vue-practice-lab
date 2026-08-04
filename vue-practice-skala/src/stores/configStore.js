import {ref, computed} from 'vue'
import {defineStore} from 'pinia'

export const useConfigStore = defineStore('config', ()=> {
    // 온도 단위 설정
    const unit = ref('celsius')
    // 단위 기호 계산
    const unitSymbol = computed(()=>{
        return unit.value === 'celsius' ? '°C' : '°F'
    })
    // 단위 토글 함수(스위칭))
    function toggleUnit() {
        unit.value = unit.value === 'celsius' ? 'fahrenheit' : 'celsius'
    }

    return { unit, unitSymbol, toggleUnit }

})