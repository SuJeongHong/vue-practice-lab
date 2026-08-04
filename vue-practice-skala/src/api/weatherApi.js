import axios from 'axios'
import { cities } from '@/data/cities'

const API_KEY =
  import.meta.env.VITE_OPENWEATHER_API_KEY?.trim()

const fetchCurrentWeather = async (city) => {
  if (!API_KEY) {
    throw new Error(
      '.env.local에 VITE_OPENWEATHER_API_KEY를 입력해 주세요.',
    )
  }

  const response = await axios.get(
    'https://api.openweathermap.org/data/2.5/weather',
    {
      params: {
        lat: city.lat,
        lon: city.lon,
        appid: API_KEY,
        units: 'metric',
        lang: 'kr',
      },
    },

  )

  const data = response.data

  const weatherMain =
  data. weather[0]?.main

  const condition =
    weatherConditionMap[weatherMain] ?? {
      label: '기타',
      icon: '🌤️',
    }

  return {
    id: city.id,
    name: city.name,
    temp: Math.round(data.main.temp),
    humidity: data.main.humidity,
    windSpeed: data.wind.speed,
  
    condition: condition.label,
    conditionIcon: condition.icon,
  }
}

export const fetchAllWeather = async () => {
  const results = await Promise.allSettled(
    cities.map((city) =>
      fetchCurrentWeather(city),
    ),
  )

  const weatherList = results
    .filter((result) => result.status === 'fulfilled')
    .map((result) => result.value)

  if (weatherList.length === 0) {
    const firstFailure = results.find(
      (result) => result.status === 'rejected',
    )

    throw firstFailure?.reason ?? new Error(
      '날씨 정보를 가져오지 못했습니다.',
    )
  }

  return weatherList
}

export const fetchWeatherByCityId =
  async (cityId) => {
    const city = cities.find(
      (item) => item.id === cityId,
    )

    if (!city) {
      throw new Error(
        '등록되지 않은 도시 코드입니다.',
      )
    }

    return fetchCurrentWeather(city)
  }

  const weatherConditionMap = {
  Clear: {
    label: '맑음',
    icon: '☀️',
  },
  Clouds: {
    label: '구름',
    icon: '☁️',
  },
  Rain: {
    label: '비',
    icon: '🌧️',
  },
  Drizzle: {
    label: '이슬비',
    icon: '☔️',
  },
  Thunderstorm: {
    label: '천둥번개',
    icon: '🌩️',
  },
  Snow: {
    label: '눈',
    icon: '❄️',
  },
  Mist: {
    label: '안개',
    icon: '🌫️',
  },
  Fog: {
    label: '안개',
    icon: '🌫️',
  },
}