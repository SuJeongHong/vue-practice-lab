# Vue 3 실시간 날씨 대시보드

Vue 3 강의에서 학습한 반응형 상태, 컴포넌트 통신, Vue Router, Pinia, Axios를 하나의 날씨 서비스로 구성한 프로젝트입니다. OpenWeather API를 이용해 국내 주요 도시의 현재 날씨를 조회하고, 원하는 도시를 검색해 최근 결과를 브라우저에 저장할 수 있습니다.

## 주요 기능

### 1. 국내 주요 도시 날씨 대시보드

- 서울, 수원, 부산 등 10개 도시의 현재 날씨를 한 번에 조회합니다.
- 도시명 입력에 따라 목록을 실시간으로 필터링합니다.
- 기온에 따라 폭염, 더움, 선선함, 한파 등의 상태 배지를 표시합니다.
- 카드를 선택하면 선택 상태를 표시하고, `상세보기`를 누르면 도시별 상세 페이지로 이동합니다.
- 일부 도시의 API 요청이 실패하더라도 성공한 결과는 보여 주도록 `Promise.allSettled()`를 사용했습니다.

### 2. 도시별 상세 날씨

- `/weather/:cityId` 동적 경로로 도시 ID를 전달합니다.
- `useRoute()`로 `cityId`를 읽고 해당 도시의 기온, 습도, 풍속을 조회합니다.
- API 요청의 로딩, 성공, 실패 상태에 따라 화면을 분기합니다.

### 3. 전 세계 도시 검색

- 검색어가 1글자 이상이면 OpenWeather Geocoding API로 자동완성 후보를 최대 5개 제공합니다.
- 입력할 때마다 API가 호출되지 않도록 `watch()`와 150ms 디바운스를 적용했습니다.
- 한글 IME 조합 중 입력값도 직접 반영해 스페이스 없이 완성된 글자부터 검색합니다.
- 요청 ID를 비교해 늦게 도착한 이전 자동완성 응답이 최신 결과를 덮어쓰지 않도록 처리했습니다.
- 선택한 도시와 좌표를 URL 쿼리(`/weather-search?city=Seoul&lat=...&lon=...`)에 동기화합니다.
- 검색 결과는 중복 도시를 제거한 뒤 최신순으로 최대 10개까지 저장합니다.
- 개별 삭제와 전체 삭제를 지원하며, `localStorage`를 이용해 새로고침 후에도 결과를 유지합니다.

### 4. 전역 온도 단위 변경

- 내비게이션의 버튼으로 섭씨와 화씨를 전환합니다.
- Pinia의 `configStore`에서 단위를 전역 관리하므로 메인, 상세, 검색 결과 화면이 함께 갱신됩니다.
- 원본 기온은 섭씨로 유지하고 `computed()`에서 화면 표시값만 변환합니다.

### 5. SPA 라우팅과 예외 화면

| 경로 | 화면 | 역할 |
| --- | --- | --- |
| `/` | `WeatherHomeview.vue` | 국내 주요 도시 대시보드 |
| `/weather/:cityId` | `WeatherDetailView.vue` | 도시별 상세 날씨 |
| `/weather-search` | `WeatherSearchView.vue` | 도시 검색 및 결과 저장 |
| `/about` | `WeatherAboutView.vue` | 서비스 소개 |
| `/:pathMatch(.*)*` | `NotFoundView.vue` | 정의되지 않은 주소의 404 화면 |

모든 View는 동적 `import()`로 불러와 라우트 단위 지연 로딩을 적용했습니다.

## 기술 스택

| 구분 | 기술 | 프로젝트에서의 역할 |
| --- | --- | --- |
| Framework | Vue 3 | Composition API와 SFC 기반 UI 구성 |
| Build Tool | Vite | 개발 서버, HMR, 번들링, 환경 변수 로드 |
| Routing | Vue Router | SPA 화면 전환, 동적 경로, 쿼리 스트링, 404 처리 |
| State | Pinia | 온도 단위, 검색 결과, 날씨·자동완성 로딩과 오류 상태 관리 |
| HTTP | Axios | OpenWeather Geocoding 및 Current Weather API 호출 |
| Persistence | Web Storage API | 최근 검색 결과를 `localStorage`에 저장 |
| Quality | ESLint, Oxlint, Prettier | 코드 정적 분석과 포맷팅 |

