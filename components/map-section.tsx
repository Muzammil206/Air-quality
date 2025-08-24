"use client"

import "mapbox-gl/dist/mapbox-gl.css"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { MapPin, Layers, Satellite, Wind, Loader2, AlertTriangle, RefreshCw } from "lucide-react"
import { useEffect, useRef, useState } from "react"
import { ABUJA_LOCATIONS } from "@/lib/types"
import { fetchCurrentReading } from "@/lib/air-quality-api"

interface DistrictData {
  id: string
  name: string
  type: string
  coordinates: [number, number] // [lng, lat] for Mapbox
  aqi: number
  level: string
  color: string
  error?: boolean
}

interface MapSectionProps {
  selectedLocation?: string
  onLocationSelect?: (location: string) => void
}

export function MapSection({ selectedLocation, onLocationSelect }: MapSectionProps) {
  const mapRef = useRef<HTMLDivElement>(null)
  const mapInstanceRef = useRef<any>(null)
  const [isLoading, setIsLoading] = useState()
  const [mapLoaded, setMapLoaded] = useState(false)
  const [showSatellite, setShowSatellite] = useState(false)
  const [districtsData, setDistrictsData] = useState<DistrictData[]>([])
  const [dataError, setDataError] = useState<string | null>(null)
  const [dataLoading, setDataLoading] = useState(true)

  const getAQIColor = (healthIndex: number): { color: string; level: string } => {
    if (healthIndex <= 50) return { color: "#10b981", level: "Good" }
    if (healthIndex <= 100) return { color: "#f59e0b", level: "Moderate" }
    if (healthIndex <= 150) return { color: "#f97316", level: "Unhealthy for Sensitive Groups" }
    if (healthIndex <= 200) return { color: "#ef4444", level: "Unhealthy" }
    if (healthIndex <= 300) return { color: "#8b5cf6", level: "Very Unhealthy" }
    return { color: "#7c2d12", level: "Hazardous" }
  }

  const fetchDistrictsData = async () => {
    setDataLoading(true)
    setDataError(null)
    const districts: DistrictData[] = []

    for (const location of ABUJA_LOCATIONS) {
      try {
        const reading = await fetchCurrentReading(location.name, "no2")
        const { color, level } = getAQIColor(reading.healthIndex)

        districts.push({
          id: location.district.toLowerCase().replace(/\s+/g, "-"),
          name: location.name,
          type: location.district,
          coordinates: [location.coordinates.lng, location.coordinates.lat],
          aqi: Math.round(reading.healthIndex),
          level,
          color,
          error: false,
        })
      } catch (error) {
        console.error(`Failed to fetch data for ${location.name}:`, error)
        districts.push({
          id: location.district.toLowerCase().replace(/\s+/g, "-"),
          name: location.name,
          type: location.district,
          coordinates: [location.coordinates.lng, location.coordinates.lat],
          aqi: 50, // Fallback AQI
          level: "Moderate",
          color: "#f59e0b",
          error: true,
        })
      }
    }

    setDistrictsData(districts)
    setDataLoading(false)
  }

  useEffect(() => {
    fetchDistrictsData().catch((error) => {
      console.error("Failed to fetch districts data:", error)
      setDataError("Failed to load air quality data")
      setDataLoading(false)
    })
  }, [])

  useEffect(() => {
    if (!mapLoaded || dataLoading || !mapInstanceRef.current || districtsData.length === 0) {
      return
    }

    const existingMarkers = document.querySelectorAll(".mapboxgl-marker")
    existingMarkers.forEach((marker) => marker.remove())

    districtsData.forEach((district) => {
      const markerElement = document.createElement("div")
      markerElement.style.cssText = `
        background-color: ${district.color};
        width: 24px;
        height: 24px;
        border-radius: 50%;
        border: 3px solid white;
        box-shadow: 0 2px 8px rgba(0,0,0,0.3);
        display: flex;
        align-items: center;
        justify-content: center;
        font-weight: bold;
        font-size: 10px;
        color: white;
        cursor: pointer;
        ${district.error ? "opacity: 0.7; border-color: #fbbf24;" : ""}
      `
      markerElement.textContent = district.aqi.toString()

      const popupContent = `
        <div style="min-width: 200px; font-family: system-ui;">
          <h3 style="margin: 0 0 8px 0; color: #1f2937; font-size: 16px; font-weight: 600;">
            ${district.name}
            ${district.error ? '<span style="color: #f59e0b; font-size: 12px;"> (Estimated)</span>' : ""}
          </h3>
          <p style="margin: 0 0 12px 0; color: #6b7280; font-size: 12px;">
            ${district.type}
          </p>
          <div style="display: flex; align-items: center; gap: 8px; margin-bottom: 8px;">
            <div style="
              background-color: ${district.color};
              color: white;
              padding: 4px 8px;
              border-radius: 12px;
              font-size: 12px;
              font-weight: 600;
            ">
              AQI: ${district.aqi}
            </div>
            <span style="color: ${district.color}; font-weight: 600; font-size: 14px;">
              ${district.level}
            </span>
          </div>
          <p style="margin: 0; color: #4b5563; font-size: 12px;">
            ${district.error ? "Data temporarily unavailable. Showing estimated values." : "Click to select this location for detailed analysis"}
          </p>
        </div>
      `

      const mapboxgl = require("mapbox-gl")
      const popup = new mapboxgl.Popup({ offset: 25 }).setHTML(popupContent)

      const marker = new mapboxgl.Marker(markerElement)
        .setLngLat(district.coordinates)
        .setPopup(popup)
        .addTo(mapInstanceRef.current)

      markerElement.addEventListener("click", () => {
        if (onLocationSelect) {
          onLocationSelect(district.name)
        }
      })

      if (selectedLocation?.includes(district.name)) {
        popup.addTo(mapInstanceRef.current)
      }
    })
  }, [mapLoaded, dataLoading, districtsData, selectedLocation, onLocationSelect])

  useEffect(() => {
    let mounted = true

    const initializeMap = async () => {
      if (!mapRef.current || mapInstanceRef.current) return

      try {
        const mapboxgl = await import("mapbox-gl")

        mapboxgl.default.accessToken =
          process.env.NEXT_PUBLIC_MAPBOX_API_KEY

        if (!mounted) return

        const map = new mapboxgl.default.Map({
          container: mapRef.current,
          style: showSatellite ? "mapbox://styles/mapbox/satellite-v9" : "mapbox://styles/mapbox/streets-v11",
          center: [7.3986, 9.0765], // [lng, lat] for Abuja
          zoom: 10,
        })

        map.on("load", () => {
          if (!mounted) return
          setMapLoaded(true)
          
        })

        mapInstanceRef.current = map
      } catch (error) {
        console.error("Error initializing map:", error)
        setDataError("Failed to initialize map. Please check your connection.")
        
      }
    }

    initializeMap()

    return () => {
      mounted = false
      if (mapInstanceRef.current) {
        mapInstanceRef.current.remove()
        mapInstanceRef.current = null
      }
    }
  }, [showSatellite])

  const retryDataLoad = async () => {
    await fetchDistrictsData()
  }

  const toggleSatellite = () => {
    if (mapInstanceRef.current) {
      const newStyle = showSatellite ? "mapbox://styles/mapbox/streets-v11" : "mapbox://styles/mapbox/satellite-v9"
      mapInstanceRef.current.setStyle(newStyle)
      setShowSatellite(!showSatellite)
    }
  }

  if (isLoading) {
    return (
      <Card className="border-2 border-gray-700 shadow-xl bg-gray-800/90 backdrop-blur-sm h-full">
        <CardHeader className="pb-3">
          <CardTitle className="flex items-center gap-2 text-xl text-white">
            <div className="w-8 h-8 bg-blue-500/20 border border-blue-500/30 rounded-lg flex items-center justify-center">
              <MapPin className="w-5 h-5 text-blue-400" />
            </div>
            Abuja Air Quality Map
            <Badge className="bg-green-500/20 text-green-300 border-green-500/30 ml-2">Real-time</Badge>
          </CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          <div className="h-[calc(100vh-12rem)] bg-gradient-to-br from-gray-800 via-gray-700 to-gray-800 flex items-center justify-center">
            <div className="text-center">
              <Loader2 className="w-12 h-12 animate-spin text-blue-400 mx-auto mb-4" />
              <p className="text-white font-medium">Loading interactive map...</p>
              <p className="text-gray-400 text-sm mt-2">Initializing Mapbox</p>
            </div>
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card className="border-2 border-gray-700 shadow-xl bg-gray-800/90 backdrop-blur-sm h-full">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2 text-xl text-white">
            <div className="w-8 h-8 bg-blue-500/20 border border-blue-500/30 rounded-lg flex items-center justify-center">
              <MapPin className="w-5 h-5 text-blue-400" />
            </div>
            Abuja Air Quality Map
            <Badge className="bg-green-500/20 text-green-300 border-green-500/30 ml-2">Real-time</Badge>
          </CardTitle>
          <div className="flex gap-2">
            <Button
              variant="outline"
              size="sm"
              className="border-gray-600 text-gray-300 hover:bg-gray-700 hover:text-white bg-transparent"
            >
              <Layers className="w-4 h-4 mr-1" />
              Layers
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={toggleSatellite}
              className={`border-gray-600 hover:bg-gray-700 hover:text-white bg-transparent ${showSatellite ? "text-blue-400" : "text-gray-300"}`}
            >
              <Satellite className="w-4 h-4 mr-1" />
              Satellite
            </Button>
          </div>
        </div>
      </CardHeader>
      <CardContent className="p-0">
        <div className="relative h-[calc(100vh-12rem)] border-t border-gray-600">
          <div ref={mapRef} className="w-full h-full" />

          {dataLoading && (
            <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 bg-gray-800/90 backdrop-blur-sm rounded-lg p-4 border border-gray-600 z-[1000]">
              <div className="flex items-center gap-3">
                <Loader2 className="w-5 h-5 animate-spin text-blue-400" />
                <span className="text-white text-sm">Loading air quality data...</span>
              </div>
            </div>
          )}

          {dataError && !dataLoading && (
            <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 bg-gray-800/90 backdrop-blur-sm rounded-lg p-4 border border-red-600 z-[1000]">
              <div className="text-center">
                <AlertTriangle className="w-8 h-8 text-red-400 mx-auto mb-2" />
                <p className="text-red-300 text-sm mb-3">{dataError}</p>
                <Button onClick={retryDataLoad} size="sm" className="bg-blue-600 hover:bg-blue-700">
                  <RefreshCw className="w-4 h-4 mr-2" />
                  Retry
                </Button>
              </div>
            </div>
          )}

          <div className="absolute bottom-4 left-4 bg-gray-800/90 backdrop-blur-sm rounded-lg p-3 border border-gray-600 z-[1000]">
            <h4 className="text-white font-medium text-sm mb-2">Air Quality Index</h4>
            <div className="space-y-1">
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 bg-green-500 rounded-full" />
                <span className="text-xs text-gray-300">Good (0-50)</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 bg-yellow-500 rounded-full" />
                <span className="text-xs text-gray-300">Moderate (51-100)</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 bg-orange-500 rounded-full" />
                <span className="text-xs text-gray-300">Unhealthy (101-150)</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 bg-red-500 rounded-full" />
                <span className="text-xs text-gray-300">Very Unhealthy (151+)</span>
              </div>
            </div>
          </div>
          <div className="absolute top-4 left-4 bg-gray-800/90 backdrop-blur-sm rounded-lg p-2 border border-gray-600 z-[1000]">
            <span className="text-xs text-gray-300">
              {dataLoading ? "Loading..." : `${districtsData.length} Monitoring Stations`}
            </span>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
