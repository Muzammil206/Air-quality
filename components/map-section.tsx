"use client"

import { useEffect, useState, useRef } from "react"
import { MapContainer, Marker, Popup, useMap } from "react-leaflet"
import { Button } from "@/components/ui/button"
import { Loader2, AlertTriangle, RefreshCw, Search, X } from "lucide-react"
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectLabel,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { ALL_LOCATIONS, ABUJA_LOCATIONS, PORT_HARCOURT_LOCATIONS, LAGOS_LOCATIONS, GAS_TYPES } from "@/lib/types"
import { fetchCurrentReading } from "@/lib/air-quality-api"
import L from "leaflet"
import "leaflet/dist/leaflet.css"

// Fix for default markers in Leaflet
delete (L.Icon.Default.prototype as any)._getIconUrl
L.Icon.Default.mergeOptions({
  iconRetinaUrl: "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png",
  iconUrl: "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png",
  shadowUrl: "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png",
})

interface DistrictData {
  id: string
  name: string
  type: string
  coordinates: [number, number] // [lat, lng] for Leaflet
  aqi: number
  level: string
  color: string
  no2: number
  pm25: number
  o3: number
  co: number
  so2: number
  pm10: number
  error?: boolean
}

interface MapSectionProps {
  selectedLocation?: string
  onLocationSelect?: (location: string) => void
  selectedGas?: keyof typeof GAS_TYPES
  viewMode?: "real-time" | "layers" | "satellite"
}

function MapStyleController({ viewMode }: { viewMode: "real-time" | "layers" | "satellite" }) {
  const map = useMap()

  useEffect(() => {
    // Remove existing tile layers
    map.eachLayer((layer) => {
      if (layer instanceof L.TileLayer) {
        map.removeLayer(layer)
      }
    })

    let tileLayer: L.TileLayer

    switch (viewMode) {
      case "satellite":
        tileLayer = L.tileLayer(
          "https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}",
          {
            attribution: "© Esri",
          },
        )
        break
      case "layers":
        // Use a terrain/topographic layer for "layers" view
        tileLayer = L.tileLayer("https://{s}.tile.opentopomap.org/{z}/{x}/{y}.png", {
          attribution: "© OpenTopoMap contributors",
        })
        break
      case "real-time":
      default:
        tileLayer = L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
          attribution: "© OpenStreetMap contributors",
        })
        break
    }

    tileLayer.addTo(map)
  }, [map, viewMode])

  return null
}

