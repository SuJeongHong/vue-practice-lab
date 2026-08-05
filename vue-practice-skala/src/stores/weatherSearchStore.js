import axios from 'axios'
import { defineStore } from 'pinia'

const STORAGE_KEY = 'weather-search-results'
const MAX_RESULTS = 10
const GEOCODING_API_URL = 'https://api.openweathermap.org/geo/1.0/direct'
const CURRENT_WEATHER_API_URL = 'https://api.openweathermap.org/data/2.5/weather'

let latestSuggestionRequestId = 0

const getApiKey = () => import.meta.env.VITE_OPENWEATHER_API_KEY?.trim()

// Optional Chaining과 ??로 한글명이 없는 지역도 원래 이름을 안전하게 사용합니다.
const getKoreanLocationName = (location) => location.local_names?.ko ?? location.name

// Geocoding API 응답에서 자동완성에 필요한 도시 정보만 추립니다.
const toCitySuggestion = (location) => ({
  id: `${location.lat}-${location.lon}`,
  name: location.name,
  state: location.state ?? '',
  country: location.country ?? '',
  lat: location.lat,
  lon: location.lon,
})

// 새로고침 후에도 최근 검색 결과를 유지하도록 브라우저 저장소에서 복원합니다.
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

    return Array.isArray(parsedResults) ? parsedResults.slice(0, MAX_RESULTS) : []
  } catch {
    return []
  }
}

// 변경된 최근 검색 결과를 브라우저 저장소에 동기화합니다.
const saveSearchResults = (results) => {
  if (typeof window === 'undefined') {
    return
  }

  window.localStorage.setItem(STORAGE_KEY, JSON.stringify(results))
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
    // 입력한 검색어와 일치하는 도시 후보를 최대 5개까지 조회합니다.
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
        this.suggestionErrorMessage = 'OpenWeather API 키가 설정되지 않았습니다.'
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

        const locations = Array.isArray(response.data) ? response.data : []
        const suggestions = locations.map(toCitySuggestion)
        this.citySuggestions = suggestions

        return suggestions
      } catch (error) {
        if (requestId === latestSuggestionRequestId) {
          this.citySuggestions = []

          if (axios.isAxiosError(error)) {
            if (error.response?.status === 401) {
              this.suggestionErrorMessage = '도시 검색 API 인증에 실패했습니다.'
            } else if (error.request && !error.response) {
              this.suggestionErrorMessage = '네트워크 연결을 확인해 주세요.'
            } else {
              this.suggestionErrorMessage = '연관 도시를 불러오지 못했습니다.'
            }
          } else {
            this.suggestionErrorMessage = '연관 도시 검색 중 오류가 발생했습니다.'
          }
        }

        return []
      } finally {
        if (requestId === latestSuggestionRequestId) {
          this.isSuggestionLoading = false
        }
      }
    },

    // 진행 중인 자동완성 응답을 무효화하고 후보 및 오류 상태를 초기화합니다.
    clearCitySuggestions() {
      latestSuggestionRequestId += 1
      this.citySuggestions = []
      this.isSuggestionLoading = false
      this.suggestionErrorMessage = ''
    },

    // 도시 이름이나 선택한 좌표로 현재 날씨를 조회해 최근 검색 결과에 추가합니다.
    async fetchWeather(locationInput = {}) {
      const locationRequest = locationInput
      const trimmedCityName = String(locationRequest.name ?? '').trim()

      if (!trimmedCityName) {
        this.errorMessage = '검색할 도시를 입력해 주세요.'
        return null
      }

      const apiKey = getApiKey()

      if (!apiKey) {
        this.errorMessage = 'OpenWeather API 키가 설정되지 않았습니다.'
        return null
      }

      this.isLoading = true
      this.errorMessage = ''

      try {
        const latitude = Number(locationRequest.lat)
        const longitude = Number(locationRequest.lon)
        const hasCoordinates = Number.isFinite(latitude) && Number.isFinite(longitude)
        let location

        if (hasCoordinates) {
          location = {
            name: trimmedCityName,
            lat: latitude,
            lon: longitude,
          }
        } else {
          const geocodingResponse = await axios.get(GEOCODING_API_URL, {
            params: {
              q: trimmedCityName,
              limit: 1,
              appid: apiKey,
            },
          })

          const locations = Array.isArray(geocodingResponse.data) ? geocodingResponse.data : []
          location = locations[0]
        }

        if (!location) {
          this.errorMessage = '도시를 찾을 수 없습니다. 이름을 확인해 주세요.'
          return null
        }

        const response = await axios.get(CURRENT_WEATHER_API_URL, {
          params: {
            lat: location.lat,
            lon: location.lon,
            appid: apiKey,
            units: 'metric',
            lang: 'kr',
          },
        })

        const data = response.data
        const main = data?.main

        if (!main) {
          throw new Error('현재 날씨 응답 형식이 올바르지 않습니다.')
        }

        const weather = {
          id: data.id,
          name: getKoreanLocationName(location),
          country: data.sys?.country ?? '',
          temp: main.temp,
          feelsLike: main.feels_like,
          description: data.weather?.[0]?.description ?? '정보 없음',
          humidity: main.humidity,
          icon: data.weather?.[0]?.icon ?? '',
          searchedAt: new Date().toISOString(),
        }

        this.addSearchResult(weather)

        return weather
      } catch (error) {
        if (axios.isAxiosError(error)) {
          if (error.response?.status === 404) {
            this.errorMessage = '도시를 찾을 수 없습니다. 이름을 확인해 주세요.'
          } else if (error.response?.status === 401) {
            this.errorMessage = '날씨 API 인증에 실패했습니다.'
          } else if (error.request && !error.response) {
            this.errorMessage = '네트워크 연결을 확인한 후 다시 시도해 주세요.'
          } else {
            this.errorMessage = '날씨 정보를 불러오지 못했습니다.'
          }
        } else {
          this.errorMessage = '날씨 검색 중 알 수 없는 오류가 발생했습니다.'
        }

        return null
      } finally {
        this.isLoading = false
      }
    },

    // Spread로 원본 목록을 보존하면서 최신 결과를 앞에 결합하고 10개까지만 유지합니다.
    addSearchResult(weather) {
      const weatherId = String(weather.id)
      const remainingResults = this.searchResults.filter(
        (result) => String(result.id) !== weatherId,
      )

      this.searchResults = [weather, ...remainingResults].slice(0, MAX_RESULTS)

      saveSearchResults(this.searchResults)
    },

    // 선택한 도시 한 건을 최근 검색 결과와 브라우저 저장소에서 삭제합니다.
    removeSearchResult(id) {
      const weatherId = String(id)

      this.searchResults = this.searchResults.filter((result) => String(result.id) !== weatherId)

      saveSearchResults(this.searchResults)
    },

    // 저장된 모든 검색 결과를 비우고 브라우저 저장소에도 반영합니다.
    clearSearchResults() {
      this.searchResults = []
      saveSearchResults(this.searchResults)
    },
  },
})
