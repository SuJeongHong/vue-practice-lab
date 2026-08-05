import axios from 'axios'
import { cities } from '@/data/cities'
import { getKoreanWeatherCondition } from '@/utils/weatherCondition'

const API_KEY = import.meta.env.VITE_OPENWEATHER_API_KEY?.trim()
const CURRENT_WEATHER_API_URL = 'https://api.openweathermap.org/data/2.5/weather'

// 도시 좌표로 현재 날씨를 조회하고 화면에서 사용할 형식으로 변환합니다.
const fetchCurrentWeather = async (city) => {
  if (!API_KEY) {
    throw new Error('.env.local에 VITE_OPENWEATHER_API_KEY를 입력해 주세요.')
  }

  const { data } = await axios.get(CURRENT_WEATHER_API_URL, {
    params: {
      lat: city.lat,
      lon: city.lon,
      appid: API_KEY,
      units: 'metric',
      lang: 'kr',
    },
  })

  // 구조분해로 API 객체와 날씨 배열에서 필요한 값을 꺼내고, 없는 배열 값에는 기본 객체를 사용합니다.
  const { main, wind, weather = [] } = data ?? {}
  const [weatherCondition = {}] = Array.isArray(weather) ? weather : []

  if (!main || !wind) {
    throw new Error(`${city.name}의 날씨 응답 형식이 올바르지 않습니다.`)
  }

  const condition = getKoreanWeatherCondition(weatherCondition)

  return {
    id: city.id,
    name: city.name,
    temp: Math.round(main.temp),
    humidity: main.humidity,
    windSpeed: wind.speed,
    condition: condition.label,
    conditionIcon: condition.icon,
  }
}

// 등록된 도시를 병렬 조회하고 일부 요청이 실패해도 성공한 결과는 반환합니다.
export const fetchAllWeather = async () => {
  const results = await Promise.allSettled(cities.map((city) => fetchCurrentWeather(city)))

  const weatherList = results.filter((result) => result.status === 'fulfilled').map((result) => result.value)

  if (weatherList.length === 0) {
    const firstFailure = results.find((result) => result.status === 'rejected')

    throw firstFailure?.reason ?? new Error('날씨 정보를 가져오지 못했습니다.')
  }

  return weatherList
}

// 상세 경로의 도시 ID를 좌표 데이터와 연결해 한 도시의 날씨를 조회합니다.
export const fetchWeatherByCityId = async (cityId) => {
  const city = cities.find((item) => item.id === cityId)

  if (!city) {
    throw new Error('등록되지 않은 도시 코드입니다.')
  }

  return fetchCurrentWeather(city)
}
