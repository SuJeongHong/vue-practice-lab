import axios from 'axios'
import { defineStore } from 'pinia'

const STORAGE_KEY = 'weather-search-results'
const MAX_RESULTS = 10
const GEOCODING_API_URL =
  'https://api.openweathermap.org/geo/1.0/direct'
const CURRENT_WEATHER_API_URL =
  'https://api.openweathermap.org/data/2.5/weather'

let latestSuggestionRequestId = 0

const getApiKey = () =>
  import.meta.env.VITE_OPENWEATHER_API_KEY?.trim()

const getKoreanLocationName = (location) =>
  location.local_names?.ko ?? location.name

const toCitySuggestion = (location) => ({
  id: `${location.lat}-${location.lon}`,
  name: location.name,
  state: location.state ?? '',
  country: location.country ?? '',
  lat: location.lat,
  lon: location.lon,
})

const loadSearchResults = () => {
  if (typeof window === 'undefined') {
    return []
  }

  try {
    const savedResults = window.localStorage.getItem(STORAGE_KEY)

    if (!savedResults) {
      return []
    }

    const parsedResults = JSON.parse(savedResults)

    return Array.isArray(parsedResults)
      ? parsedResults.slice(0, MAX_RESULTS)
      : []
  } catch {
    return []
  }
}

const saveSearchResults = (results) => {
  if (typeof window === 'undefined') {
    return
  }

  window.localStorage.setItem(
    STORAGE_KEY,
    JSON.stringify(results),
  )
}

export const useWeatherSearchStore = defineStore('weatherSearch', {
  state: () => ({
    searchResults: loadSearchResults(),
    isLoading: false,
    errorMessage: '',
    citySuggestions: [],
    isSuggestionLoading: false,
    suggestionErrorMessage: '',
  }),

  getters: {
    resultCount: (state) => state.searchResults.length,
  },

  actions: {
    async fetchCitySuggestions(query) {
      const trimmedQuery = query.trim()
      const requestId = ++latestSuggestionRequestId

      if (trimmedQuery.length < 1) {
        this.clearCitySuggestions()
        return []
      }

      const apiKey = getApiKey()

      if (!apiKey) {
        this.citySuggestions = []
        this.isSuggestionLoading = false
        this.suggestionErrorMessage =
          'OpenWeather API 키가 설정되지 않았습니다.'
        return []
      }

      this.citySuggestions = []
      this.isSuggestionLoading = true
      this.suggestionErrorMessage = ''

      try {
        const response = await axios.get(GEOCODING_API_URL, {
          params: {
            q: trimmedQuery,
            limit: 5,
            appid: apiKey,
          },
        })

        if (requestId !== latestSuggestionRequestId) {
          return []
        }

        const suggestions = response.data.map(toCitySuggestion)
        this.citySuggestions = suggestions

        return suggestions
      } catch (error) {
        if (requestId === latestSuggestionRequestId) {
          this.citySuggestions = []

          if (axios.isAxiosError(error)) {
            if (error.response?.status === 401) {
              this.suggestionErrorMessage =
                '도시 검색 API 인증에 실패했습니다.'
            } else if (error.request && !error.response) {
              this.suggestionErrorMessage =
                '네트워크 연결을 확인해 주세요.'
            } else {
              this.suggestionErrorMessage =
                '연관 도시를 불러오지 못했습니다.'
            }
          } else {
            this.suggestionErrorMessage =
              '연관 도시 검색 중 오류가 발생했습니다.'
          }
        }

        return []
      } finally {
        if (requestId === latestSuggestionRequestId) {
          this.isSuggestionLoading = false
        }
      }
    },

    clearCitySuggestions() {
      latestSuggestionRequestId += 1
      this.citySuggestions = []
      this.isSuggestionLoading = false
      this.suggestionErrorMessage = ''
    },

    async fetchWeather(locationInput) {
      const locationRequest =
        typeof locationInput === 'string'
          ? { name: locationInput }
          : locationInput ?? {}
      const trimmedCityName = String(
        locationRequest.name ?? '',
      ).trim()

      if (!trimmedCityName) {
        this.errorMessage = '검색할 도시를 입력해 주세요.'
        return null
      }

      const apiKey = getApiKey()

      if (!apiKey) {
        this.errorMessage =
          'OpenWeather API 키가 설정되지 않았습니다.'
        return null
      }

      this.isLoading = true
      this.errorMessage = ''

      try {
        const latitude = Number(locationRequest.lat)
        const longitude = Number(locationRequest.lon)
        const hasCoordinates =
          Number.isFinite(latitude) && Number.isFinite(longitude)
        let location

        if (hasCoordinates) {
          location = {
            name: trimmedCityName,
            state: locationRequest.state ?? '',
            country: locationRequest.country ?? '',
            lat: latitude,
            lon: longitude,
          }
        } else {
          const country = String(
            locationRequest.country ?? '',
          ).trim()
          const locationQuery = country
            ? `${trimmedCityName},${country}`
            : trimmedCityName
          const geocodingResponse = await axios.get(
            GEOCODING_API_URL,
            {
              params: {
                q: locationQuery,
                limit: 1,
                appid: apiKey,
              },
            },
          )

          location = geocodingResponse.data[0]
        }

        if (!location) {
          this.errorMessage =
            '도시를 찾을 수 없습니다. 이름을 확인해 주세요.'
          return null
        }

        const response = await axios.get(
          CURRENT_WEATHER_API_URL,
          {
            params: {
              lat: location.lat,
              lon: location.lon,
              appid: apiKey,
              units: 'metric',
              lang: 'kr',
            },
          },
        )

        const data = response.data
        const weather = {
          id: data.id,
          name: getKoreanLocationName(location),
          country: data.sys?.country ?? '',
          temp: data.main.temp,
          feelsLike: data.main.feels_like,
          description:
            data.weather?.[0]?.description ?? '정보 없음',
          humidity: data.main.humidity,
          icon: data.weather?.[0]?.icon ?? '',
          searchedAt: new Date().toISOString(),
        }

        this.addSearchResult(weather)

        return weather
      } catch (error) {
        if (axios.isAxiosError(error)) {
          if (error.response?.status === 404) {
            this.errorMessage =
              '도시를 찾을 수 없습니다. 이름을 확인해 주세요.'
          } else if (error.response?.status === 401) {
            this.errorMessage =
              '날씨 API 인증에 실패했습니다.'
          } else if (error.request && !error.response) {
            this.errorMessage =
              '네트워크 연결을 확인한 후 다시 시도해 주세요.'
          } else {
            this.errorMessage =
              '날씨 정보를 불러오지 못했습니다.'
          }
        } else {
          this.errorMessage =
            '날씨 검색 중 알 수 없는 오류가 발생했습니다.'
        }

        return null
      } finally {
        this.isLoading = false
      }
    },

    addSearchResult(weather) {
      const weatherId = String(weather.id)
      const remainingResults = this.searchResults.filter(
        (result) => String(result.id) !== weatherId,
      )

      this.searchResults = [
        weather,
        ...remainingResults,
      ].slice(0, MAX_RESULTS)

      saveSearchResults(this.searchResults)
    },

    removeSearchResult(id) {
      const weatherId = String(id)

      this.searchResults = this.searchResults.filter(
        (result) => String(result.id) !== weatherId,
      )

      saveSearchResults(this.searchResults)
    },

    clearSearchResults() {
      this.searchResults = []
      saveSearchResults(this.searchResults)
    },
  },
})
