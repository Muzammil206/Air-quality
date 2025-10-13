"use client"

import { useState, useEffect, useRef } from "react"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Download, ChevronDown, ChevronRight, MapPin, Eye, FileDown, ImageIcon } from "lucide-react"
import { cn } from "@/lib/utils"
import html2canvas from "html2canvas"
import jsPDF from "jspdf"

declare global {
  interface Window {
    L: any
  }
}

interface FilterState {
  states: string[]
  gasTypes: string[]
  showAllStates: boolean
}

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
    state: string
    uploader_name?: string
    upload_time?: string
  }
}

interface GeoJsonData {
  type: string
  features: GeoJsonFeature[]
}

const mapViewTypes = [
  { id: "points", label: "Points" },
  { id: "heatmap", label: "Heatmap" },
]

const legendItems = [
  { color: "bg-green-500", label: "Good Air Quality", range: "PM2.5 < 35" },
  { color: "bg-yellow-500", label: "Moderate", range: "PM2.5 35-75" },
  { color: "bg-orange-500", label: "Unhealthy", range: "PM2.5 75-115" },
  { color: "bg-red-500", label: "Very Unhealthy", range: "PM2.5 115-150" },
  { color: "bg-purple-600", label: "Hazardous", range: "PM2.5 > 150" },
]

const gasTypes = [
  { key: "pm25_ugm3", label: "PM2.5", unit: "μg/m³" },
  { key: "pm10_ugm3", label: "PM10", unit: "μg/m³" },
  { key: "co2_ppm", label: "CO₂", unit: "ppm" },
  { key: "co_ppm", label: "CO", unit: "ppm" },
  { key: "hcho_mgm3", label: "HCHO", unit: "mg/m³" },
]

