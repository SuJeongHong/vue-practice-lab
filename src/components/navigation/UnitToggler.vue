<script setup>
import { useConfigStore } from '@/stores/configStore'

// 스위치 값을 전역 Store에 직접 연결해 모든 화면의 온도 단위를 함께 바꿉니다.
const configStore = useConfigStore()
</script>

<template>
  <div class="unit-toggler">
    <el-switch v-model="configStore.unit" active-value="fahrenheit" inactive-value="celsius" active-text="화씨(℉)" inactive-text="섭씨(℃)" aria-label="온도 단위 변경" />
  </div>
</template>

<style scoped>
.unit-toggler {
  display: inline-flex;
  align-items: center;
  margin-left: auto;
  padding: 8px 10px;
  text-align: center;
  background: #f8fbfc;
  border: 1px solid #dce8ec;
  border-radius: 9px;
}

.unit-toggler :deep(.el-switch__label) {
  color: #718790;
  font-size: 11px;
  font-weight: 700;
}

.unit-toggler :deep(.el-switch__label.is-active) {
  color: #356f82;
}

.unit-toggler :deep(.el-switch__core) {
  border-color: #b9cdd5;
  background: #b9cdd5;
}

.unit-toggler :deep(.el-switch.is-checked .el-switch__core) {
  border-color: #3f8099;
  background: #3f8099;
}
</style>
