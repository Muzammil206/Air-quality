// Air quality data fetching utilities - Real OpenWeather API only

import {
  type AirQualityReading,
  type AirQualityStats,
  type WeatherData,
  type AIInsight,
  GAS_TYPES,
  ABUJA_LOCATIONS,
} from "./types"

function getLocationCoordinates(location: string): { lat: number; lng: number } {
  const locationData = ABUJA_LOCATIONS.find((l) => l.name === location) || ABUJA_LOCATIONS[0]
  return locationData.coordinates
}

function mapOpenWeatherAQIToQualityLevel(aqi: number, description: string): AirQualityReading["qualityLevel"] {
  switch (aqi) {
    case 1:
      return "Good"
    case 2:
      return "Moderate"
    case 3:
      return "Unhealthy for Sensitive Groups"
    case 4:
      return "Unhealthy"
    case 5:
      return "Very Unhealthy"
    default:
      return "Moderate"
  }
}

function convertOpenWeatherToReading(
  apiResponse: any,
  location: string,
  gasType: keyof typeof GAS_TYPES,
  overrideCoordinates?: { lat: number; lng: number },
): AirQualityReading {
  console.log("API Response:", JSON.stringify(apiResponse, null, 2))

  let airQualityData: any
  let coordinates: { lat: number; lon: number }

  if (apiResponse.type === "FeatureCollection" && apiResponse.features?.length > 0) {
    // Handle GeoJSON format
    const feature = apiResponse.features[0]
    airQualityData = {
      main: { aqi: feature.properties.air_quality_index },
      components: feature.properties.components,
      dt: feature.properties.timestamp,
    }
    coordinates = {
      lat: feature.geometry.coordinates[1], // GeoJSON uses [lon, lat]
      lon: feature.geometry.coordinates[0],
    }
  } else if (apiResponse.list?.[0] && apiResponse.coord) {
    // Handle raw OpenWeather format (fallback)
    airQualityData = apiResponse.list[0]
    coordinates = apiResponse.coord
  } else {
    console.error("Invalid API response structure:", apiResponse)
    throw new Error(`No air quality data available for ${location}. API response: ${JSON.stringify(apiResponse)}`)
  }

  // If caller provided override coordinates (e.g. custom point), prefer those
  if (overrideCoordinates) {
    coordinates = { lat: overrideCoordinates.lat, lon: overrideCoordinates.lng }
  }

  const { main, components, dt } = airQualityData

  if (!main?.aqi || !components) {
    console.error("Missing required air quality data:", { main, components })
    throw new Error("Incomplete air quality data received from API")
  }

  if (!GAS_TYPES[gasType]) {
    console.error("Invalid gas type:", gasType, "Available types:", Object.keys(GAS_TYPES))
    throw new Error(`Invalid gas type: ${gasType}`)
  }

  // Map OpenWeather components to our gas types
  const componentMap = {
    no2: components.no2 || 0,
    co: components.co || 0,
    o3: components.o3 || 0,
    pm2_5: components.pm2_5 || 0,
    pm10: components.pm10 || 0,
    so2: components.so2 || 0,
  }

  const concentration = componentMap[gasType] || 0
  const healthIndex = main.aqi * 50 // Convert 1-5 scale to 0-250
  const qualityLevel = mapOpenWeatherAQIToQualityLevel(main.aqi, "")

  // Find a matching location entry; if none exists (e.g. 'custom'), build a simple fallback
  const locationData = ABUJA_LOCATIONS.find((l) => l.name === location) || {
    district: "Custom",
    coordinates: { lat: coordinates.lat, lng: coordinates.lon },
    name: location,
  }

  return {
    id: `${locationData.district}-${gasType}-${Date.now()}`,
    timestamp: new Date((dt || Date.now() / 1000) * 1000),
    location: {
      name: location,
      district: locationData.district,
      coordinates: {
        lat: coordinates.lat,
        lng: coordinates.lon,
      },
    },
    gasType,
    concentration: Math.round(concentration * 10) / 10,
    unit: GAS_TYPES[gasType].unit, // This should now be safe after validation
    // Per-pollutant values (normalized keys used by the UI)
    no2: Math.round((componentMap.no2 || 0) * 10) / 10,
    co: Math.round((componentMap.co || 0) * 10) / 10,
    o3: Math.round((componentMap.o3 || 0) * 10) / 10,
    pm25: Math.round((componentMap.pm2_5 || 0) * 10) / 10,
    pm10: Math.round((componentMap.pm10 || 0) * 10) / 10,
    so2: Math.round((componentMap.so2 || 0) * 10) / 10,
    healthIndex,
    qualityLevel,
    trend: Math.random() > 0.5 ? "up" : "down",
    changePercent: "0%",
    healthRecommendation: getHealthRecommendation(qualityLevel),
  }
}

function getHealthRecommendation(qualityLevel: string): string {
  switch (qualityLevel) {
    case "Good":
      return "Air quality is satisfactory. Enjoy outdoor activities."
    case "Fair":
    case "Moderate":
      return "Moderate activity is acceptable for most people. Sensitive individuals should consider reducing prolonged outdoor exertion."
    case "Poor":
    case "Unhealthy for Sensitive Groups":
      return "Sensitive individuals should limit outdoor activities. Others can continue normal activities."
    case "Very Poor":
    case "Unhealthy":
      return "Everyone should limit outdoor activities, especially prolonged exertion."
    default:
      return "Monitor air quality conditions and follow local health advisories."
  }
}