## 프로젝트 구조

```text
vue-practice-skala/
├── public/                       # 정적 리소스
├── src/
│   ├── api/
│   │   └── weatherApi.js         # 등록 도시의 OpenWeather API 요청과 응답 가공
│   ├── components/exercise/
│   │   ├── BaseDashboardCard.vue # 기본 슬롯을 제공하는 공통 카드 레이아웃
│   │   ├── NavigationBar.vue     # RouterLink 메뉴와 단위 토글 배치
│   │   ├── SearchBar.vue         # 국내 도시 필터 입력, Props/Emits 실습
│   │   ├── UnitToggler.vue       # Pinia 전역 온도 단위 변경
│   │   ├── WeatherApiSearchBar.vue
│   │   │                         # API 도시 검색, 자동완성, 입력 검증
│   │   ├── WeatherCard.vue       # 도시 요약 카드와 상세 이동 이벤트
│   │   ├── WeatherSearchResultCard.vue
│   │   │                         # 검색 결과 한 건 표시 및 삭제 이벤트
│   │   └── WeatherSearchResultList.vue
│   │                             # 검색 결과 목록과 전체 삭제 이벤트
│   ├── data/
│   │   └── cities.js             # 국내 10개 도시의 ID와 위·경도
│   ├── router/
│   │   └── index.js              # 경로, Lazy Loading, 동적 Route, 404 설정
│   ├── stores/
│   │   ├── configStore.js        # 섭씨·화씨 상태, 기호 Getter, 토글 Action
│   │   ├── weatherSearchStore.js # 검색 API, 결과·상태 관리, localStorage 동기화
│   │   └── counter.js            # Pinia 기본 구조 학습용 예제 Store
│   ├── views/
│   │   ├── WeatherHomeview.vue   # 메인 날씨 대시보드
│   │   ├── WeatherDetailView.vue # 동적 도시 상세 페이지
│   │   ├── WeatherSearchView.vue # 도시 검색 페이지
│   │   ├── WeatherAboutView.vue  # 서비스 소개 페이지
│   │   └── NotFoundView.vue      # 404 페이지
│   ├── App.vue                   # 공통 내비게이션과 RouterView
│   └── main.js                   # Vue App 생성, Router·Pinia 등록, Mount
├── .gitignore
├── index.html
├── package.json
└── vite.config.js                # Vue 플러그인과 `@` 경로 별칭 설정
```

`counter.js`는 Pinia의 `state`, `getters`, `actions` 구조를 익히기 위한 기본 예제이며 현재 날씨 화면에서는 사용하지 않습니다.

## 애플리케이션 구성과 데이터 흐름

### 앱 시작과 화면 전환

```text
index.html
  └─ main.js
      ├─ createApp(App)
      ├─ app.use(createPinia())
      ├─ app.use(router)
      └─ App.vue
          ├─ NavigationBar
          └─ RouterView ── 현재 URL에 맞는 View 렌더링
```

### 국내 도시 날씨 조회

```text
WeatherHomeview의 onMounted
  → fetchAllWeather()
  → cities 배열을 기준으로 API 병렬 호출
  → Promise.allSettled()로 성공 결과 수집
  → weatherList(ref)에 저장
  → filteredWeatherList(computed)로 검색어 필터링
  → WeatherCard 목록 렌더링
```

### 도시 검색과 저장

```text
WeatherApiSearchBar의 검색어 watch
  → 1글자 이상 입력 시 150ms 디바운스
  → Pinia fetchCitySuggestions()
  → Geocoding API 자동완성 결과 최대 5개 표시

검색 제출
  → 자동완성 선택 시 도시명·좌표를 router query로 전달
  → watch(route.fullPath)
  → Pinia fetchWeather()
  → 선택 좌표가 없을 때만 Geocoding API로 좌표 조회
  → Current Weather API로 현재 날씨 조회
  → 중복 제거 및 최대 10개 유지
  → localStorage 저장
  → 결과 카드 렌더링
```

## Vue 핵심 기술 적용

### Composition API

