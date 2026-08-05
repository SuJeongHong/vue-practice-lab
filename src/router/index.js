import { createRouter, createWebHistory } from 'vue-router'

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  // 각 화면은 해당 경로에 처음 접근할 때만 불러오도록 지연 로딩합니다.
  routes: [
    {
      path: '/',
      name: 'WeatherHome',
      meta: { title: '대한민국 날씨 대시보드' },
      component: () => import('../views/WeatherHomeview.vue'),
    },
    {
      path: '/about',
      name: 'WeatherAbout',
      meta: { title: '서비스 소개 | 대한민국 날씨' },
      component: () => import('../views/WeatherAboutView.vue'),
    },
    {
      path: '/weather/:cityId',
      name: 'WeatherDetail',
      meta: { title: '도시 날씨 상세 | 대한민국 날씨' },
      component: () => import('../views/WeatherDetailView.vue'),
    },
    {
      path: '/weather-search',
      name: 'WeatherSearch',
      meta: { title: '날씨 검색 | 대한민국 날씨' },
      component: () => import('../views/WeatherSearchView.vue'),
    },
    {
      path: '/life-weather-planner',
      name: 'LifeWeatherPlanner',
      meta: { title: '생활 날씨 플래너 | 대한민국 날씨' },
      component: () => import('../views/LifeWeatherPlannerView.vue'),
    },
    {
      path: '/:pathMatch(.*)*',
      name: 'NotFound',
      meta: { title: '페이지를 찾을 수 없습니다 | 대한민국 날씨' },
      component: () => import('../views/NotFoundView.vue'),
    },
  ],
})

// 화면을 이동할 때 브라우저 탭에 현재 화면 이름을 표시합니다.
router.afterEach((to) => {
  document.title = to.meta.title ?? '대한민국 날씨'
})

export default router
