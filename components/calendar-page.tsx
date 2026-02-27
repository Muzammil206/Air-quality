"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { ChevronLeft, ChevronRight, Activity, CalendarIcon, Map, Settings, Download } from "lucide-react"
import { cn } from "@/lib/utils"
import Link from "next/link"

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
  "January","February","March","April","May","June",
  "July","August","September","October","November","December",
]

// Abbreviated day names for narrow screens
const dayNamesFull = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"]
const dayNamesShort = ["S", "M", "T", "W", "T", "F", "S"]

export default function CalendarPage() {
  const [selectedGas, setSelectedGas] = useState("pm25_ugm3")
  const [currentDate, setCurrentDate] = useState(new Date())
  const [geoJsonData, setGeoJsonData] = useState<GeoJsonData | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [tooltipDay, setTooltipDay] = useState<number | null>(null)

  const fetchGeoJsonData = async () => {
    try {
      setLoading(true)
      const response = await fetch("/api/getGeojson")
      if (!response.ok) throw new Error("Failed to fetch data")
      const data = await response.json()
      setGeoJsonData(data)
      setError(null)
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to fetch data")
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => { fetchGeoJsonData() }, [])

  const generateCalendarData = () => {
    if (!geoJsonData) return {}
    const year = currentDate.getFullYear()
    const month = currentDate.getMonth()
    const daysInMonth = new Date(year, month + 1, 0).getDate()
    const calendarData: { [key: number]: number } = {}
    const gasInfo = gasTypes.find((g) => g.key === selectedGas)
    if (!gasInfo) return {}

    const baseValue =
      geoJsonData.features.reduce((sum, feature) => {
        return sum + (feature.properties[selectedGas as keyof typeof feature.properties] as number)
      }, 0) / geoJsonData.features.length

    for (let day = 1; day <= daysInMonth; day++) {
      const variation = Math.sin((day / daysInMonth) * Math.PI * 2) * 0.3 + Math.random() * 0.4 - 0.2
      calendarData[day] = Math.max(0, baseValue * (1 + variation))
    }
    return calendarData
  }

  const getAirQualityColor = (value: number, gasKey: string) => {
    const gasInfo = gasTypes.find((g) => g.key === gasKey)
    if (!gasInfo) return "bg-gray-500"
    const ratio = value / gasInfo.max
    if (gasKey === "pm25_ugm3") {
      if (ratio < 0.08) return "bg-emerald-500"
      if (ratio < 0.23) return "bg-green-500"
      if (ratio < 0.37) return "bg-yellow-500"
      if (ratio < 1.0) return "bg-orange-500"
      return "bg-red-500"
    }
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
      newDate.setMonth(prev.getMonth() + (direction === "next" ? 1 : -1))
      return newDate
    })
  }

  const selectedGasInfo = gasTypes.find((g) => g.key === selectedGas)

  return (
    // pb-20 md:pb-0 clears the mobile bottom nav bar
    <div className="min-h-[100dvh] bg-background pb-20 md:pb-0">

      {/* ── Top Header ── */}
      <div className="border-b border-border bg-card sticky top-0 z-20">
        <div className="max-w-7xl mx-auto px-3 sm:px-6 py-3 sm:py-4">
          <div className="flex items-center justify-between gap-2">

            {/* Brand + view switcher */}
            <div className="flex items-center gap-2 sm:gap-4 min-w-0">
              <div className="flex items-center gap-2 shrink-0">
                <div className="w-7 h-7 sm:w-8 sm:h-8 bg-primary rounded-lg flex items-center justify-center">
                  <Activity className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-primary-foreground" />
                </div>
                {/* On mobile only show short title */}
                <div className="hidden xs:block">
                  <h1 className="text-base sm:text-xl font-semibold italic text-[#00A7B3FF] leading-tight">EcoMonitor</h1>
                  <p className="text-xs font-semibold italic text-[#00A7B3FF] leading-tight hidden sm:block">Air Quality Calendar</p>
                </div>
              </div>

              {/* Map / Calendar toggle */}
              <div className="flex bg-secondary rounded-lg p-0.5 sm:p-1">
                <Link href="/dashboard/map">
                  <Button
                    variant="ghost"
                    size="sm"
                    className="px-2 sm:px-4 py-1.5 sm:py-2 text-xs sm:text-sm font-medium text-muted-foreground hover:text-foreground hover:bg-accent h-7 sm:h-9"
                  >
                    <Map className="w-3.5 h-3.5 sm:w-4 sm:h-4 sm:mr-2" />
                    <span className="hidden sm:inline">Map View</span>
                  </Button>
                </Link>
                <Button
                  variant="default"
                  size="sm"
                  className="px-2 sm:px-4 py-1.5 sm:py-2 text-xs sm:text-sm bg-cyan-500 hover:bg-cyan-600 text-white border-cyan-500 h-7 sm:h-9"
                >
                  <CalendarIcon className="w-3.5 h-3.5 sm:w-4 sm:h-4 sm:mr-2" />
                  <span className="hidden sm:inline">Calendar</span>
                </Button>
              </div>
            </div>

            {/* Action icons */}
            <div className="flex items-center gap-1">
              <Button variant="ghost" size="sm" className="p-1.5 sm:p-2 hover:bg-accent h-8 w-8 sm:h-9 sm:w-9">
                <Download className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
              </Button>
              <Button variant="ghost" size="sm" className="p-1.5 sm:p-2 hover:bg-accent h-8 w-8 sm:h-9 sm:w-9">
                <Settings className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* ── Main content ── */}
      <div className="max-w-4xl mx-auto px-3 sm:px-6 py-4 sm:py-6">
        {loading && (
          <div className="text-center py-12">
            <div className="text-muted-foreground text-sm">Loading air quality data...</div>
          </div>
        )}

        {error && (
          <div className="text-center py-12">
            <div className="text-destructive text-sm">Error: {error}</div>
          </div>
        )}

        {!loading && !error && (
          <Card className="bg-gray-900 text-white p-3 sm:p-6">

            {/* Month nav header */}
            <div className="flex items-center justify-between mb-4 sm:mb-6 gap-2">
              <h2 className="text-base sm:text-2xl font-bold leading-tight">
                {/* Short month on mobile */}
                <span className="sm:hidden">{monthNames[month].slice(0, 3)} {year}</span>
                <span className="hidden sm:inline">Air Quality Calendar — {monthNames[month]} {year}</span>
              </h2>
              <div className="flex items-center gap-1 shrink-0">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => navigateMonth("prev")}
                  className="text-white hover:bg-gray-800 h-8 w-8 p-0"
                >
                  <ChevronLeft className="w-4 h-4" />
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => navigateMonth("next")}
                  className="text-white hover:bg-gray-800 h-8 w-8 p-0"
                >
                  <ChevronRight className="w-4 h-4" />
                </Button>
              </div>
            </div>

            {/* Gas selector — scrollable row on mobile */}
            <div className="flex gap-1.5 sm:gap-2 mb-4 sm:mb-6 overflow-x-auto pb-1 -mx-1 px-1 scrollbar-hide">
              {gasButtons.map((gas) => (
                <Button
                  key={gas.key}
                  variant={selectedGas === gas.key ? "default" : "secondary"}
                  size="sm"
                  onClick={() => setSelectedGas(gas.key)}
                  className={cn(
                    "px-3 sm:px-4 py-1.5 text-xs sm:text-sm font-medium shrink-0 h-7 sm:h-9",
                    selectedGas === gas.key
                      ? "bg-blue-600 text-white hover:bg-blue-700"
                      : "bg-gray-700 text-gray-300 hover:bg-gray-600"
                  )}
                >
                  {gas.label}
                </Button>
              ))}
            </div>

            {/* Calendar grid */}
            <div className="space-y-1 sm:space-y-2">
              {/* Day name headers */}
              <div className="grid grid-cols-7 gap-1 sm:gap-2">
                {dayNamesFull.map((day, i) => (
                  <div key={day} className="text-center py-1">
                    {/* Full name on sm+, single letter on mobile */}
                    <span className="hidden sm:inline text-xs sm:text-sm font-medium text-gray-400">{day}</span>
                    <span className="sm:hidden text-[10px] font-medium text-gray-400">{dayNamesShort[i]}</span>
                  </div>
                ))}
              </div>

              {/* Day cells */}
              <div className="grid grid-cols-7 gap-1 sm:gap-2">
                {Array.from({ length: firstDayOfMonth }, (_, i) => (
                  <div key={`empty-${i}`} className="aspect-square" />
                ))}

                {Array.from({ length: daysInMonth }, (_, i) => {
                  const day = i + 1
                  const value = calendarData[day] || 0
                  const colorClass = getAirQualityColor(value, selectedGas)
                  const isTooltipVisible = tooltipDay === day

                  return (
                    <div
                      key={day}
                      className="relative aspect-square"
                      onMouseEnter={() => setTooltipDay(day)}
                      onMouseLeave={() => setTooltipDay(null)}
                      onTouchStart={() => setTooltipDay(day)}
                      onTouchEnd={() => setTimeout(() => setTooltipDay(null), 1500)}
                    >
                      <div
                        className={cn(
                          "w-full h-full rounded-md sm:rounded-lg flex items-center justify-center text-white font-semibold cursor-pointer hover:opacity-80 active:opacity-70 transition-opacity text-xs sm:text-base",
                          colorClass
                        )}
                      >
                        {day}
                      </div>

                      {/* Tap/hover tooltip */}
                      {isTooltipVisible && (
                        <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-1 z-30 bg-gray-800 text-white text-[10px] sm:text-xs rounded px-2 py-1 whitespace-nowrap shadow-lg pointer-events-none">
                          {value.toFixed(1)} {selectedGasInfo?.unit}
                        </div>
                      )}
                    </div>
                  )
                })}
              </div>
            </div>

            {/* Legend */}
            <div className="mt-4 sm:mt-6 pt-3 sm:pt-4 border-t border-gray-700">
              <div className="text-xs sm:text-sm text-gray-400 mb-2">Air Quality Levels</div>
              {/* Wraps to 2 rows on very small screens */}
              <div className="flex flex-wrap gap-x-3 gap-y-1.5 sm:gap-4">
                {[
                  { color: "bg-emerald-500", label: "Excellent" },
                  { color: "bg-green-500", label: "Good" },
                  { color: "bg-yellow-500", label: "Moderate" },
                  { color: "bg-orange-500", label: "Unhealthy" },
                  { color: "bg-red-500", label: "Hazardous" },
                ].map(({ color, label }) => (
                  <div key={label} className="flex items-center gap-1.5">
                    <div className={`w-3 h-3 sm:w-4 sm:h-4 ${color} rounded shrink-0`} />
                    <span className="text-[11px] sm:text-sm">{label}</span>
                  </div>
                ))}
              </div>
            </div>
          </Card>
        )}
      </div>
    </div>
  )
}