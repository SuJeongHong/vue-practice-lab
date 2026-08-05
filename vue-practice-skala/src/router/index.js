import { createRouter, createWebHistory } from 'vue-router'

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  // 각 화면은 해당 경로에 처음 접근할 때만 불러오도록 지연 로딩합니다.
  routes: [
    {
      path: '/',
      name: 'WeatherHome',
      component: () => import('../views/WeatherHomeview.vue'),
    },
    {
      path: '/about',
      name: 'WeatherAbout',
      component: () => import('../views/WeatherAboutView.vue'),
    },
    {
      path: '/weather/:cityId',
      name: 'WeatherDetail',
      component: () => import('../views/WeatherDetailView.vue'),
    },
    {
      path: '/weather-search',
      name: 'WeatherSearch',
      component: () => import('../views/WeatherSearchView.vue'),
    },
    {
      path: '/:pathMatch(.*)*',
      name: 'NotFound',
      component: () => import('../views/NotFoundView.vue'),
    },
  ],
})

export default router
