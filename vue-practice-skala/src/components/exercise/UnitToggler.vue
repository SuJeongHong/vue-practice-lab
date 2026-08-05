<script setup>
import { useConfigStore } from '@/stores/configStore'

const configStore = useConfigStore()
</script>

<template>
  <div class="unit-toggler">
    <el-switch
      v-model="configStore.unit"
      active-value="fahrenheit"
      inactive-value="celsius"
      active-text="화씨(℉)"
      inactive-text="섭씨(℃)"
      aria-label="온도 단위 변경"
    />
  </div>
</template>

<style scoped>
.unit-toggler {
  display: inline-flex;
  align-items: center;
  gap: 8px;
  margin-left: auto;
  text-align: center;
}
</style>
