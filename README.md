# 대한민국 날씨 대시보드

OpenWeather 데이터를 이용해 대한민국 주요 도시 날씨, 전 세계 도시 검색, 5일 생활 날씨 정보를 제공하는 Vue SPA입니다.

## 화면 구조

| 경로 | 화면 | 주요 역할 |
| --- | --- | --- |
| `/` | 날씨 대시보드 | 대한민국 주요 도시 날씨 지도와 목록 |
| `/weather/:cityId` | 상세 날씨 | 동적 도시 ID를 이용한 상세 조회 |
| `/weather-search` | 날씨 검색 | 도시 자동완성, 현재 날씨 조회와 결과 저장 |
| `/life-weather-planner` | 생활 날씨 플래너 | 5일 예보·대기질·생활 조언 제공 |
| `/about` | 서비스 소개 | 서비스 기능과 데이터 안내 |
| 그 외 경로 | 404 | 잘못된 주소 안내와 홈 이동 |

각 View는 동적 `import()`로 불러와 라우트 단위로 지연 로딩합니다. 라우트의 `meta.title`을 이용해 화면 이동 시 브라우저 제목도 함께 변경합니다.

## 프로젝트 구조

```text
src/
├── api/
│   └── weatherApi.js              # 국내 주요 도시 현재 날씨 요청
├── components/
│   ├── dashboard/                 # 대시보드 공통 카드와 검색 필터
│   ├── navigation/                # 화면 이동 메뉴와 온도 단위 스위치
│   └── weather/                   # 지도, 날씨 카드, 공통 지역 검색, 결과 목록
├── data/
│   └── cities.js                  # 국내 주요 도시 ID와 좌표
├── router/
│   └── index.js                   # 화면 경로, Lazy Loading, 404, 문서 제목
├── stores/
│   ├── configStore.js             # 섭씨·화씨 전역 상태
│   ├── weatherSearchStore.js      # 도시 검색과 최근 결과 관리
│   └── lifeWeatherStore.js        # 예보·대기질·선택 지역·캐시 관리
├── utils/
│   └── weatherCondition.js        # 날씨 코드의 한글 문구와 아이콘 변환
├── views/                         # 라우터와 연결되는 페이지 컴포넌트
├── App.vue                        # 공통 내비게이션과 RouterView
└── main.js                        # 앱, Router, Pinia, Element Plus 등록
```

## 주요 기능과 구현 방식

### 대한민국 주요 도시 날씨

- `cities.js`에 등록된 12개 도시 좌표를 기준으로 현재 날씨를 병렬 요청합니다.
- `Promise.allSettled()`를 사용해 일부 도시 요청이 실패해도 성공한 결과는 표시합니다.
- 대한민국 지도 마커와 오른쪽 카드 목록이 같은 날씨 데이터를 공유합니다.
- 검색어는 별도 API를 호출하지 않고 `computed()`로 현재 목록을 즉시 필터링합니다.
- 카드 선택은 Emits로 부모에 전달하고, 상세보기는 도시 ID가 포함된 동적 경로로 이동합니다.
- `watch()`와 `watchEffect()`로 API 수신, 로딩, 카드 선택, 검색 상태, 온도 단위 변화를 관찰합니다.

### 전 세계 도시 검색

```text
검색어 입력
  → 150ms 디바운스
  → OpenWeather Geocoding API
  → 최대 5개 지역 후보 표시
  → 도시 선택 또는 검색 제출
  → Current Weather API
  → Pinia Store 갱신
  → 검색 결과 카드와 localStorage 저장
```

- 검색어와 선택 좌표를 URL Query에 기록해 새로고침 후에도 같은 검색을 재현합니다.
- 자동완성 요청마다 ID를 부여해 늦게 도착한 이전 응답이 최신 결과를 덮어쓰지 못하게 합니다.
- 좌표가 전달되지 않은 일반 검색은 Geocoding API로 좌표를 먼저 찾은 뒤 날씨를 요청합니다.
- 같은 도시는 중복 저장하지 않고 최근 검색 결과를 최대 10개까지 유지합니다.
- 개별 삭제와 전체 삭제 결과를 브라우저 `localStorage`에 동기화합니다.

### 생활 날씨 플래너

