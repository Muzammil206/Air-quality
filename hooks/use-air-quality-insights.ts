"use client"

import { useState, useEffect } from 'react'
import { ABUJA_LOCATIONS } from '@/lib/types'
import type { GAS_TYPES } from '@/lib/types'

interface AirQualityInsightData {
  type: "FeatureCollection"
  features: Array<{
    type: "Feature"
    geometry: {
      type: "Point"
      coordinates: [number, number]
    }
    properties: {
      air_quality_index: number
      aqi_description: string
      components: Record<string, number>
      timestamp: number
      location: {
        lat: number
        lon: number
      }
    }
  }>
}

export function useAirQualityInsights(
  selectedLocation: string,
  selectedGas: keyof typeof GAS_TYPES
) {
  const [apiData, setApiData] = useState<AirQualityInsightData | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const locationData = ABUJA_LOCATIONS.find(l => l.name === selectedLocation) || ABUJA_LOCATIONS[0]

    const fetchData = async () => {
      setIsLoading(true)
      setError(null)
      
      try {
        const response = await fetch(
          `/api/air-quality?lat=${locationData.coordinates.lat}&lon=${locationData.coordinates.lng}`
        )
        const data = await response.json()
        
        if (!data || !data.list || !data.list[0] || !data.list[0].main || !data.list[0].components) {
          throw new Error('Invalid API response format')
        }

        const { main, components, dt } = data.list[0]
        
        // Ensure all required gas types are present with proper typing
        const gasConcentrations: Record<string, number> = {
          co: Number(components.co) || 0,
          no2: Number(components.no2) || 0,
          o3: Number(components.o3) || 0,
          so2: Number(components.so2) || 0,
          pm2_5: Number(components.pm2_5) || 0,
          pm10: Number(components.pm10) || 0,
          nh3: Number(components.nh3) || 0
        }

        // Type-safe AQI mapping
        const getAqiDescription = (aqi: number): string => {
          switch (aqi) {
            case 1: return "Good"
            case 2: return "Fair"
            case 3: return "Moderate"
            case 4: return "Poor"
            case 5: return "Very Poor"
            default: return "Moderate"
          }
        }

        setApiData({
          type: "FeatureCollection",
          features: [{
            type: "Feature",
            geometry: {
              type: "Point",
              coordinates: [locationData.coordinates.lng, locationData.coordinates.lat]
            },
            properties: {
              air_quality_index: main.aqi,
              aqi_description: getAqiDescription(main.aqi),
              components: gasConcentrations,
              timestamp: dt * 1000,
              location: {
                lat: locationData.coordinates.lat,
                lon: locationData.coordinates.lng
              }
            }
          }]
        })
      } catch (err) {
        console.error('Failed to fetch air quality data:', err)
        setError(err instanceof Error ? err.message : 'Failed to fetch air quality data')
      } finally {
        setIsLoading(false)
      }
    }

    fetchData()
    // Refresh every 5 minutes
    const interval = setInterval(fetchData, 5 * 60 * 1000)
    return () => clearInterval(interval)
  }, [selectedLocation, selectedGas])

  return {
    data: apiData,
    isLoading,
    error
  }
}
