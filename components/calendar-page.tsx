"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { ChevronLeft, ChevronRight, Activity, CalendarIcon, Map, Settings, Download } from "lucide-react"
import { cn } from "@/lib/utils"
import Link from "next/link"
import { SidebarNavigation } from "@/components/sidebar-navigation"

interface GeoJsonFeature {
  type: string
  geometry: {
    type: string
    coordinates: [number, number]
  }
  properties: {
    id: number
    location: string
    co2_ppm: number
    co_ppm: number
    hcho_mgm3: number
    pm25_ugm3: number
    pm10_ugm3: number
    water_vapour: number
    temperature_c: number
    humidity_percent: number
    timestamp?: string
  }
}

interface GeoJsonData {
  type: string
  features: GeoJsonFeature[]
}

const gasTypes = [
  { key: "pm25_ugm3", label: "PM2.5", unit: "μg/m³", max: 150 },
  { key: "pm10_ugm3", label: "PM10", unit: "μg/m³", max: 200 },
  { key: "co2_ppm", label: "CO₂", unit: "ppm", max: 1000 },
  { key: "co_ppm", label: "CO", unit: "ppm", max: 50 },
  { key: "hcho_mgm3", label: "HCHO", unit: "mg/m³", max: 0.01 },
  { key: "temperature_c", label: "Temperature", unit: "°C", max: 45 },
]

const gasButtons = [
  { key: "pm25_ugm3", label: "PM2.5" },
  { key: "pm10_ugm3", label: "PM10" },
  { key: "co2_ppm", label: "CO₂" },
  { key: "co_ppm", label: "CO" },
  { key: "hcho_mgm3", label: "HCHO" },
  { key: "temperature_c", label: "TEMP" },
]

const monthNames = [
  "January",
  "February",
  "March",
  "April",
  "May",
  "June",
  "July",
  "August",
  "September",
  "October",
  "November",
  "December",
]

const dayNames = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"]