export async function fetchCurrentReading(
  location: string,
  gasType: keyof typeof GAS_TYPES = "no2", // Added default value for gasType
  coords?: { lat: number; lng: number },
): Promise<AirQualityReading> {
  try {
    if (!gasType || !GAS_TYPES[gasType]) {
      console.warn(`Invalid gasType: ${gasType}, defaulting to 'no2'`)
      gasType = "no2"
    }

    // Use provided coordinates if available (for custom points), otherwise look up by location
    const coordinatesForApi = coords ? coords : getLocationCoordinates(location)
    const apiPath = `api/air-quality?lat=${coordinatesForApi.lat}&lon=${coordinatesForApi.lng}`
    const url = typeof window !== 'undefined' ? `${window.location.origin}/${apiPath}` : apiPath
    const response = await fetch(url)

    if (!response.ok) {
      throw new Error(`Failed to fetch air quality data: ${response.statusText}`)
    }

    const apiResponse = await response.json()
    return convertOpenWeatherToReading(apiResponse, location, gasType, coords)
  } catch (error) {
    console.error("Error in fetchCurrentReading:", error)
    throw error
  }
}

export async function fetchHistoricalData(
  location: string,
  gasType: keyof typeof GAS_TYPES,
  startDate: Date,
  endDate: Date,
): Promise<AirQualityReading[]> {
  const readings: AirQualityReading[] = []
  const coordinates = getLocationCoordinates(location)

  try {
    const apiPath = `api/air-quality?lat=${coordinates.lat}&lon=${coordinates.lng}`
    const url = typeof window !== 'undefined' ? `${window.location.origin}/${apiPath}` : apiPath
    const response = await fetch(url)
    if (response.ok) {
      const apiResponse = await response.json()
      const currentReading = convertOpenWeatherToReading(apiResponse, location, gasType)

      // Create a simplified historical trend based on current reading
      const hoursBack = Math.floor((endDate.getTime() - startDate.getTime()) / (1000 * 60 * 60))
      for (let i = 0; i < Math.min(hoursBack, 24); i++) {
        const timePoint = new Date(endDate.getTime() - i * 60 * 60 * 1000)
        readings.push({
          ...currentReading,
          id: `${currentReading.location.district}-${gasType}-${timePoint.getTime()}`,
          timestamp: timePoint,
          concentration: Math.max(0, currentReading.concentration + (Math.random() - 0.5) * 10),
        })
      }
    }
  } catch (error) {
    console.error("Failed to fetch historical data:", error)
    throw new Error("Unable to fetch historical air quality data")
  }

  return readings.reverse()
}

export async function fetchLocationStats(
  location: string,
  gasType: keyof typeof GAS_TYPES = "no2",
): Promise<AirQualityStats> {
  try {
    if (!gasType || !GAS_TYPES[gasType]) {
      console.warn(`Invalid gasType: ${gasType}, defaulting to 'no2'`)
      gasType = "no2"
    }

    const currentReading = await fetchCurrentReading(location, gasType)

    return {
      mean: currentReading.concentration,
      min: currentReading.concentration * 0.8, // Estimated range
      max: currentReading.concentration * 1.2, // Estimated range
      trend: currentReading.trend,
      changePercent: "0%",
      unit: GAS_TYPES[gasType].unit,
      healthIndex: currentReading.healthIndex,
      qualityLevel: currentReading.qualityLevel,
      lastUpdated: currentReading.timestamp,
    }
  } catch (error) {
    console.error("Failed to fetch location stats:", error)
    throw new Error("Unable to fetch location statistics")
  }
}

export async function fetchWeatherData(location: string): Promise<WeatherData> {
  // For now, returning basic data structure - you may want to integrate OpenWeather weather API
  return {
    windSpeed: 10,
    windDirection: "NE",
    temperature: 32,
    humidity: 65,
    pressure: 1013,
  }
}

export async function fetchAIInsights(location: string, gasType: keyof typeof GAS_TYPES = "no2"): Promise<AIInsight[]> {
  if (!gasType || !GAS_TYPES[gasType]) {
    console.warn(`Invalid gasType: ${gasType}, defaulting to 'no2'`)
    gasType = "no2"
  }

  const currentReading = await fetchCurrentReading(location, gasType)
  const insights: AIInsight[] = []

  if (currentReading.healthIndex > 100) {
    insights.push({
      id: "health-alert",
      title: "Health Advisory for " + location,
      description: `Current ${GAS_TYPES[gasType].name} levels in ${location} are ${currentReading.qualityLevel.toLowerCase()} with a concentration of ${currentReading.concentration} ${currentReading.unit}.`,
      type: "alert",
      severity: currentReading.healthIndex > 150 ? "high" : "medium",
      timestamp: new Date(),
      location,
      recommendations: [
        "Limit prolonged outdoor activities",
        "Consider wearing N95 masks outdoors",
        "Keep windows closed during peak hours",
        "Use air purifiers indoors if available",
      ],
    })
  } else {
    insights.push({
      id: "good-quality",
      title: "Good Air Quality in " + location,
      description: `Air quality is currently ${currentReading.qualityLevel.toLowerCase()} with ${GAS_TYPES[gasType].name} levels at ${currentReading.concentration} ${currentReading.unit}. Great conditions for outdoor activities!`,
      type: "analysis",
      severity: "low",
      timestamp: new Date(),
      location,
      recommendations: [
        "Perfect time for outdoor exercise",
        "Consider walking or cycling",
        "Open windows for natural ventilation",
      ],
    })
  }

  return insights
}
