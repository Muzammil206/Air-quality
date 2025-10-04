"use client"

import { useState, useEffect, useRef } from "react"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Search, Download, Info, ChevronDown, ChevronRight, MapPin, Layers, Settings, Filter } from "lucide-react"
import { cn } from "@/lib/utils"
import { SidebarNavigation } from "@/components/sidebar-navigation"

declare global {
  interface Window {
    L: any
  }
}

interface FilterState {
  locations: string[]
  gasTypes: string[]
  showAllLocations: boolean
  showAllGases: boolean
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
  }
}

interface GeoJsonData {
  type: string
  features: GeoJsonFeature[]
}

const mapViewTypes = [
  { id: "points", label: "Points", active: true },
  { id: "heatmap", label: "Heatmap", active: false },
  { id: "choropleth", label: "Choropleth", active: false },
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
  const [expandedSections, setExpandedSections] = useState<string[]>(["Location Filters", "Gas Filters"])
  const [activeMapView, setActiveMapView] = useState("points")
  const [mapStyle, setMapStyle] = useState("Street")
  const mapRef = useRef<HTMLDivElement>(null)
  const mapInstanceRef = useRef<any>(null)
  const heatmapLayerRef = useRef<any>(null)
  const [mapLoaded, setMapLoaded] = useState(false)
  const [geoJsonData, setGeoJsonData] = useState<GeoJsonData | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const [filters, setFilters] = useState<FilterState>({
    locations: [],
    gasTypes: ["pm25_ugm3", "pm10_ugm3", "co2_ppm"],
    showAllLocations: true,
    showAllGases: false,
  })

  const uniqueLocations = geoJsonData ? [...new Set(geoJsonData.features.map((f) => f.properties.location))] : []

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
    if (pm25 < 35) return "#22c55e" // Good - Green
    if (pm25 < 75) return "#eab308" // Moderate - Yellow
    if (pm25 < 115) return "#f97316" // Unhealthy - Orange
    if (pm25 < 150) return "#ef4444" // Very Unhealthy - Red
    return "#a855f7" // Hazardous - Purple
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
        const locationMatch = filters.showAllLocations || filters.locations.includes(feature.properties.location)
        return locationMatch
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

            // First load the Leaflet.heat CSS
            if (!document.querySelector('link[href*="leaflet-heat"]')) {
              const link = document.createElement("link")
              link.rel = "stylesheet"
              link.href = "https://unpkg.com/leaflet.heat/dist/leaflet-heat.css"
              document.head.appendChild(link)
            }

            // Then load the Leaflet.heat JavaScript
            if (!document.querySelector('script[src*="leaflet-heat"]')) {
              const heatScript = document.createElement("script")
              heatScript.src = "https://unpkg.com/leaflet.heat/dist/leaflet-heat.js"
              heatScript.onload = () => {
                console.log("[v0] Leaflet heat plugin loaded successfully")
                if (window.L && window.L.heatLayer) {
                  resolve()
                } else {
                  reject(new Error("Leaflet.heat not properly initialized"))
                }
              }
              heatScript.onerror = () => {
                console.error("[v0] Failed to load leaflet-heat plugin")
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
            console.log("[v0] Leaflet loaded successfully")
            await loadLeafletHeat()
            createMap()
          }
          script.onerror = () => {
            console.error("[v0] Failed to load Leaflet")
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
          center: [9.082, 7.4951], // Centered on Nigeria
          zoom: 7,
          zoomControl: false,
        })

        const getTileLayer = (style: string) => {
          switch (style) {
            case "Satellite":
              return window.L.tileLayer(
                "https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}",
                {
                  attribution:
                    "&copy; Esri &mdash; Source: Esri, i-cubed, USDA, USGS, AEX, GeoEye, Getmapping, Aerogrid, IGN, IGP, UPR-EGP, and the GIS User Community",
                },
              )
            case "Terrain":
              return window.L.tileLayer("https://{s}.tile.opentopomap.org/{z}/{x}/{y}.png", {
                attribution:
                  'Map data: &copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors, <a href="http://viewfinderpanoramas.org">SRTM</a> | Map style: &copy; <a href="https://opentopomap.org">OpenTopoMap</a> (<a href="https://creativecommons.org/licenses/by-sa/3.0/">CC-BY-SA</a>)',
              })
            default:
              return window.L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
                attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
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

      console.log("[v0] Updating map with view:", activeMapView)
      console.log("[v0] Filtered data features:", filteredData.features.length)

      // Clear existing markers and heatmap
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
          console.log("[v0] Creating heatmap layer")
          
          // Calculate the maximum value for proper normalization
          const maxValue = Math.max(
            ...filteredData.features.map(feature => {
              // Get the first selected gas type for intensity
              const gasKey = filters.gasTypes[0] || "pm25_ugm3"
              return feature.properties[gasKey as keyof typeof feature.properties] || 0
            })
          )

          const heatData = filteredData.features.map((feature) => {
            const { coordinates } = feature.geometry
            
            // Get the first selected gas type for intensity
            const gasKey = filters.gasTypes[0] || "pm25_ugm3"
            const value = feature.properties[gasKey as keyof typeof feature.properties] || 0
            
            // Normalize the value between 0 and 1, with a minimum of 0.1 for visibility
            const intensity = Math.max(0.1, Math.min(value / maxValue, 1))
            
            return [
              coordinates[1], // latitude
              coordinates[0], // longitude
              intensity
            ]
          })

          if (heatData.length > 0) {
            // Remove existing heatmap layer if it exists
            if (heatmapLayerRef.current) {
              mapInstanceRef.current.removeLayer(heatmapLayerRef.current)
            }

            // Create new heatmap layer with improved options
            heatmapLayerRef.current = window.L.heatLayer(heatData, {
              radius: 30,      // Smaller radius for more precise visualization
              blur: 20,        // Reduced blur for sharper boundaries
              maxZoom: 18,     // Allow closer zoom
              minOpacity: 0.3, // Minimum opacity for better visibility
              max: 1.0,        // Maximum point intensity
              gradient: {
                0.0: "#22c55e",  // Green for low values
                0.3: "#eab308",  // Yellow for moderate values
                0.5: "#f97316",  // Orange for medium-high values
                0.7: "#ef4444",  // Red for high values
                1.0: "#a855f7"   // Purple for maximum values
              },
            })

            heatmapLayerRef.current.addTo(mapInstanceRef.current)
            console.log("[v0] Heatmap layer added successfully with", heatData.length, "points")
          } else {
            console.warn("[v0] No heat data available")
          }
        } else {
          console.error("[v0] Leaflet heat plugin not available")
          // Fallback to points view if heatmap fails
          setActiveMapView("points")
        }
      } else {
        // Points view
        console.log("[v0] Creating point markers")
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
        console.log("[v0] Point markers created successfully")
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

  const toggleSection = (title: string) => {
    setExpandedSections((prev) => (prev.includes(title) ? prev.filter((t) => t !== title) : [...prev, title]))
  }

  const toggleLocationFilter = (location: string) => {
    setFilters((prev) => ({
      ...prev,
      locations: prev.locations.includes(location)
        ? prev.locations.filter((l) => l !== location)
        : [...prev.locations, location],
      showAllLocations: false,
    }))
  }

  const toggleAllLocations = () => {
    setFilters((prev) => ({
      ...prev,
      showAllLocations: !prev.showAllLocations,
      locations: [],
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

  const downloadGeoJson = () => {
    const dataToDownload = getFilteredData() || geoJsonData
    if (dataToDownload) {
      const dataStr = JSON.stringify(dataToDownload, null, 2)
      const dataBlob = new Blob([dataStr], { type: "application/json" })
      const url = URL.createObjectURL(dataBlob)
      const link = document.createElement("a")
      link.href = url
      link.download = "environmental-data-filtered.geojson"
      document.body.appendChild(link)
      link.click()
      document.body.removeChild(link)
      URL.revokeObjectURL(url)
    }
  }

  return (
    <div className="flex h-screen bg-background">
      <SidebarNavigation />
      <div className="w-80 bg-card border-r border-border flex flex-col">
        <div className="p-6 border-b border-border">
          <h1 className="text-2xl  font-semibold italic text-[#00A7B3FF]">Environmental Data</h1>
          <div className="flex gap-2">
            <Button variant="ghost" size="sm" className="p-2">
              <Search className="w-4 h-4" />
            </Button>
            <Button variant="ghost" size="sm" className="p-2" onClick={downloadGeoJson} disabled={!geoJsonData}>
              <Download className="w-4 h-4" />
            </Button>
          </div>
          {loading && <div className="mt-2 text-sm text-muted-foreground">Loading data...</div>}
          {error && <div className="mt-2 text-sm text-red-500">Error: {error}</div>}
          {geoJsonData && (
            <div className="mt-2 text-sm text-muted-foreground">
              {getFilteredData()?.features.length || 0} of {geoJsonData.features.length} stations shown
            </div>
          )}
        </div>

        <div className="flex-1 overflow-y-auto p-4 space-y-4">
          <div className="space-y-2">
            <Button
              variant="ghost"
              className="w-full justify-between p-2 h-auto font-medium text-left"
              onClick={() => toggleSection("Location Filters")}
            >
              <span className="text-sm font-semibold">Location Filters</span>
              {expandedSections.includes("Location Filters") ? (
                <ChevronDown className="w-4 h-4" />
              ) : (
                <ChevronRight className="w-4 h-4" />
              )}
            </Button>

            {expandedSections.includes("Location Filters") && (
              <div className="space-y-1 ml-2">
                <div className="flex items-center gap-3 p-2 hover:bg-muted/50 rounded-md">
                  <input
                    type="checkbox"
                    checked={filters.showAllLocations}
                    onChange={toggleAllLocations}
                    className="w-4 h-4 text-blue-600 rounded border-gray-300"
                  />
                  <div className="flex items-center gap-2 flex-1">
                    <Filter className="w-3 h-3 text-blue-500" />
                    <span className="text-sm font-medium text-foreground">Show All Locations</span>
                  </div>
                </div>

                {uniqueLocations.map((location) => (
                  <div key={location} className="flex items-center gap-3 p-2 hover:bg-muted/50 rounded-md">
                    <input
                      type="checkbox"
                      checked={filters.showAllLocations || filters.locations.includes(location)}
                      onChange={() => toggleLocationFilter(location)}
                      disabled={filters.showAllLocations}
                      className="w-4 h-4 text-blue-600 rounded border-gray-300"
                    />
                    <div className="flex items-center gap-2 flex-1">
                      <MapPin className="w-3 h-3 text-green-500" />
                      <span className="text-sm text-foreground">{location}</span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          <div className="space-y-2">
            <Button
              variant="ghost"
              className="w-full justify-between p-2 h-auto font-medium text-left"
              onClick={() => toggleSection("Gas Filters")}
            >
              <span className="text-sm font-semibold">Gas & Pollutant Filters</span>
              {expandedSections.includes("Gas Filters") ? (
                <ChevronDown className="w-4 h-4" />
              ) : (
                <ChevronRight className="w-4 h-4" />
              )}
            </Button>

            {expandedSections.includes("Gas Filters") && (
              <div className="space-y-1 ml-2">
                {gasTypes.map((gas) => (
                  <div key={gas.key} className="flex items-center gap-3 p-2 hover:bg-muted/50 rounded-md">
                    <input
                      type="checkbox"
                      checked={filters.gasTypes.includes(gas.key)}
                      onChange={() => toggleGasFilter(gas.key)}
                      className="w-4 h-4 text-blue-600 rounded border-gray-300"
                    />
                    <div className="flex items-center gap-2 flex-1">
                      <div className="w-3 h-3 rounded-full bg-blue-500" />
                      <span className="text-sm text-foreground">{gas.label}</span>
                      <span className="text-xs text-muted-foreground">({gas.unit})</span>
                    </div>
                    <div className="flex gap-1">
                      <Button variant="ghost" size="sm" className="p-1 h-6 w-6">
                        <Info className="w-3 h-3" />
                      </Button>
                      <Button variant="ghost" size="sm" className="p-1 h-6 w-6">
                        <Download className="w-3 h-3" />
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>

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
                        ? "bg-blue-500 text-white shadow-sm"
                        : "text-muted-foreground hover:text-foreground",
                    )}
                    onClick={() => setActiveMapView(type.id)}
                  >
                    {type.label}
                  </Button>
                ))}
              </div>

              <div className="flex items-center gap-2">
                <select
                  value={mapStyle}
                  onChange={(e) => setMapStyle(e.target.value)}
                  className="px-3 py-2 bg-background border border-border rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="Street">Street</option>
                  <option value="Satellite">Satellite</option>
                  <option value="Terrain">Terrain</option>
                </select>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <Button variant="ghost" size="sm">
                <Layers className="w-4 h-4" />
              </Button>
              <Button variant="ghost" size="sm">
                <Settings className="w-4 h-4" />
              </Button>
            </div>
          </div>
        </div>

        <div className="flex-1 relative">
          <div ref={mapRef} className="absolute inset-0 bg-gray-100" style={{ zIndex: 1 }} />

          <Card className="absolute top-4 right-4 p-4 bg-white/95 backdrop-blur-sm shadow-lg" style={{ zIndex: 1000 }}>
            <h3 className="font-semibold text-sm mb-3">Air Quality Legend</h3>
            <div className="space-y-2">
              {legendItems.map((item, index) => (
                <div key={index} className="flex items-center gap-2">
                  <div className={cn("w-4 h-4 rounded", item.color)} />
                  <span className="text-xs text-foreground">{item.label}</span>
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
      
    </div>
  )
}
