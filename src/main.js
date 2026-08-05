import { createApp } from 'vue'
import { createPinia } from 'pinia'

import App from './App.vue'
import router from './router'

import { ElSwitch } from 'element-plus'
import 'element-plus/es/components/switch/style/css'

const app = createApp(App)

// 전역 상태와 화면 이동 기능을 앱에 등록합니다.
app.use(createPinia())
app.use(router)

// 실제로 사용하는 Element Plus 스위치만 등록해 불필요한 UI 코드를 제외합니다.
app.component('ElSwitch', ElSwitch)

app.mount('#app')
