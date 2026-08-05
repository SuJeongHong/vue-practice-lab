# 대한민국 날씨 대시보드

Vue 3와 OpenWeather API로 만든 날씨 서비스입니다. 대한민국 주요 도시의 현재 날씨를 지도에서 확인하고, 전 세계 도시 검색과 생활 날씨 조언을 이용할 수 있습니다.

## 주요 기능

- 대한민국 주요 12개 도시의 실시간 날씨와 상세 정보
- OpenWeather Geocoding API 기반 도시 자동완성 검색
- 최근 검색 결과 최대 10개 브라우저 저장
- 현재 날씨, 5일 예보, 대기질 기반 생활 날씨 플래너
- 섭씨·화씨 전환과 반응형 화면
- Vue Router 기반 화면 이동, 동적 상세 경로, 404 화면

## 기술 스택

- Vue 3, Vite
- Vue Router, Pinia
- Axios, OpenWeather API
- Element Plus
- ESLint, Oxlint, Prettier

## 실행 방법

### 1. 패키지 설치

```sh
npm install
```

### 2. API 키 설정

프로젝트 루트에 `.env.local` 파일을 생성합니다.

```dotenv
VITE_OPENWEATHER_API_KEY=YOUR_OPENWEATHER_API_KEY
```

`.env.local`은 Git에 업로드되지 않습니다. 단, `VITE_` 환경 변수는 브라우저 번들에서 확인할 수 있으므로 서버용 비밀키를 저장하면 안 됩니다.

### 3. 개발 서버 실행

```sh
npm run dev
```

## 주요 명령어

| 명령어 | 설명 |
| --- | --- |
| `npm run dev` | 개발 서버 실행 |
| `npm run build` | `dist` 정적 파일 생성 |
| `npm run preview` | 빌드 결과 미리보기 |
| `npm run lint` | Oxlint와 ESLint 검사 |
| `npm run format` | Prettier 포맷팅 |

## 주요 화면

| 경로 | 화면 |
| --- | --- |
| `/` | 대한민국 주요 도시 날씨 대시보드 |
| `/weather/:cityId` | 도시별 상세 날씨 |
| `/weather-search` | 전 세계 도시 날씨 검색 |
| `/life-weather-planner` | 생활 날씨 플래너 |
| `/about` | 서비스 소개 |

## 데이터 저장

최근 검색 결과와 마지막 선택 지역은 브라우저 `localStorage`에 저장됩니다. 날씨 데이터는 OpenWeather의 현재 날씨, 5일 예보, 대기질 API를 사용합니다.