- 공통 `LocationSearchBar`를 재사용해 지역 이름과 좌표를 선택합니다.
- 선택 지역을 URL Query와 `localStorage`에 저장합니다.
- 현재 날씨, 5일 예보, 대기질 API를 병렬로 요청합니다.
- 같은 좌표의 조회 결과는 메모리에 10분간 캐싱해 중복 요청을 줄입니다.
- 기온, 강수 확률, PM10, PM2.5, 습도를 조합해 다음 생활 조언을 계산합니다.
  - 옷차림
  - 우산
  - 마스크
  - 빨래
  - 야외활동
  - 환기
- 대기질 값이 없는 날짜는 임의 값을 만들지 않고 `예보 없음`으로 표시합니다.

## 상태 관리

Pinia는 `main.js`에서 앱에 등록하며 총 3개의 Store를 사용합니다.

| Store | ID | 작성 방식 | 담당 기능 |
| --- | --- | --- | --- |
| `useConfigStore` | `config` | Setup Store | 전역 온도 단위 |
| `useWeatherSearchStore` | `weatherSearch` | Options Store | 도시 검색과 최근 결과 |
| `useLifeWeatherStore` | `lifeWeather` | Options Store | 생활 날씨, 예보, 대기질, 캐시 |

### `useConfigStore`

파일: `src/stores/configStore.js`

| 구분 | 이름 | 역할 |
| --- | --- | --- |
| State | `unit` | `celsius` 또는 `fahrenheit` 저장 |
| Getter | `unitSymbol` | 현재 단위에 따라 `°C` 또는 `°F` 반환 |

- `ref()`와 `computed()`를 반환하는 Setup Store 방식입니다.
- API 원본 온도는 섭씨로 유지하고 각 화면의 계산 속성에서 화씨로 변환합니다.
- `UnitToggler`, `WeatherCard`, `WeatherSearchResultCard`, 상세 화면, 생활 플래너가 같은 설정을 공유합니다.
- Store 값이 변경되면 모든 날씨 화면의 표시 온도가 동시에 다시 계산됩니다.

### `useWeatherSearchStore`

파일: `src/stores/weatherSearchStore.js`

#### State와 Getter

| 구분 | 이름 | 역할 |
| --- | --- | --- |
| State | `searchResults` | 최근 검색 날씨 결과 목록 |
| State | `isLoading` | 현재 날씨 요청 진행 여부 |
| State | `errorMessage` | 현재 날씨 요청 오류 메시지 |
| State | `citySuggestions` | 자동완성 지역 후보 목록 |
| State | `isSuggestionLoading` | 자동완성 요청 진행 여부 |
| State | `suggestionErrorMessage` | 자동완성 요청 오류 메시지 |
| Getter | `resultCount` | 저장된 검색 결과 개수 |

#### Actions

| Action | 역할 |
| --- | --- |
| `fetchCitySuggestions(query)` | Geocoding API로 후보를 최대 5개 조회 |
| `clearCitySuggestions()` | 후보를 비우고 진행 중인 이전 응답을 무효화 |
| `fetchWeather(location)` | 도시명 또는 좌표로 현재 날씨 조회 |
| `addSearchResult(weather)` | 중복 도시를 제거하고 최신 결과를 목록 앞에 추가 |
| `removeSearchResult(id)` | 선택한 검색 결과 삭제 |
| `clearSearchResults()` | 전체 검색 결과 삭제 |

- `WeatherSearchView`가 `storeToRefs()`로 State와 Getter를 가져오고 Action은 Store 인스턴스로 호출합니다.
- 자동완성은 `latestSuggestionRequestId`를 비교해 이전 요청의 늦은 응답을 무시합니다.
- 좌표가 없는 검색은 Geocoding API를 먼저 호출하고, 좌표가 있으면 Current Weather API를 바로 호출합니다.
- 검색 결과는 `weather-search-results` 키로 `localStorage`에 저장합니다.
- 저장 시 같은 도시 ID를 제거하고 최신순 최대 10개만 유지합니다.
- 저장된 데이터를 복원할 때 잘못된 JSON은 빈 배열로 처리하고 날씨 문구를 다시 정규화합니다.

### `useLifeWeatherStore`

파일: `src/stores/lifeWeatherStore.js`

#### State

| 이름 | 역할 |
| --- | --- |
| `selectedLocation` | 선택한 지역명과 위도·경도 |
| `currentWeather` | 현재 기온, 체감온도, 습도, 날씨 상태 |
| `dailyForecast` | 날짜별 5일 예보와 PM10·PM2.5 |
| `isLoading` | 플래너 데이터 요청 상태 |
| `errorMessage` | 플래너 요청 또는 데이터 가공 오류 |
| `locationSuggestions` | 지역 자동완성 후보 |
| `isLocationLoading` | 지역 자동완성 요청 상태 |
| `locationErrorMessage` | 지역 자동완성 오류 메시지 |
| `cache` | 좌표별 플래너 결과와 저장 시각 |

