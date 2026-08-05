import axios from 'axios'
import { defineStore } from 'pinia'

const LOCATION_STORAGE_KEY = 'life-weather-selected-location'
const CACHE_TTL = 10 * 60 * 1000
const GEOCODING_API_URL = 'https://geocoding-api.open-meteo.com/v1/search'
const WEATHER_API_URL = 'https://api.open-meteo.com/v1/forecast'
const AIR_QUALITY_API_URL = 'https://air-quality-api.open-meteo.com/v1/air-quality'

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

// includes()로 여러 WMO 코드 중 현재 날씨 코드가 포함되는지 확인합니다.
const getWeatherCondition = (weatherCode) => {
  const code = Number(weatherCode)

  if (code === 0) return { label: '맑음', icon: '☀️' }
  if (code === 1) return { label: '대체로 맑음', icon: '🌤️' }
  if (code === 2) return { label: '구름 조금', icon: '⛅' }
  if (code === 3) return { label: '흐림', icon: '☁️' }
  if ([45, 48].includes(code)) return { label: '안개', icon: '🌫️' }
  if ([51, 53, 55, 56, 57].includes(code)) return { label: '이슬비', icon: '🌦️' }
  if ([61, 63, 65, 66, 67].includes(code)) return { label: '비', icon: '🌧️' }
  if ([71, 73, 75, 77].includes(code)) return { label: '눈', icon: '🌨️' }
  if ([80, 81, 82].includes(code)) return { label: '소나기', icon: '🌦️' }
  if ([85, 86].includes(code)) return { label: '눈 소나기', icon: '❄️' }
  if ([95, 96, 99].includes(code)) return { label: '뇌우', icon: '⛈️' }

  return { label: '정보 없음', icon: '🌡️' }
}

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

// 시간별 미세먼지 값을 날짜별 일평균으로 묶고 없는 값은 null로 유지합니다.
const groupDailyAirQuality = (hourly = {}) => {
  const groupedValues = {}
  const safeHourly = hourly ?? {}
  const hourlyTimes = Array.isArray(safeHourly.time) ? safeHourly.time : []

  hourlyTimes.forEach((time, index) => {
    if (typeof time !== 'string') {
      return
    }

    const date = time.slice(0, 10)
    const pm10 = toNullableNumber(safeHourly.pm10?.[index])
    const pm2_5 = toNullableNumber(safeHourly.pm2_5?.[index])

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

    // 검색어와 연관된 지역을 Open-Meteo에서 최대 5개까지 조회합니다.
    async searchLocations(query) {
      const trimmedQuery = query.trim()
      const requestId = ++latestLocationRequestId

      if (trimmedQuery.length < 1) {
        this.clearLocationSuggestions()
        return []
      }

      this.locationSuggestions = []
      this.isLocationLoading = true
      this.locationErrorMessage = ''

      try {
        const response = await axios.get(GEOCODING_API_URL, {
          params: {
            name: trimmedQuery,
            count: 5,
            language: 'ko',
            format: 'json',
          },
        })

        if (requestId !== latestLocationRequestId) {
          return []
        }

        const locations = Array.isArray(response.data?.results) ? response.data.results : []
        const suggestions = locations.slice(0, 5).map((location) => ({
          id: location.id,
          name: location.name,
          admin1: location.admin1 ?? '',
          country: location.country ?? '',
          lat: location.latitude,
          lon: location.longitude,
        }))

        this.locationSuggestions = suggestions
        return suggestions
      } catch (error) {
        if (requestId === latestLocationRequestId) {
          this.locationSuggestions = []
          this.locationErrorMessage = axios.isAxiosError(error)
            ? '지역 검색 결과를 불러오지 못했습니다.'
            : '지역 검색 중 오류가 발생했습니다.'
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

    // Promise.all()로 날씨와 대기질을 동시에 조회하고 같은 좌표의 결과는 10분간 재사용합니다.
    async fetchPlanner(locationInput = this.selectedLocation, options = {}) {
      if (!isValidLocation(locationInput)) {
        this.errorMessage = '날씨를 확인할 지역을 먼저 선택해 주세요.'
        return null
      }

      const location = this.setSelectedLocation(locationInput)
      const requestId = ++latestPlannerRequestId
      const cacheKey = getCacheKey(location)
      const cachedResult = this.cache[cacheKey]
      const canUseCache =
        !options.force && cachedResult && Date.now() - cachedResult.savedAt < CACHE_TTL

      this.errorMessage = ''

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
        const [weatherResponse, airQualityResponse] = await Promise.all([
          axios.get(WEATHER_API_URL, {
            params: {
              latitude: location.lat,
              longitude: location.lon,
              current: 'temperature_2m,apparent_temperature,relative_humidity_2m,weather_code',
              daily:
                'weather_code,temperature_2m_max,temperature_2m_min,precipitation_probability_max',
              forecast_days: 7,
              timezone: 'auto',
            },
          }),
          axios.get(AIR_QUALITY_API_URL, {
            params: {
              latitude: location.lat,
              longitude: location.lon,
              hourly: 'pm10,pm2_5',
              forecast_days: 7,
              timezone: 'auto',
            },
          }),
        ])

        if (requestId !== latestPlannerRequestId) {
          return null
        }

        const weatherData = weatherResponse.data ?? {}
        const airQualityByDate = groupDailyAirQuality(airQualityResponse.data?.hourly)
        const currentCondition = getWeatherCondition(weatherData.current?.weather_code)
        const currentWeather = {
          temp: toNullableNumber(weatherData.current?.temperature_2m),
          feelsLike: toNullableNumber(weatherData.current?.apparent_temperature),
          humidity: toNullableNumber(weatherData.current?.relative_humidity_2m),
          condition: currentCondition.label,
          conditionIcon: currentCondition.icon,
        }
        const dailyTimes = Array.isArray(weatherData.daily?.time) ? weatherData.daily.time : []
        const dailyForecast = dailyTimes.slice(0, 7).map((date, index) => {
          const condition = getWeatherCondition(weatherData.daily.weather_code?.[index])
          const airQuality = airQualityByDate[date] ?? { pm10: null, pm2_5: null }

          return {
            date,
            condition: condition.label,
            conditionIcon: condition.icon,
            maxTemp: toNullableNumber(weatherData.daily.temperature_2m_max?.[index]),
            minTemp: toNullableNumber(weatherData.daily.temperature_2m_min?.[index]),
            precipitationProbability: toNullableNumber(
              weatherData.daily.precipitation_probability_max?.[index],
            ),
            pm10: airQuality.pm10,
            pm2_5: airQuality.pm2_5,
          }
        })

        if (dailyForecast.length === 0) {
          throw new Error('7일 예보 데이터가 없습니다.')
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
          this.errorMessage = axios.isAxiosError(error)
            ? '날씨 또는 대기질 정보를 불러오지 못했습니다.'
            : '생활 날씨 플래너 데이터를 처리하지 못했습니다.'
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