export default function CalendarPage() {
  const [selectedGas, setSelectedGas] = useState("pm25_ugm3")
  const [currentDate, setCurrentDate] = useState(new Date())
  const [geoJsonData, setGeoJsonData] = useState<GeoJsonData | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const fetchGeoJsonData = async () => {
    try {
      setLoading(true)
      const response = await fetch("/api/getGeojson")
      if (!response.ok) {
        throw new Error("Failed to fetch data")
      }
      const data = await response.json()
      setGeoJsonData(data)
      setError(null)
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to fetch data")
      console.error("Error fetching GeoJSON data:", err)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchGeoJsonData()
  }, [])

  const generateCalendarData = () => {
    if (!geoJsonData) return {}

    const year = currentDate.getFullYear()
    const month = currentDate.getMonth()
    const daysInMonth = new Date(year, month + 1, 0).getDate()
    const calendarData: { [key: number]: number } = {}

    // Calculate average values for the selected gas type
    const gasInfo = gasTypes.find((g) => g.key === selectedGas)
    if (!gasInfo) return {}

    const baseValue =
      geoJsonData.features.reduce((sum, feature) => {
        return sum + (feature.properties[selectedGas as keyof typeof feature.properties] as number)
      }, 0) / geoJsonData.features.length

    // Generate daily variations (simulate historical data)
    for (let day = 1; day <= daysInMonth; day++) {
      // Create some variation based on day of month and selected gas
      const variation = Math.sin((day / daysInMonth) * Math.PI * 2) * 0.3 + Math.random() * 0.4 - 0.2
      const dailyValue = Math.max(0, baseValue * (1 + variation))
      calendarData[day] = dailyValue
    }

    return calendarData
  }

  const getAirQualityColor = (value: number, gasKey: string) => {
    const gasInfo = gasTypes.find((g) => g.key === gasKey)
    if (!gasInfo) return "bg-gray-500"

    const ratio = value / gasInfo.max

    if (gasKey === "pm25_ugm3") {
      if (ratio < 0.08) return "bg-emerald-500" // Excellent < 12
      if (ratio < 0.23) return "bg-green-500" // Good < 35
      if (ratio < 0.37) return "bg-yellow-500" // Moderate < 55
      if (ratio < 1.0) return "bg-orange-500" // Unhealthy < 150
      return "bg-red-500" // Hazardous
    }

    // General color scale for other gases
    if (ratio < 0.2) return "bg-emerald-500"
    if (ratio < 0.4) return "bg-green-500"
    if (ratio < 0.6) return "bg-yellow-500"
    if (ratio < 0.8) return "bg-orange-500"
    return "bg-red-500"
  }

  const calendarData = generateCalendarData()
  const year = currentDate.getFullYear()
  const month = currentDate.getMonth()
  const firstDayOfMonth = new Date(year, month, 1).getDay()
  const daysInMonth = new Date(year, month + 1, 0).getDate()

  const navigateMonth = (direction: "prev" | "next") => {
    setCurrentDate((prev) => {
      const newDate = new Date(prev)
      if (direction === "prev") {
        newDate.setMonth(prev.getMonth() - 1)
      } else {
        newDate.setMonth(prev.getMonth() + 1)
      }
      return newDate
    })
  }

  return (
    <div className="min-h-screen bg-background">
      
      <div className="border-b border-border bg-card">
        
        <div className="max-w-7xl mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center">
                  <Activity className="w-4 h-4 text-primary-foreground" />
                </div>
                <div>
                  <h1 className="text-xl font-semibold italic text-[#00A7B3FF]">EcoMonitor</h1>
                  <h1 className="text-sm  font-semibold italic text-[#00A7B3FF]" >Air Quality Calendar</h1>
                </div>
              </div>

              <div className="flex bg-secondary rounded-lg p-1">
                <Link href="/dashboard/map">
                  <Button
                    variant="ghost"
                    size="sm"
                    className="px-4 py-2 text-sm font-medium text-muted-foreground hover:text-foreground hover:bg-accent"
                  >
                    <Map className="w-4 h-4 mr-2" />
                    Map View
                  </Button>
                </Link>
                <Button
                  variant="default"
                  size="sm"
                  className="px-4 py-2 text-sm font-medium bg-primary text-primary-foreground shadow-sm"
                >
                  <CalendarIcon className="w-4 h-4 mr-2" />
                  Calendar
                </Button>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <Button variant="ghost" size="sm" className="p-2 hover:bg-accent">
                <Download className="w-4 h-4" />
              </Button>
              <Button variant="ghost" size="sm" className="p-2 hover:bg-accent">
                <Settings className="w-4 h-4" />
              </Button>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-4xl mx-auto p-6">
        {loading && (
          <div className="text-center py-8">
            <div className="text-muted-foreground">Loading air quality data...</div>
          </div>
        )}

        {error && (
          <div className="text-center py-8">
            <div className="text-destructive">Error: {error}</div>
          </div>
        )}

        {!loading && !error && (
          <Card className="bg-gray-900 text-white p-6">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-2xl font-bold">
                Air Quality Calendar - {monthNames[month]} {year}
              </h2>
              <div className="flex items-center gap-2">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => navigateMonth("prev")}
                  className="text-white hover:bg-gray-800"
                >
                  <ChevronLeft className="w-4 h-4" />
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => navigateMonth("next")}
                  className="text-white hover:bg-gray-800"
                >
                  <ChevronRight className="w-4 h-4" />
                </Button>
              </div>
            </div>

            <div className="flex gap-2 mb-6 flex-wrap">
              {gasButtons.map((gas) => (
                <Button
                  key={gas.key}
                  variant={selectedGas === gas.key ? "default" : "secondary"}
                  size="sm"
                  onClick={() => setSelectedGas(gas.key)}
                  className={cn(
                    "px-4 py-2 text-sm font-medium",
                    selectedGas === gas.key
                      ? "bg-blue-600 text-white hover:bg-blue-700"
                      : "bg-gray-700 text-gray-300 hover:bg-gray-600",
                  )}
                >
                  {gas.label}
                </Button>
              ))}
            </div>

            <div className="space-y-4">
              {/* Day headers */}
              <div className="grid grid-cols-7 gap-2">
                {dayNames.map((day) => (
                  <div key={day} className="text-center text-sm font-medium text-gray-400 py-2">
                    {day}
                  </div>
                ))}
              </div>

              {/* Calendar days */}
              <div className="grid grid-cols-7 gap-2">
                {/* Empty cells for days before month starts */}
                {Array.from({ length: firstDayOfMonth }, (_, i) => (
                  <div key={`empty-${i}`} className="aspect-square" />
                ))}

                {/* Days of the month */}
                {Array.from({ length: daysInMonth }, (_, i) => {
                  const day = i + 1
                  const value = calendarData[day] || 0
                  const colorClass = getAirQualityColor(value, selectedGas)

                  return (
                    <div
                      key={day}
                      className={cn(
                        "aspect-square rounded-lg flex items-center justify-center text-white font-semibold text-lg cursor-pointer hover:opacity-80 transition-opacity",
                        colorClass,
                      )}
                      title={`${day} ${monthNames[month]}: ${value.toFixed(1)} ${gasTypes.find((g) => g.key === selectedGas)?.unit}`}
                    >
                      {day}
                    </div>
                  )
                })}
              </div>
            </div>

            <div className="mt-6 pt-4 border-t border-gray-700">
              <div className="text-sm text-gray-400 mb-2">Air Quality Levels</div>
              <div className="flex gap-4 flex-wrap">
                <div className="flex items-center gap-2">
                  <div className="w-4 h-4 bg-emerald-500 rounded" />
                  <span className="text-sm">Excellent</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-4 h-4 bg-green-500 rounded" />
                  <span className="text-sm">Good</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-4 h-4 bg-yellow-500 rounded" />
                  <span className="text-sm">Moderate</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-4 h-4 bg-orange-500 rounded" />
                  <span className="text-sm">Unhealthy</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-4 h-4 bg-red-500 rounded" />
                  <span className="text-sm">Hazardous</span>
                </div>
              </div>
            </div>
          </Card>
        )}
      </div>
    </div>
  )
}