function AirQualityMarker({
  station,
  selectedGas,
  isSelected,
  onLocationSelect,
}: {
  station: DistrictData
  selectedGas: keyof typeof GAS_TYPES
  isSelected: boolean
  onLocationSelect?: (location: string) => void
}) {
  const gasInfo = GAS_TYPES[selectedGas]
  const gasValue = station[selectedGas as keyof DistrictData] as number

  const createCustomIcon = () => {
    const iconHtml = `
      <div style="
        background: ${isSelected ? "rgba(6, 182, 212, 0.95)" : "rgba(0, 0, 0, 0.8)"};
        color: white;
        padding: ${isSelected ? "12px 16px" : "8px 12px"};
        border-radius: 8px;
        font-size: ${isSelected ? "13px" : "12px"};
        font-weight: 500;
        border: ${isSelected ? "2px solid #06b6d4" : "1px solid rgba(255, 255, 255, 0.2)"};
        backdrop-filter: blur(10px);
        min-width: ${isSelected ? "140px" : "120px"};
        transform: ${isSelected ? "scale(1.1)" : "scale(1)"};
        transition: all 0.2s ease;
        box-shadow: ${isSelected ? "0 8px 25px rgba(6, 182, 212, 0.3)" : "0 4px 12px rgba(0, 0, 0, 0.3)"};
        text-align: center;
        cursor: pointer;
      ">
        <div style="font-weight: 600; margin-bottom: 4px; ${isSelected ? "color: #fbbf24;" : ""}">${station.name}</div>
        <div style="color: ${station.color}; font-weight: 600; margin-bottom: 4px;">
          AQI: ${station.aqi}
        </div>
         <div style="margin-top: 4px; font-size: 11px; color: #ccc; font-weight: 600;">
          ${gasInfo.label}: ${gasValue} ${gasInfo.unit}
        </div>
      </div>
    `

    return L.divIcon({
      html: iconHtml,
      className: "custom-air-quality-marker",
      iconSize: [isSelected ? 160 : 140, isSelected ? 80 : 70],
      iconAnchor: [isSelected ? 80 : 70, isSelected ? 80 : 70],
    })
  }

  return (
    <Marker
      position={station.coordinates}
      icon={createCustomIcon()}
      eventHandlers={{
        click: () => {
          if (onLocationSelect) {
            onLocationSelect(station.name)
          }
        },
      }}
    >
      <Popup>
        <div style={{ minWidth: "200px", fontFamily: "system-ui" }}>
          <h3 style={{ margin: "0 0 8px 0", color: "#1f2937", fontSize: "16px", fontWeight: "600" }}>
            {station.name}
            {station.error && <span style={{ color: "#f59e0b", fontSize: "12px" }}> (Estimated)</span>}
          </h3>
          <p style={{ margin: "0 0 12px 0", color: "#6b7280", fontSize: "12px" }}>{station.type}</p>
          <div style={{ display: "flex", alignItems: "center", gap: "8px", marginBottom: "8px" }}>
            <div
              style={{
                backgroundColor: station.color,
                color: "white",
                padding: "4px 8px",
                borderRadius: "12px",
                fontSize: "12px",
                fontWeight: "600",
              }}
            >
              AQI: {station.aqi}
            </div>
            <span style={{ color: station.color, fontWeight: "600", fontSize: "14px" }}>{station.level}</span>
          </div>
          <div style={{ marginBottom: "8px" }}>
            <strong>{gasInfo.name}:</strong> {gasValue} {gasInfo.unit}
          </div>
          <p style={{ margin: "0", color: "#4b5563", fontSize: "12px" }}>
            {station.error
              ? "Data temporarily unavailable. Showing estimated values."
              : "Click marker to select this location for detailed analysis"}
          </p>
        </div>
      </Popup>
    </Marker>
  )
}

interface SearchResult {
  display_name: string
  lat: string
  lon: string
}