#### Actions

| Action | 역할 |
| --- | --- |
| `setSelectedLocation(location)` | 좌표를 검증·정규화하고 선택 지역 저장 |
| `searchLocations(query)` | Geocoding API로 지역 후보 조회 |
| `clearLocationSuggestions()` | 후보와 검색 상태 초기화 |
| `fetchPlanner(location, options)` | 현재 날씨·5일 예보·대기질 병렬 조회 |

- 선택 지역은 `life-weather-selected-location` 키로 `localStorage`에 저장합니다.
- 위도는 `-90~90`, 경도는 `-180~180` 범위인지 검사한 뒤 숫자로 정규화합니다.
- 좌표 소수점 네 자리로 캐시 키를 만들고 결과를 10분간 메모리에서 재사용합니다.
- `fetchPlanner()`는 `Promise.allSettled()`로 Current Weather, 5 Day Forecast, Air Pollution Forecast API를 동시에 호출합니다.
- 5일 예보는 필수 데이터로 취급하고, 현재 날씨 요청이 실패하면 가장 가까운 예보 값을 대체 데이터로 사용합니다.
- 대기질 요청만 실패한 경우 날씨 예보는 유지하고 PM10·PM2.5를 `예보 없음`으로 표시합니다.
- 3시간 단위 예보는 날짜별 최고·최저 기온, 최대 강수 확률, 정오에 가까운 대표 날씨로 가공합니다.
- 시간별 대기질은 지역 시간대를 반영해 날짜별 PM10·PM2.5 평균으로 변환합니다.
- `latestPlannerRequestId`로 이전 지역 요청이 새로 선택한 지역의 결과를 덮어쓰지 않게 합니다.
- 다시 시도할 때 `{ force: true }`를 전달하면 캐시를 사용하지 않고 API를 재호출합니다.

### View 로컬 상태

모든 상태를 Store에 저장하지는 않습니다. 한 화면에서만 사용하는 값은 해당 View의 `ref()`와 `computed()`로 관리합니다.

- `WeatherHomeview`: 국내 도시 목록, 검색어, 카드 선택 문구, 로딩과 오류
- `WeatherDetailView`: 선택 도시 상세 데이터와 요청 상태
- `LocationSearchBar`: 입력값, 검증 메시지, 자동완성 패널, 디바운스 타이머

이 구분으로 화면 전용 상태는 컴포넌트 가까이에 두고 여러 화면이 공유하거나 저장해야 하는 상태만 Pinia에서 관리합니다.

## 컴포넌트 통신

- 부모는 Props로 검색어, 날씨 객체, 자동완성 후보와 로딩 상태를 전달합니다.
- 자식은 Emits로 검색, 도시 선택, 상세 이동, 결과 삭제 동작을 알립니다.
- `BaseDashboardCard`는 Slot으로 서로 다른 내용을 같은 카드 구조에 표시합니다.
- `LocationSearchBar`는 날씨 검색과 생활 플래너에서 공통으로 사용합니다.
- Pinia는 여러 화면에서 공유해야 하는 온도 단위와 API 결과를 관리합니다.

## API와 오류 처리

- API 키는 `VITE_OPENWEATHER_API_KEY` 환경 변수에서 읽습니다.
- Axios의 HTTP 응답 상태와 네트워크 오류를 구분해 사용자 메시지를 제공합니다.
- 로딩, 오류, 결과 없음, 정상 결과를 조건부 렌더링으로 분리합니다.
- 날씨 응답은 화면에서 사용하기 쉬운 공통 객체 형태로 변환합니다.
- OpenWeather 날씨 코드는 `weatherCondition.js`에서 한글 문구와 아이콘으로 정규화합니다.

`VITE_` 환경 변수는 Git에 저장되지 않지만 브라우저 번들에서는 확인할 수 있으므로 서버 전용 비밀키를 넣으면 안 됩니다.

## UI 구성

- Element Plus의 Card, Input, Button, Tag, Alert, Empty, Switch를 사용합니다.
- 필요한 컴포넌트와 스타일만 개별 등록합니다.
- 서비스의 흰색·청록색 UI에 맞도록 컴포넌트별 scoped CSS를 적용합니다.
- 데스크톱에서는 지도와 실시간 현황을 나란히 표시하고, 작은 화면에서는 한 열로 전환합니다.