export default function MapPage() {
  const [expandedStates, setExpandedStates] = useState<string[]>([])
  const [activeMapView, setActiveMapView] = useState("points")
  const [mapStyle, setMapStyle] = useState("Street")
  const mapRef = useRef<HTMLDivElement>(null)
  const mapInstanceRef = useRef<any>(null)
  const heatmapLayerRef = useRef<any>(null)
  const [mapLoaded, setMapLoaded] = useState(false)
  const [geoJsonData, setGeoJsonData] = useState<GeoJsonData | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [viewingState, setViewingState] = useState<string | null>(null)
  const [exportingMap, setExportingMap] = useState(false)

  const [filters, setFilters] = useState<FilterState>({
    states: [],
    gasTypes: ["pm25_ugm3", "pm10_ugm3", "co2_ppm"],
    showAllStates: true,
  })

  const stateData = geoJsonData
    ? geoJsonData.features.reduce(
        (acc, feature) => {
          const state = feature.properties.state || "Unknown"
          if (!acc[state]) {
            acc[state] = []
          }
          acc[state].push(feature)
          return acc
        },
        {} as Record<string, GeoJsonFeature[]>,
      )
    : {}

  const uniqueStates = Object.keys(stateData).sort()

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

  const getMarkerColor = (pm25: number) => {
    if (pm25 < 35) return "#22c55e"
    if (pm25 < 75) return "#eab308"
    if (pm25 < 115) return "#f97316"
    if (pm25 < 150) return "#ef4444"
    return "#a855f7"
  }

  const getAirQualityLevel = (pm25: number) => {
    if (pm25 < 35) return "Good"
    if (pm25 < 75) return "Moderate"
    if (pm25 < 115) return "Unhealthy"
    if (pm25 < 150) return "Very Unhealthy"
    return "Hazardous"
  }

  const getFilteredData = () => {
    if (!geoJsonData) return null

    return {
      ...geoJsonData,
      features: geoJsonData.features.filter((feature) => {
        const stateMatch = filters.showAllStates || filters.states.includes(feature.properties.state || "Unknown")
        return stateMatch
      }),
    }
  }

  useEffect(() => {
    const initializeMap = async () => {
      if (typeof window !== "undefined" && mapRef.current && !mapInstanceRef.current) {
        if (!document.querySelector('link[href*="leaflet"]')) {
          const link = document.createElement("link")
          link.rel = "stylesheet"
          link.href = "https://unpkg.com/leaflet@1.9.4/dist/leaflet.css"
          document.head.appendChild(link)
        }

        const loadLeafletHeat = () => {
          return new Promise<void>((resolve, reject) => {
            if (window.L && window.L.heatLayer) {
              resolve()
              return
            }

            if (!document.querySelector('script[src*="leaflet-heat"]')) {
              const heatScript = document.createElement("script")
              heatScript.src = "https://unpkg.com/leaflet.heat/dist/leaflet-heat.js"
              heatScript.onload = () => {
                if (window.L && window.L.heatLayer) {
                  resolve()
                } else {
                  reject(new Error("Leaflet.heat not properly initialized"))
                }
              }
              heatScript.onerror = () => {
                reject(new Error("Failed to load Leaflet.heat plugin"))
              }
              document.head.appendChild(heatScript)
            } else {
              resolve()
            }
          })
        }

        if (!window.L) {
          const script = document.createElement("script")
          script.src = "https://unpkg.com/leaflet@1.9.4/dist/leaflet.js"
          script.onload = async () => {
            await loadLeafletHeat()
            createMap()
          }
          document.head.appendChild(script)
        } else {
          await loadLeafletHeat()
          createMap()
        }
      }
    }

    const createMap = () => {
      if (mapRef.current && window.L && !mapInstanceRef.current) {
        const map = window.L.map(mapRef.current, {
          center: [9.082, 7.4951],
          zoom: 7,
          zoomControl: false,
        })

        const getTileLayer = (style: string) => {
          switch (style) {
            case "Satellite":
              return window.L.tileLayer(
                "https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}",
                {
                  attribution: "&copy; Esri",
                },
              )
            case "Terrain":
              return window.L.tileLayer("https://{s}.tile.opentopomap.org/{z}/{x}/{y}.png", {
                attribution: "&copy; OpenTopoMap",
              })
            default:
              return window.L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
                attribution: "&copy; OpenStreetMap",
              })
          }
        }

        const tileLayer = getTileLayer(mapStyle)
        tileLayer.addTo(map)

        mapInstanceRef.current = map
        setMapLoaded(true)
      }
    }

    initializeMap()

    return () => {
      if (mapInstanceRef.current) {
        mapInstanceRef.current.remove()
        mapInstanceRef.current = null
      }
    }
  }, [])

  useEffect(() => {
    if (mapInstanceRef.current && mapLoaded) {
      const filteredData = getFilteredData()
      if (!filteredData) return

      mapInstanceRef.current.eachLayer((layer: any) => {
        if (layer.options && (layer.options.radius || layer._heat)) {
          mapInstanceRef.current.removeLayer(layer)
        }
      })

      if (heatmapLayerRef.current) {
        mapInstanceRef.current.removeLayer(heatmapLayerRef.current)
        heatmapLayerRef.current = null
      }

      if (activeMapView === "heatmap") {
        if (window.L && window.L.heatLayer) {
          const maxValue = Math.max(
            ...filteredData.features.map((feature) => {
              const gasKey = filters.gasTypes[0] || "pm25_ugm3"
              return feature.properties[gasKey as keyof typeof feature.properties] || 0
            }),
          )

          const heatData = filteredData.features.map((feature) => {
            const { coordinates } = feature.geometry
            const gasKey = filters.gasTypes[0] || "pm25_ugm3"
            const value = feature.properties[gasKey as keyof typeof feature.properties] || 0
            const intensity = Math.max(0.1, Math.min(value / maxValue, 1))

            return [coordinates[1], coordinates[0], intensity]
          })

          if (heatData.length > 0) {
            if (heatmapLayerRef.current) {
              mapInstanceRef.current.removeLayer(heatmapLayerRef.current)
            }

            heatmapLayerRef.current = window.L.heatLayer(heatData, {
              radius: 30,
              blur: 20,
              maxZoom: 18,
              minOpacity: 0.3,
              max: 1.0,
              gradient: {
                0.0: "#22c55e",
                0.3: "#eab308",
                0.5: "#f97316",
                0.7: "#ef4444",
                1.0: "#a855f7",
              },
            })

            heatmapLayerRef.current.addTo(mapInstanceRef.current)
          }
        }
      } else {
        filteredData.features.forEach((feature) => {
          const { coordinates } = feature.geometry
          const props = feature.properties

          const marker = window.L.circleMarker([coordinates[1], coordinates[0]], {
            radius: 12,
            fillColor: getMarkerColor(props.pm25_ugm3),
            color: "#ffffff",
            weight: 2,
            opacity: 1,
            fillOpacity: 0.8,
          }).addTo(mapInstanceRef.current)

          const gasData = filters.gasTypes
            .map((gasKey) => {
              const gasInfo = gasTypes.find((g) => g.key === gasKey)
              if (!gasInfo) return ""
              return `
              <div class="flex justify-between">
                <span>${gasInfo.label}:</span>
                <span>${props[gasKey as keyof typeof props]} ${gasInfo.unit}</span>
              </div>
            `
            })
            .join("")

          marker.bindPopup(`
            <div class="p-3 min-w-[200px]">
              <h3 class="font-semibold text-sm mb-2">${props.location}</h3>
              <div class="space-y-1 text-xs">
                <div class="flex justify-between">
                  <span>Air Quality:</span>
                  <span class="font-medium">${getAirQualityLevel(props.pm25_ugm3)}</span>
                </div>
                ${gasData}
                <div class="flex justify-between">
                  <span>Temperature:</span>
                  <span>${props.temperature_c}°C</span>
                </div>
                <div class="flex justify-between">
                  <span>Humidity:</span>
                  <span>${props.humidity_percent}%</span>
                </div>
              </div>
            </div>
          `)
        })
      }
    }
  }, [mapLoaded, geoJsonData, filters, activeMapView])

  useEffect(() => {
    if (mapInstanceRef.current && mapLoaded) {
      mapInstanceRef.current.eachLayer((layer: any) => {
        if (layer._url) {
          mapInstanceRef.current.removeLayer(layer)
        }
      })

      const getTileLayer = (style: string) => {
        switch (style) {
          case "Satellite":
            return window.L.tileLayer(
              "https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}",
              {
                attribution: "&copy; Esri",
              },
            )
          case "Terrain":
            return window.L.tileLayer("https://{s}.tile.opentopomap.org/{z}/{x}/{y}.png", {
              attribution: "&copy; OpenTopoMap",
            })
          default:
            return window.L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
              attribution: "&copy; OpenStreetMap",
            })
        }
      }

      const tileLayer = getTileLayer(mapStyle)
      tileLayer.addTo(mapInstanceRef.current)
    }
  }, [mapStyle, mapLoaded])

  const toggleState = (state: string) => {
    setExpandedStates((prev) => (prev.includes(state) ? prev.filter((s) => s !== state) : [...prev, state]))
  }

  const toggleStateFilter = (state: string) => {
    setFilters((prev) => {
      const isCurrentlySelected = prev.states.includes(state)
      const newStates = isCurrentlySelected ? prev.states.filter((s) => s !== state) : [...prev.states, state]

      return {
        ...prev,
        states: newStates,
        showAllStates: newStates.length === 0,
      }
    })
  }

  const toggleAllStates = () => {
    setFilters((prev) => ({
      ...prev,
      showAllStates: true,
      states: [],
    }))
  }

  const toggleGasFilter = (gasKey: string) => {
    setFilters((prev) => ({
      ...prev,
      gasTypes: prev.gasTypes.includes(gasKey) ? prev.gasTypes.filter((g) => g !== gasKey) : [...prev.gasTypes, gasKey],
    }))
  }

  const zoomIn = () => {
    if (mapInstanceRef.current) {
      mapInstanceRef.current.zoomIn()
    }
  }

  const zoomOut = () => {
    if (mapInstanceRef.current) {
      mapInstanceRef.current.zoomOut()
    }
  }

  const downloadStateData = (state: string) => {
    const stateFeatures = stateData[state] || []
    if (stateFeatures.length === 0) return

    const headers = [
      "location",
      "longitude",
      "latitude",
      "co2_ppm",
      "co_ppm",
      "hcho_mgm3",
      "pm25_ugm3",
      "pm10_ugm3",
      "water_vapour",
      "temperature_c",
      "humidity_percent",
      "state",
      "uploader_name",
      "upload_time",
    ]

    const csvContent = [
      headers.join(","),
      ...stateFeatures.map((feature) => {
        const props = feature.properties
        return [
          props.location,
          feature.geometry.coordinates[0],
          feature.geometry.coordinates[1],
          props.co2_ppm,
          props.co_ppm,
          props.hcho_mgm3,
          props.pm25_ugm3,
          props.pm10_ugm3,
          props.water_vapour,
          props.temperature_c,
          props.humidity_percent,
          props.state,
          props.uploader_name || "",
          props.upload_time || "",
        ].join(",")
      }),
    ].join("\n")

    const blob = new Blob([csvContent], { type: "text/csv" })
    const url = URL.createObjectURL(blob)
    const link = document.createElement("a")
    link.href = url
    link.download = `${state}-environmental-data.csv`
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
    URL.revokeObjectURL(url)
  }

  const exportMapAsImage = async () => {
    if (!mapRef.current) return
    setExportingMap(true)

    try {
      // Temporarily set a solid background color for export
      const originalBackground = mapRef.current.style.background
      // mapRef.current.style.background = '#ffffff'

      const canvas = await html2canvas(mapRef.current, {
        useCORS: true,
        allowTaint: true,
        scale: 2,
      })

      // Restore the original background
      mapRef.current.style.background = originalBackground

      const link = document.createElement("a")
      link.download = `environmental-map-${new Date().toISOString().split("T")[0]}.png`
      link.href = canvas.toDataURL("image/png")
      link.click()
    } catch (error) {
      console.error("Error exporting map as image:", error)
      alert("Failed to export map as image. Please try again.")
    } finally {
      setExportingMap(false)
    }
  }

  const exportMapAsPDF = async () => {
    if (!mapRef.current) return
    setExportingMap(true)

    try {
      // Temporarily set a solid background color for export
      const originalBackground = mapRef.current.style.background
      mapRef.current.style.background = '#ffffff'

      const canvas = await html2canvas(mapRef.current, {
        useCORS: true,
        allowTaint: true,
        scale: 2,
      })

      // Restore the original background
      mapRef.current.style.background = originalBackground

      const imgData = canvas.toDataURL("image/png")
      const pdf = new jsPDF({
        orientation: canvas.width > canvas.height ? "landscape" : "portrait",
        unit: "px",
        format: [canvas.width, canvas.height],
      })

      pdf.addImage(imgData, "PNG", 0, 0, canvas.width, canvas.height)
      pdf.save(`environmental-map-${new Date().toISOString().split("T")[0]}.pdf`)
    } catch (error) {
      console.error("Error exporting map as PDF:", error)
      alert("Failed to export map as PDF. Please try again.")
    } finally {
      setExportingMap(false)
    }
  }

  return (
    <div className="flex h-screen bg-background">
      <div className="w-80 bg-card border-r border-border flex flex-col">
        <div className="p-6 border-b border-border">
          <h1 className="text-2xl font-semibold italic text-cyan-500 mb-4">Environmental Data</h1>

          {loading && <div className="text-sm text-muted-foreground">Loading data...</div>}
          {error && <div className="text-sm text-red-500">Error: {error}</div>}
          {geoJsonData && (
            <div className="text-sm text-muted-foreground">
              {getFilteredData()?.features.length || 0} of {geoJsonData.features.length} stations shown
            </div>
          )}
        </div>

        <div className="flex-1 overflow-y-auto p-4 space-y-4">
          <div className="space-y-2">
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-sm font-semibold">Data by State</h3>
              <Button variant="ghost" size="sm" className="h-8 text-xs" onClick={toggleAllStates}>
                {filters.showAllStates ? "Filter" : "Show All"}
              </Button>
            </div>

            {uniqueStates.map((state) => {
              const stateFeatures = stateData[state]
              const isExpanded = expandedStates.includes(state)
              const isSelected = filters.showAllStates || filters.states.includes(state)

              return (
                <div key={state} className="border border-border rounded-lg overflow-hidden">
                  <div className="flex items-center gap-2 p-3 bg-muted/30 hover:bg-muted/50 transition-colors">
                    <input
                      type="checkbox"
                      checked={isSelected}
                      onChange={() => toggleStateFilter(state)}
                      className="w-4 h-4 text-cyan-600 rounded border-gray-300"
                    />
                    <Button
                      variant="ghost"
                      size="sm"
                      className="flex-1 justify-between p-0 h-auto"
                      onClick={() => toggleState(state)}
                    >
                      <div className="flex items-center gap-2">
                        <MapPin className="w-4 h-4 text-cyan-500" />
                        <span className="font-medium text-sm">{state}</span>
                        <span className="text-xs text-muted-foreground">({stateFeatures.length})</span>
                      </div>
                      {isExpanded ? <ChevronDown className="w-4 h-4" /> : <ChevronRight className="w-4 h-4" />}
                    </Button>
                  </div>

                  {isExpanded && (
                    <div className="p-3 space-y-2 bg-card">
                      <div className="flex gap-2">
                        <Button
                          variant="outline"
                          size="sm"
                          className="flex-1 text-xs bg-cyan-500 hover:bg-cyan-600 text-white border-cyan-500"
                          onClick={() => setViewingState(state)}
                        >
                          <Eye className="w-3 h-3 mr-1" />
                          View
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          className="flex-1 text-xs bg-cyan-500 hover:bg-cyan-600 text-white border-cyan-500"
                          onClick={() => downloadStateData(state)}
                        >
                          <FileDown className="w-3 h-3 mr-1" />
                          Download
                        </Button>
                      </div>

                      <div className="space-y-1 mt-2">
                        {stateFeatures.slice(0, 3).map((feature) => (
                          <div key={feature.properties.id} className="text-xs p-2 bg-muted/30 rounded">
                            <div className="font-medium">{feature.properties.location}</div>
                            <div className="text-muted-foreground">PM2.5: {feature.properties.pm25_ugm3} μg/m³</div>
                          </div>
                        ))}
                        {stateFeatures.length > 3 && (
                          <div className="text-xs text-muted-foreground text-center py-1">
                            +{stateFeatures.length - 3} more locations
                          </div>
                        )}
                      </div>
                    </div>
                  )}
                </div>
              )
            })}
          </div>

          <div className="space-y-2 pt-4 border-t border-border">
            <h3 className="text-sm font-semibold mb-3">Pollutant Filters</h3>
            {gasTypes.map((gas) => (
              <div key={gas.key} className="flex items-center gap-3 p-2 hover:bg-muted/50 rounded-md">
                <input
                  type="checkbox"
                  checked={filters.gasTypes.includes(gas.key)}
                  onChange={() => toggleGasFilter(gas.key)}
                  className="w-4 h-4 text-cyan-600 rounded border-gray-300"
                />
                <div className="flex items-center gap-2 flex-1">
                  <div className="w-3 h-3 rounded-full bg-cyan-500" />
                  <span className="text-sm">{gas.label}</span>
                  <span className="text-xs text-muted-foreground">({gas.unit})</span>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="p-4 border-t border-border space-y-2">
          <Button
            variant="outline"
            className="w-full bg-cyan-500 hover:bg-cyan-600 text-white border-cyan-500"
            onClick={exportMapAsImage}
            disabled={exportingMap}
          >
            <ImageIcon className="w-4 h-4 mr-2" />
            {exportingMap ? "Exporting..." : "Export as Image"}
          </Button>
          <Button
            variant="outline"
            className="w-full bg-cyan-500 hover:bg-cyan-600 text-white border-cyan-500"
            onClick={exportMapAsPDF}
            disabled={exportingMap}
          >
            <Download className="w-4 h-4 mr-2" />
            {exportingMap ? "Exporting..." : "Export as PDF"}
          </Button>
        </div>
      </div>

      {/* Map area */}
      <div className="flex-1 flex flex-col">
        <div className="p-4 border-b border-border bg-card">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="flex bg-muted rounded-lg p-1">
                {mapViewTypes.map((type) => (
                  <Button
                    key={type.id}
                    variant={activeMapView === type.id ? "default" : "ghost"}
                    size="sm"
                    className={cn(
                      "px-4 py-2 text-sm font-medium",
                      activeMapView === type.id
                        ? "bg-cyan-500 text-white shadow-sm"
                        : "text-muted-foreground hover:text-foreground",
                    )}
                    onClick={() => setActiveMapView(type.id)}
                  >
                    {type.label}
                  </Button>
                ))}
              </div>

              <select
                value={mapStyle}
                onChange={(e) => setMapStyle(e.target.value)}
                className="px-3 py-2 bg-background border border-border rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-cyan-500"
              >
                <option value="Street">Street</option>
                <option value="Satellite">Satellite</option>
                <option value="Terrain">Terrain</option>
              </select>
            </div>
          </div>
        </div>

        <div className="flex-1 relative">
          <div ref={mapRef} className="absolute inset-0 bg-gray-100" style={{ zIndex: 1 }} />

          <Card
            className="absolute top-4 right-4 p-5 bg-white/95 backdrop-blur-md shadow-xl border-2 border-cyan-500/20 rounded-xl"
            style={{ zIndex: 1000 }}
          >
            <div className="flex items-center gap-2 mb-4">
              <div className="w-1 h-6 bg-cyan-500 rounded-full" />
              <h3 className="font-bold text-base text-gray-800">Air Quality Index</h3>
            </div>
            <div className="space-y-3">
              {legendItems.map((item, index) => (
                <div key={index} className="flex items-center gap-3 group hover:scale-105 transition-transform">
                  <div className={cn("w-5 h-5 rounded-md shadow-sm", item.color)} />
                  <div className="flex-1">
                    <div className="text-sm font-medium text-gray-700">{item.label}</div>
                    <div className="text-xs text-gray-500">{item.range}</div>
                  </div>
                </div>
              ))}
            </div>
          </Card>

          <div className="absolute bottom-4 right-4 flex flex-col gap-1" style={{ zIndex: 1000 }}>
            <Button variant="outline" size="sm" className="w-10 h-10 p-0 bg-white/95 backdrop-blur-sm" onClick={zoomIn}>
              +
            </Button>
            <Button
              variant="outline"
              size="sm"
              className="w-10 h-10 p-0 bg-white/95 backdrop-blur-sm"
              onClick={zoomOut}
            >
              −
            </Button>
          </div>
        </div>
      </div>

      {viewingState && (
        <div
          className="fixed inset-0 bg-black/50 flex items-center justify-center z-[2000]"
          onClick={() => setViewingState(null)}
        >
          <Card className="w-[600px] max-h-[80vh] overflow-y-auto p-6" onClick={(e) => e.stopPropagation()}>
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-semibold">{viewingState} - Environmental Data</h2>
              <Button variant="ghost" size="sm" onClick={() => setViewingState(null)}>
                ✕
              </Button>
            </div>

            <div className="space-y-3">
              {stateData[viewingState]?.map((feature) => (
                <div key={feature.properties.id} className="p-4 border border-border rounded-lg">
                  <h3 className="font-semibold mb-2">{feature.properties.location}</h3>
                  <div className="grid grid-cols-2 gap-2 text-sm">
                    <div>
                      <span className="text-muted-foreground">PM2.5:</span> {feature.properties.pm25_ugm3} μg/m³
                    </div>
                    <div>
                      <span className="text-muted-foreground">PM10:</span> {feature.properties.pm10_ugm3} μg/m³
                    </div>
                    <div>
                      <span className="text-muted-foreground">CO₂:</span> {feature.properties.co2_ppm} ppm
                    </div>
                    <div>
                      <span className="text-muted-foreground">CO:</span> {feature.properties.co_ppm} ppm
                    </div>
                    <div>
                      <span className="text-muted-foreground">Temperature:</span> {feature.properties.temperature_c}°C
                    </div>
                    <div>
                      <span className="text-muted-foreground">Humidity:</span> {feature.properties.humidity_percent}%
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </Card>
        </div>
      )}
    </div>
  )
}