export function MapSection({
  selectedLocation,
  onLocationSelect,
  selectedGas = "no2",
  viewMode = "real-time",
}: MapSectionProps) {
  const [districtsData, setDistrictsData] = useState<DistrictData[]>([])
  const [dataError, setDataError] = useState<string | null>(null)
  const [dataLoading, setDataLoading] = useState(true)
  const [customMarker, setCustomMarker] = useState<DistrictData | null>(null)
  const [searchAddress, setSearchAddress] = useState("")
  const [searchResults, setSearchResults] = useState<SearchResult[]>([])
  const [isSearchExpanded, setIsSearchExpanded] = useState(false)
  const [isSearching, setIsSearching] = useState(false)
  const mapRef = useRef<any>(null)
  const searchInputRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    if (isSearchExpanded && searchInputRef.current) {
      // Use setTimeout to ensure DOM is updated
      setTimeout(() => {
        searchInputRef.current?.focus()
      }, 0)
    }
  }, [isSearchExpanded])

  const handleAddressSearch = async () => {
    if (!searchAddress.trim()) return

    setIsSearching(true)
    try {
      // Nigeria bounding box coordinates
      const nigeriaBounds = {
        north: 13.9,
        south: 4.3,
        east: 14.7,
        west: 2.7,
      }

      const response = await fetch(
        `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(searchAddress + " Nigeria")}&countrycodes=ng&bounded=1&viewbox=${nigeriaBounds.west},${nigeriaBounds.north},${nigeriaBounds.east},${nigeriaBounds.south}&limit=8`,
      )
      const data: SearchResult[] = await response.json()

      // Filter results to ensure they're within Nigeria bounds
      const filteredResults = data.filter((result) => {
        const lat = Number.parseFloat(result.lat)
        const lon = Number.parseFloat(result.lon)
        return (
          lat >= nigeriaBounds.south &&
          lat <= nigeriaBounds.north &&
          lon >= nigeriaBounds.west &&
          lon <= nigeriaBounds.east
        )
      })

      setSearchResults(filteredResults)
    } catch (error) {
      console.error("Geocoding error:", error)
      setDataError("Failed to search address. Please try again.")
    } finally {
      setIsSearching(false)
    }
  }

  const handleAddressSelect = (result: SearchResult) => {
    const coordinates: [number, number] = [Number.parseFloat(result.lat), Number.parseFloat(result.lon)]

    if (mapRef.current) {
      mapRef.current.flyTo(coordinates, 15)
    }

    handleLocationSelection(coordinates)
    setSearchResults([])
    setIsSearchExpanded(false)
    setSearchAddress("")
  }

  const toggleSearch = () => {
    if (isSearchExpanded) {
      setIsSearchExpanded(false)
      setSearchResults([])
      setSearchAddress("")
    } else {
      setIsSearchExpanded(true)
    }
  }

  const handleMapClick = async (e: L.LeafletMouseEvent) => {
    handleLocationSelection([e.latlng.lat, e.latlng.lng])
  }

  const handleLocationSelection = async (coordinates: [number, number]) => {
    setDataLoading(true)
    try {
      const [lat, lng] = coordinates
      const reading = await fetchCurrentReading("custom", selectedGas, { lat, lng })

      if (!reading) throw new Error("No data received from API")

      const { color, level } = getAQIColor(reading.healthIndex)

      const newMarker = {
        id: "custom-marker-" + Date.now(),
        name: "Custom Location",
        type: "Selected Point",
        coordinates: [lat, lng],
        aqi: Math.round(reading.healthIndex),
        level,
        color,
        no2: reading.no2,
        pm25: reading.pm25,
        o3: reading.o3,
        co: reading.co,
        so2: reading.so2,
        pm10: reading.pm10,
        error: false,
      }

      setCustomMarker(newMarker)
      if (onLocationSelect) {
        onLocationSelect(newMarker.name)
      }
    } catch (error) {
      setDataError(`Failed to get air quality data: ${error instanceof Error ? error.message : String(error)}`)
    } finally {
      setDataLoading(false)
    }
  }

  const getAQIColor = (healthIndex: number): { color: string; level: string } => {
    if (healthIndex <= 50) return { color: "#10b981", level: "Good" }
    if (healthIndex <= 100) return { color: "#f59e0b", level: "Moderate" }
    if (healthIndex <= 150) return { color: "#f97316", level: "Unhealthy for Sensitive Groups" }
    if (healthIndex <= 200) return { color: "#ef4444", level: "Unhealthy" }
    if (healthIndex <= 300) return { color: "#8b5cf6", level: "Very Unhealthy" }
    return { color: "#7c2d12", level: "Hazardous" }
  }

  const generateMockData = (gasType: keyof typeof GAS_TYPES, district: string) => {
    const baseValues = {
      no2: { base: 45, variance: 15 },
      co: { base: 3.2, variance: 1.5 },
      o3: { base: 78, variance: 20 },
      pm25: { base: 18, variance: 8 },
      pm10: { base: 35, variance: 12 },
      so2: { base: 12, variance: 6 },
    }

    const districtMultiplier = {
      Maitama: 0.8,
      Garki: 1.2,
      Wuse: 1.3,
      Asokoro: 0.7,
      Gwarinpa: 1.0,
      Kubwa: 1.1,
      Gwagwalada: 1.4,
      Kuje: 1.2,
    }
    const multiplier = districtMultiplier[district as keyof typeof districtMultiplier] || 1.0

    return {
      no2: Math.round((baseValues.no2.base + (Math.random() - 0.5) * baseValues.no2.variance) * multiplier),
      co: Number(((baseValues.co.base + (Math.random() - 0.5) * baseValues.co.variance) * multiplier).toFixed(1)),
      o3: Math.round((baseValues.o3.base + (Math.random() - 0.5) * baseValues.o3.variance) * multiplier),
      pm25: Math.round((baseValues.pm25.base + (Math.random() - 0.5) * baseValues.pm25.variance) * multiplier),
      pm10: Math.round((baseValues.pm10.base + (Math.random() - 0.5) * baseValues.pm10.variance) * multiplier),
      so2: Math.round((baseValues.so2.base + (Math.random() - 0.5) * baseValues.so2.variance) * multiplier),
    }
  }

  const fetchDistrictsData = async () => {
    setDataLoading(true)
    setDataError(null)
    const districts: DistrictData[] = []

    for (const location of ALL_LOCATIONS) {
      try {
        const reading = await fetchCurrentReading(location.name, selectedGas)
        const { color, level } = getAQIColor(reading.healthIndex)
        const mockData = generateMockData(selectedGas, location.district)

        districts.push({
          id: location.district.toLowerCase().replace(/\s+/g, "-"),
          name: location.name,
          type: location.district,
          coordinates: [location.coordinates.lat, location.coordinates.lng], // [lat, lng] for Leaflet
          aqi: Math.round(reading.healthIndex),
          level,
          color,
          ...mockData,
          error: false,
        })
      } catch (error) {
        console.error(`Failed to fetch data for ${location.name}:`, error)
        const mockData = generateMockData(selectedGas, location.district)
        const { color, level } = getAQIColor(55)

        districts.push({
          id: location.district.toLowerCase().replace(/\s+/g, "-"),
          name: location.name,
          type: location.district,
          coordinates: [location.coordinates.lat, location.coordinates.lng],
          aqi: 55,
          level,
          color,
          ...mockData,
          error: true,
        })
      }
    }

    setDistrictsData(districts)
    setDataLoading(false)
  }

  useEffect(() => {
    fetchDistrictsData()
  }, [selectedGas])

  const retryDataLoad = async () => {
    await fetchDistrictsData()
  }

  return (
    <div className="h-full rounded-lg border border-border flex flex-col">
          <div className="p-0">
            <div className="relative h-[calc(100vh-12rem)] border-t">
              <div className="absolute top-15 right-2 z-[1000]">
                <Select
                  onValueChange={(value) => {
                    const location = ALL_LOCATIONS.find(l => l.name === value)
                    if (location && mapRef.current) {
                      mapRef.current.flyTo([location.coordinates.lat, location.coordinates.lng], 13)
                      onLocationSelect?.(location.name)
                    }
                  }}
                >
                  <SelectTrigger className="w-[200px] bg-white/90 backdrop-blur-sm">
                    <SelectValue placeholder="Select a location" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectGroup>
                      <SelectLabel>Abuja</SelectLabel>
                      {ABUJA_LOCATIONS.map((location) => (
                        <SelectItem key={location.name} value={location.name}>
                          {location.name}
                        </SelectItem>
                      ))}
                    </SelectGroup>
                    <SelectGroup>
                      <SelectLabel>Port Harcourt</SelectLabel>
                      {PORT_HARCOURT_LOCATIONS.map((location) => (
                        <SelectItem key={location.name} value={location.name}>
                          {location.name}
                        </SelectItem>
                      ))}
                    </SelectGroup>
                    <SelectGroup>
                      <SelectLabel>Lagos</SelectLabel>
                      {LAGOS_LOCATIONS.map((location) => (
                        <SelectItem key={location.name} value={location.name}>
                          {location.name}
                        </SelectItem>
                      ))}
                    </SelectGroup>
                  </SelectContent>
                </Select>
              </div>
          <div className="absolute top-4 left-4 z-[1000] flex items-center gap-2">
            {!isSearchExpanded ? (
              <Button
                onClick={toggleSearch}
                size="sm"
                className="bg-white/95 hover:bg-white text-gray-700 border border-gray-200 shadow-lg backdrop-blur-sm transition-all duration-200 hover:shadow-xl"
              >
                <Search className="w-4 h-4" />
              </Button>
            ) : (
              <div className="bg-white/98 backdrop-blur-md rounded-lg shadow-xl border border-gray-200 p-3 min-w-[340px] animate-in slide-in-from-left-2 duration-200">
                <div className="flex items-center gap-2">
                  <Search
                    className={`w-4 h-4 flex-shrink-0 transition-colors ${isSearching ? "text-blue-500 animate-pulse" : "text-gray-500"}`}
                  />
                  <input
                    ref={searchInputRef}
                    type="text"
                    value={searchAddress}
                    onChange={(e) => setSearchAddress(e.target.value)}
                    placeholder="Search locations in Nigeria..."
                    className="flex-1 bg-transparent border-none outline-none text-sm placeholder-gray-500 py-1"
                    onKeyDown={(e) => {
                      if (e.key === "Enter" && !isSearching) {
                        handleAddressSearch()
                      } else if (e.key === "Escape") {
                        toggleSearch()
                      }
                    }}
                    disabled={isSearching}
                  />
                  <Button
                    onClick={handleAddressSearch}
                    size="sm"
                    disabled={isSearching || !searchAddress.trim()}
                    className="bg-blue-500 hover:bg-blue-600 text-white px-3 py-1 text-xs disabled:opacity-50 transition-all duration-200"
                  >
                    {isSearching ? <Loader2 className="w-3 h-3 animate-spin" /> : "Search"}
                  </Button>
                  <Button
                    onClick={toggleSearch}
                    size="sm"
                    variant="ghost"
                    className="p-1 h-auto text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded transition-all duration-200"
                  >
                    <X className="w-4 h-4" />
                  </Button>
                </div>

                {searchResults.length > 0 && (
                  <div className="mt-3 max-h-56 overflow-y-auto border-t border-gray-100 pt-2">
                    {searchResults.map((result, index) => (
                      <div
                        key={index}
                        onClick={() => handleAddressSelect(result)}
                        className="p-3 cursor-pointer hover:bg-blue-50 text-sm text-gray-700 border-b border-gray-50 last:border-b-0 rounded-md transition-colors duration-150 hover:shadow-sm"
                      >
                        <div className="truncate font-medium text-gray-800">{result.display_name.split(",")[0]}</div>
                        <div className="truncate text-xs text-gray-500 mt-1">{result.display_name}</div>
                      </div>
                    ))}
                  </div>
                )}

                {searchAddress && searchResults.length === 0 && !isSearching && (
                  <div className="mt-3 p-3 text-sm text-gray-500 text-center border-t border-gray-100">
                    No locations found in Nigeria. Try a different search term.
                  </div>
                )}
              </div>
            )}
          </div>

          <MapContainer
            ref={mapRef}
            center={[9.0765, 7.3986]}
            zoom={11}
            style={{ height: "100%", width: "100%" }}
            className="z-0"
            eventHandlers={{
              click: (e) => {
                handleMapClick(e)
              },
            }}
          >
            <MapStyleController viewMode={viewMode} />
            {!dataLoading && (
              <>
                {districtsData.map((station) => (
                  <AirQualityMarker
                    key={station.id}
                    station={station}
                    selectedGas={selectedGas}
                    isSelected={selectedLocation === station.name}
                    onLocationSelect={onLocationSelect}
                  />
                ))}
                {customMarker && (
                  <AirQualityMarker
                    key="custom-marker"
                    station={customMarker}
                    selectedGas={selectedGas}
                    isSelected={false}
                  />
                )}
              </>
            )}
          </MapContainer>

          {/* Loading overlay */}
          {dataLoading && (
            <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 bg-gray-800/90 backdrop-blur-sm rounded-lg p-4 border border-gray-600 z-[1000]">
              <div className="flex items-center gap-3">
                <Loader2 className="w-5 h-5 animate-spin text-blue-400" />
                <span className="text-white text-sm">Loading air quality data...</span>
              </div>
            </div>
          )}

          {/* Error overlay */}
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
        </div>
      </div>
    </div>
  )
}
