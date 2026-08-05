const legacyDescriptionMap = {
  온흐림: '흐림',
  튼구름: '구름 많음',
}

export const normalizeWeatherLabel = (description) => {
  const label = typeof description === 'string' ? description.trim() : ''
  return legacyDescriptionMap[label] ?? (label || '정보 없음')
}

export const getKoreanWeatherCondition = (weather = {}) => {
  const conditionId = Number(weather.id)

  if (conditionId >= 200 && conditionId < 300) return { label: '천둥번개', icon: '⛈️' }
  if (conditionId >= 300 && conditionId < 400) return { label: '이슬비', icon: '🌦️' }
  if (conditionId === 500) return { label: '약한 비', icon: '🌦️' }
  if (conditionId === 501) return { label: '비', icon: '🌧️' }
  if (conditionId >= 502 && conditionId <= 504) return { label: '강한 비', icon: '🌧️' }
  if (conditionId === 511) return { label: '어는 비', icon: '🌧️' }
  if (conditionId >= 520 && conditionId < 600) return { label: '소나기', icon: '🌦️' }
  if (conditionId === 600) return { label: '약한 눈', icon: '🌨️' }
  if (conditionId === 601) return { label: '눈', icon: '🌨️' }
  if (conditionId === 602) return { label: '강한 눈', icon: '❄️' }
  if (conditionId >= 610 && conditionId < 700) return { label: '진눈깨비', icon: '🌨️' }
  if ([701, 721].includes(conditionId)) return { label: '연무', icon: '🌫️' }
  if (conditionId === 741) return { label: '안개', icon: '🌫️' }
  if (conditionId >= 700 && conditionId < 800) return { label: '먼지·안개', icon: '🌫️' }
  if (conditionId === 800) return { label: '맑음', icon: '☀️' }
  if (conditionId === 801) return { label: '구름 조금', icon: '🌤️' }
  if (conditionId === 802) return { label: '구름 약간', icon: '⛅' }
  if (conditionId === 803) return { label: '구름 많음', icon: '☁️' }
  if (conditionId === 804) return { label: '흐림', icon: '☁️' }

  return {
    label: normalizeWeatherLabel(weather.description),
    icon: '🌡️',
  }
}