| 기술 | 적용 위치 | 사용 목적 |
| --- | --- | --- |
| `ref()` | Home, Detail, SearchBar | 목록, 검색어, 로딩, 오류, 선택 상태를 반응형 데이터로 관리 |
| `computed()` | Home, Detail, 검색 결과 Card, Store | 필터 목록, 온도 변환, 아이콘 URL, 검색 시간, 단위 기호 계산 |
| `onMounted()` | Home, Detail | 컴포넌트가 화면에 붙은 뒤 초기 날씨 API 호출 |
| `onBeforeUnmount()` | SearchBar | 자동완성 타이머와 임시 후보 상태 정리 |

`computed()`는 원본 상태를 직접 바꾸지 않고 필요한 표시값을 계산하며, 의존 값이 바뀔 때만 다시 평가됩니다.

### `watch()`와 `watchEffect()`

이 프로젝트에서는 값의 변화를 관찰한 뒤 후속 작업이 필요한 경우에 사용했습니다.

| 파일 | 감시 대상 | 동작 |
| --- | --- | --- |
| `WeatherHomeview.vue` | `selectedCityInfo` | 카드 선택 전후 상태를 콘솔에 기록 |
| `WeatherHomeview.vue` | `weatherList` | API 수신 전후 도시 수와 결과를 기록 |
| `WeatherHomeview.vue` | `loading` | API 요청 시작·완료 상태를 기록 |
| `WeatherHomeview.vue` | `configStore.unit` | 섭씨·화씨 변경 전후 값을 기록 |
| `WeatherHomeview.vue` | 검색어와 필터 결과 | `watchEffect()`가 내부 의존성을 자동 추적해 검색 결과를 기록 |
| `WeatherApiSearchBar.vue` | `props.initialCity` | URL에서 받은 초기 도시를 입력창에 즉시 반영 (`immediate`) |
| `WeatherSearchView.vue` | `route.fullPath` | 도시·국가·좌표 쿼리가 바뀌면 날씨 검색 Action 실행 (`immediate`) |

- `watch()`는 감시 대상을 명시하고 `newValue`, `oldValue`를 이용하거나 API 호출 같은 후속 작업을 실행할 때 적합합니다.
- `watchEffect()`는 함수 안에서 사용된 반응형 값을 자동 추적하며 최초에도 즉시 실행됩니다.

### 컴포넌트 통신: Props, Emits, Slot

Vue의 단방향 데이터 흐름에 맞춰 부모는 Props로 데이터를 전달하고, 자식은 Emits로 사용자 동작을 알립니다.

| 부모 → 자식 Props | 자식 → 부모 Emits |
| --- | --- |
| `SearchBar`: `query` | `update-query` |
| `WeatherCard`: `weather` | `select-card`, `click-detail` |
| `WeatherApiSearchBar`: 초기 도시, 로딩 | `search` |
| `WeatherSearchResultCard`: `weather` | `remove` |

`BaseDashboardCard.vue`는 기본 `<slot />`을 제공해 카드의 공통 레이아웃은 재사용하고, 검색 영역과 날씨 목록처럼 서로 다른 콘텐츠는 부모에서 주입합니다.

### Pinia Store

#### `configStore`

Setup Store 방식으로 작성했습니다.

- State: `unit` (`ref`) - `celsius` 또는 `fahrenheit`
- Getter: `unitSymbol` (`computed`) - 현재 단위에 맞는 `°C` 또는 `°F`
- Action: `toggleUnit()` - 두 단위를 전환

#### `weatherSearchStore`

Options Store 방식으로 작성했습니다.

- State: 검색 결과와 날씨 상태, 저장하지 않는 자동완성 후보·로딩·오류 상태
- Getter: `resultCount` - 저장된 검색 결과 개수
- Actions: 자동완성 조회, 날씨 검색, 결과 추가·삭제·전체 삭제
- Persistence: Store 초기화 시 `localStorage`를 읽고 변경 시 다시 저장

`WeatherSearchView.vue`에서는 `storeToRefs()`로 State와 Getter를 구조 분해해도 반응성이 유지되도록 했고, Action은 Store 인스턴스를 통해 호출합니다.

### Vue Router

