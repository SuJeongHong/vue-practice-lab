import axios from 'axios'
import { defineStore } from 'pinia'

import { getKoreanWeatherCondition } from '@/utils/weatherCondition'

const LOCATION_STORAGE_KEY = 'life-weather-selected-location'
const CACHE_TTL = 10 * 60 * 1000
const GEOCODING_API_URL = 'https://api.openweathermap.org/geo/1.0/direct'
const CURRENT_WEATHER_API_URL = 'https://api.openweathermap.org/data/2.5/weather'
const WEATHER_FORECAST_API_URL = 'https://api.openweathermap.org/data/2.5/forecast'
const AIR_QUALITY_API_URL = 'https://api.openweathermap.org/data/2.5/air_pollution/forecast'

let latestLocationRequestId = 0
let latestPlannerRequestId = 0

const isValidLocation = (location) => {
  const latitude = Number(location?.lat)
  const longitude = Number(location?.lon)

  return (
    typeof location?.name === 'string' &&
    location.name.trim().length > 0 &&
    location?.lat !== null &&
    location?.lat !== '' &&
    Number.isFinite(latitude) &&
    latitude >= -90 &&
    latitude <= 90 &&
    location?.lon !== null &&
    location?.lon !== '' &&
    Number.isFinite(longitude) &&
    longitude >= -180 &&
    longitude <= 180
  )
}

const normalizeLocation = (location) => ({
  name: location.name.trim(),
  lat: Number(location.lat),
  lon: Number(location.lon),
})

// 마지막으로 선택한 지역을 브라우저 저장소에서 안전하게 복원합니다.
const loadSelectedLocation = () => {
  if (typeof window === 'undefined') {
    return null
  }

  try {
    const savedLocation = window.localStorage.getItem(LOCATION_STORAGE_KEY)

    if (!savedLocation) {
      return null
    }

    const parsedLocation = JSON.parse(savedLocation)
    return isValidLocation(parsedLocation) ? normalizeLocation(parsedLocation) : null
  } catch {
    return null
  }
}

// 선택한 지역의 이름과 좌표를 새로고침 후에도 사용할 수 있게 저장합니다.
const saveSelectedLocation = (location) => {
  if (typeof window === 'undefined') {
    return
  }

  try {
    window.localStorage.setItem(LOCATION_STORAGE_KEY, JSON.stringify(location))
  } catch {
    // 저장소 사용이 제한되어도 현재 세션의 Pinia 상태는 계속 사용합니다.
  }
}

const getApiKey = () => import.meta.env.VITE_OPENWEATHER_API_KEY?.trim()

const toNullableNumber = (value) => {
  if (value === null || value === undefined || value === '') {
    return null
  }

  const number = Number(value)
  return Number.isFinite(number) ? number : null
}

const getAverage = (values) => {
  if (values.length === 0) {
    return null
  }

  return Math.round(values.reduce((sum, value) => sum + value, 0) / values.length)
}

const getLocalDate = (timestamp, timezoneOffset = 0) => {
  const unixTimestamp = Number(timestamp)

  if (!Number.isFinite(unixTimestamp)) {
    return ''
  }

  return new Date((unixTimestamp + timezoneOffset) * 1000).toISOString().slice(0, 10)
}

const getLocalHour = (timestamp, timezoneOffset = 0) => new Date((Number(timestamp) + timezoneOffset) * 1000).getUTCHours()

// OpenWeather의 시간별 미세먼지 값을 날짜별 일평균으로 묶습니다.
const groupDailyAirQuality = (forecastList = [], timezoneOffset = 0) => {
  const groupedValues = {}

  forecastList.forEach((forecast) => {
    const date = getLocalDate(forecast?.dt, timezoneOffset)

    if (!date) {
      return
    }

    const pm10 = toNullableNumber(forecast.components?.pm10)
    const pm2_5 = toNullableNumber(forecast.components?.pm2_5)

    if (!groupedValues[date]) {
      groupedValues[date] = { pm10: [], pm2_5: [] }
    }

    if (pm10 !== null) groupedValues[date].pm10.push(pm10)
    if (pm2_5 !== null) groupedValues[date].pm2_5.push(pm2_5)
  })

  return Object.fromEntries(
    Object.entries(groupedValues).map(([date, values]) => [
      date,
      {
        pm10: getAverage(values.pm10),
        pm2_5: getAverage(values.pm2_5),
      },
    ]),
  )
}

