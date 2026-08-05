import { createApp } from 'vue'
import { createPinia } from 'pinia'

import App from './App.vue'
import router from './router'

import { ElAlert, ElButton, ElCard, ElEmpty, ElInput, ElSwitch, ElTag } from 'element-plus'
import 'element-plus/es/components/alert/style/css'
import 'element-plus/es/components/button/style/css'
import 'element-plus/es/components/card/style/css'
import 'element-plus/es/components/empty/style/css'
import 'element-plus/es/components/input/style/css'
import 'element-plus/es/components/switch/style/css'
import 'element-plus/es/components/tag/style/css'

const app = createApp(App)

// 전역 상태와 화면 이동 기능을 앱에 등록합니다.
app.use(createPinia())
app.use(router)

// 실제로 사용하는 Element Plus 컴포넌트만 등록해 불필요한 UI 코드를 제외합니다.
app.component('ElAlert', ElAlert)
app.component('ElButton', ElButton)
app.component('ElCard', ElCard)
app.component('ElEmpty', ElEmpty)
app.component('ElInput', ElInput)
app.component('ElSwitch', ElSwitch)
app.component('ElTag', ElTag)

app.mount('#app')