- `createRouter()`와 `createWebHistory()`로 SPA 라우터를 구성했습니다.
- `<RouterLink>`는 전체 페이지 새로고침 없이 URL과 View를 변경합니다.
- `<RouterView>`는 현재 경로와 연결된 페이지가 렌더링되는 영역입니다.
- `useRouter()`의 `router.push()`로 카드 상세 이동과 검색 쿼리 갱신을 처리합니다.
- `useRoute()`로 동적 파라미터와 쿼리 스트링을 반응형으로 읽습니다.
- Catch-all Route로 등록되지 않은 주소를 404 화면에 연결합니다.

### Axios와 비동기 처리

- `axios.get(url, { params })` 형태로 URL과 Query Parameter를 분리했습니다.
- `async/await`와 `try/catch/finally`로 성공, 실패, 로딩 상태를 명확히 처리했습니다.
- Axios 오류의 HTTP 상태와 네트워크 응답 여부를 구분해 사용자 메시지를 제공합니다.
- API 응답은 화면에서 사용하기 좋은 날씨 객체로 가공한 뒤 Component 또는 Store에 저장합니다.

### Template 문법과 UI 처리

- `v-model`: API 검색 입력값의 양방향 바인딩
- `v-if / v-else-if / v-else`: 로딩, 오류, 결과, 빈 상태 조건부 렌더링
- `v-for`와 `:key`: 도시·검색 결과 목록 렌더링
- `v-bind` 축약형(`:`): Props, 이미지 URL, 비활성 상태, 접근성 속성 바인딩
- `v-on` 축약형(`@`): 클릭, 입력, 제출, 포커스 이벤트 처리
- 이벤트 수식어: `@submit.prevent`로 새로고침 방지, `@click.stop`으로 카드 클릭 전파 방지
- `<style scoped>`: 컴포넌트별 스타일 범위 제한

## 시작하기

필요한 Node.js 버전은 `package.json` 기준 `^22.18.0` 또는 `>=24.12.0`입니다.

### 1. 설치

```sh
npm install
```

### 2. OpenWeather API 키 설정

프로젝트 루트에 `.env.local` 파일을 만들고 발급받은 API 키를 입력합니다.

```dotenv
VITE_OPENWEATHER_API_KEY=YOUR_OPENWEATHER_API_KEY
```

`.env.local`은 `*.local` 규칙으로 Git에서 제외됩니다. 다만 `VITE_` 접두사가 붙은 값은 최종 프런트엔드 번들에서 접근할 수 있으므로, 브라우저에 공개되면 안 되는 서버용 비밀키를 저장하는 용도로는 사용할 수 없습니다.

### 3. 개발 서버 실행

```sh
npm run dev
```

터미널에 표시되는 로컬 주소로 접속합니다. Vite 기본 주소는 일반적으로 `http://localhost:5173`입니다.

## 명령어

| 명령어 | 설명 |
| --- | --- |
| `npm run dev` | Vite 개발 서버 실행 |
| `npm run build` | 프로덕션용 정적 파일 빌드 |
| `npm run preview` | 빌드 결과 로컬 미리보기 |
| `npm run lint` | Oxlint와 ESLint 검사 및 자동 수정 |
| `npm run format` | `src` 폴더 Prettier 포맷팅 |

## 학습 내용과 구현 매핑

| 강의 주제 | 프로젝트 구현 |
| --- | --- |
| Vue 문법 | 데이터 바인딩, 이벤트 처리, 조건부·목록 렌더링 |
| Composition API | `ref`, `computed`, `watch`, `watchEffect`, Lifecycle Hook |
| Vue Component | SFC, Props, Emits, Slot, 부모·자식 데이터 흐름 |
| Vue Router | SPA, Lazy Loading, 동적 Route, Query String, 404 |
| Pinia | 전역 단위 설정, 검색 State·Getter·Action, `storeToRefs` |
| Axios | OpenWeather REST API, `async/await`, 오류·로딩 처리 |
| Modern JavaScript | 배열 메서드, 구조 분해, Optional Chaining, Nullish Coalescing, Promise |
| Vite 및 배포 준비 | 환경 변수, 경로 별칭, ESLint, Prettier, Production Build |