// 3시간 간격 예보를 날짜별 최고·최저 기온, 강수확률과 대표 날씨로 가공합니다.
const groupDailyForecast = (forecastList = [], timezoneOffset = 0) => {
  const groupedForecasts = {}

  forecastList.forEach((forecast) => {
    const date = getLocalDate(forecast?.dt, timezoneOffset)

    if (!date) {
      return
    }

    if (!groupedForecasts[date]) {
      groupedForecasts[date] = []
    }

    groupedForecasts[date].push(forecast)
  })

  return Object.entries(groupedForecasts)
    .slice(0, 5)
    .map(([date, forecasts]) => {
      const representativeForecast = forecasts.reduce((closest, forecast) => {
        const currentDistance = Math.abs(getLocalHour(forecast.dt, timezoneOffset) - 12)
        const closestDistance = Math.abs(getLocalHour(closest.dt, timezoneOffset) - 12)
        return currentDistance < closestDistance ? forecast : closest
      })
      const maxTemperatures = forecasts.map((forecast) => toNullableNumber(forecast.main?.temp_max)).filter((temperature) => temperature !== null)
      const minTemperatures = forecasts.map((forecast) => toNullableNumber(forecast.main?.temp_min)).filter((temperature) => temperature !== null)
      const precipitationProbabilities = forecasts.map((forecast) => toNullableNumber(forecast.pop)).filter((probability) => probability !== null)
      const condition = getKoreanWeatherCondition(representativeForecast.weather?.[0])

      return {
        date,
        condition: condition.label,
        conditionIcon: condition.icon,
        maxTemp: maxTemperatures.length > 0 ? Math.max(...maxTemperatures) : null,
        minTemp: minTemperatures.length > 0 ? Math.min(...minTemperatures) : null,
        precipitationProbability: precipitationProbabilities.length > 0 ? Math.round(Math.max(...precipitationProbabilities) * 100) : null,
        pm10: null,
        pm2_5: null,
      }
    })
}

const getCacheKey = (location) => `${location.lat.toFixed(4)}:${location.lon.toFixed(4)}`

export const useLifeWeatherStore = defineStore('lifeWeather', {
  state: () => ({
    selectedLocation: loadSelectedLocation(),
    currentWeather: null,
    dailyForecast: [],
    isLoading: false,
    errorMessage: '',
    locationSuggestions: [],
    isLocationLoading: false,
    locationErrorMessage: '',
    cache: {},
  }),

  actions: {
    // 선택한 지역을 Pinia와 localStorage에 함께 저장합니다.
    setSelectedLocation(location) {
      if (!isValidLocation(location)) {
        return null
      }

      const normalizedLocation = normalizeLocation(location)
      this.selectedLocation = normalizedLocation
      saveSelectedLocation(normalizedLocation)

      return normalizedLocation
    },

    // 검색어와 연관된 지역을 OpenWeather에서 최대 5개까지 조회합니다.
    async searchLocations(query) {
      const trimmedQuery = query.trim()
      const requestId = ++latestLocationRequestId
      const apiKey = getApiKey()

      if (trimmedQuery.length < 1) {
        this.clearLocationSuggestions()
        return []
      }

      this.locationSuggestions = []
      this.isLocationLoading = true
      this.locationErrorMessage = ''

      if (!apiKey) {
        this.isLocationLoading = false
        this.locationErrorMessage = '.env.local에 OpenWeather API 키를 입력해 주세요.'
        return []
      }

      try {
        const response = await axios.get(GEOCODING_API_URL, {
          params: {
            q: trimmedQuery,
            limit: 5,
            appid: apiKey,
          },
        })

        if (requestId !== latestLocationRequestId) {
          return []
        }

        const locations = Array.isArray(response.data) ? response.data : []
        const suggestions = locations.slice(0, 5).map((location, index) => ({
          id: `${location.lat}:${location.lon}:${index}`,
          name: location.local_names?.ko ?? location.name,
          admin1: location.state ?? '',
          country: location.country ?? '',
          lat: location.lat,
          lon: location.lon,
        }))

        this.locationSuggestions = suggestions
        return suggestions
      } catch (error) {
        if (requestId === latestLocationRequestId) {
          this.locationSuggestions = []
          this.locationErrorMessage = axios.isAxiosError(error) && error.response?.status === 401 ? 'OpenWeather API 키를 확인해 주세요.' : '지역 검색 결과를 불러오지 못했습니다.'
        }

        return []
      } finally {
        if (requestId === latestLocationRequestId) {
          this.isLocationLoading = false
        }
      }
    },

    // 이전 자동완성 응답을 무효화하고 지역 검색 상태를 초기화합니다.
    clearLocationSuggestions() {
      latestLocationRequestId += 1
      this.locationSuggestions = []
      this.isLocationLoading = false
      this.locationErrorMessage = ''
    },

    // OpenWeather의 현재 날씨·5일 예보·대기질을 동시에 조회하고 같은 좌표는 10분간 재사용합니다.
    async fetchPlanner(locationInput = this.selectedLocation, options = {}) {
      if (!isValidLocation(locationInput)) {
        this.errorMessage = '날씨를 확인할 지역을 먼저 선택해 주세요.'
        return null
      }

      const location = this.setSelectedLocation(locationInput)
      const requestId = ++latestPlannerRequestId
      const cacheKey = getCacheKey(location)
      const cachedResult = this.cache[cacheKey]
      const canUseCache = !options.force && cachedResult && Date.now() - cachedResult.savedAt < CACHE_TTL
      const apiKey = getApiKey()

      this.errorMessage = ''

      if (!apiKey) {
        this.isLoading = false
        this.errorMessage = '.env.local에 OpenWeather API 키를 입력해 주세요.'
        return null
      }

      if (canUseCache) {
        this.currentWeather = cachedResult.currentWeather
        this.dailyForecast = cachedResult.dailyForecast
        this.isLoading = false
        return cachedResult
      }

      this.currentWeather = null
      this.dailyForecast = []
      this.isLoading = true

      try {
        const [currentWeatherResult, weatherForecastResult, airQualityResult] = await Promise.allSettled([
          axios.get(CURRENT_WEATHER_API_URL, {
            params: {
              lat: location.lat,
              lon: location.lon,
              appid: apiKey,
              units: 'metric',
              lang: 'kr',
            },
          }),
          axios.get(WEATHER_FORECAST_API_URL, {
            params: {
              lat: location.lat,
              lon: location.lon,
              appid: apiKey,
              units: 'metric',
              lang: 'kr',
            },
          }),
          axios.get(AIR_QUALITY_API_URL, {
            params: {
              lat: location.lat,
              lon: location.lon,
              appid: apiKey,
            },
          }),
        ])

        if (requestId !== latestPlannerRequestId) {
          return null
        }

        if (weatherForecastResult.status === 'rejected') {
          throw weatherForecastResult.reason
        }

        const forecastData = weatherForecastResult.value.data ?? {}
        const forecastList = Array.isArray(forecastData.list) ? forecastData.list : []
        const timezoneOffset = toNullableNumber(forecastData.city?.timezone) ?? 0
        const fallbackCurrentData = forecastList[0] ?? {}
        const currentData = currentWeatherResult.status === 'fulfilled' ? currentWeatherResult.value.data : fallbackCurrentData
        const currentCondition = getKoreanWeatherCondition(currentData.weather?.[0])
        const currentWeather = {
          temp: toNullableNumber(currentData.main?.temp),
          feelsLike: toNullableNumber(currentData.main?.feels_like),
          humidity: toNullableNumber(currentData.main?.humidity),
          condition: currentCondition.label,
          conditionIcon: currentCondition.icon,
        }
        const airQualityList = airQualityResult.status === 'fulfilled' && Array.isArray(airQualityResult.value.data?.list) ? airQualityResult.value.data.list : []
        const airQualityByDate = groupDailyAirQuality(airQualityList, timezoneOffset)
        const dailyForecast = groupDailyForecast(forecastList, timezoneOffset).map((forecast) => ({
          ...forecast,
          ...airQualityByDate[forecast.date],
        }))

        if (dailyForecast.length === 0) {
          throw new Error('5일 예보 데이터가 없습니다.')
        }

        const plannerResult = {
          savedAt: Date.now(),
          currentWeather,
          dailyForecast,
        }

        this.cache[cacheKey] = plannerResult
        this.currentWeather = currentWeather
        this.dailyForecast = dailyForecast

        return plannerResult
      } catch (error) {
        if (requestId === latestPlannerRequestId) {
          if (axios.isAxiosError(error) && error.response?.status === 401) {
            this.errorMessage = 'OpenWeather API 키를 확인해 주세요.'
          } else if (axios.isAxiosError(error) && error.response?.status === 429) {
            this.errorMessage = 'OpenWeather API 요청 한도를 초과했습니다. 잠시 후 다시 시도해 주세요.'
          } else {
            this.errorMessage = axios.isAxiosError(error) ? 'OpenWeather 날씨 정보를 불러오지 못했습니다.' : '생활 날씨 플래너 데이터를 처리하지 못했습니다.'
          }
        }

        return null
      } finally {
        if (requestId === latestPlannerRequestId) {
          this.isLoading = false
        }
      }
    },
  },
})
