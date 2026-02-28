"use client"

import { useEffect, useState, useRef, useCallback } from "react"
import { MapContainer, Marker, Popup, useMap } from "react-leaflet"
import { Button } from "@/components/ui/button"
import {
  Loader2, AlertTriangle, RefreshCw, Search, X,
  Bell, User, Menu, Maximize2, Moon, Sun,
  MapPin, ChevronDown, Navigation, Check,
} from "lucide-react"
import {
  Select, SelectContent, SelectGroup,
  SelectItem, SelectLabel, SelectTrigger, SelectValue,
} from "@/components/ui/select"
import {
  ALL_LOCATIONS, ABUJA_LOCATIONS,
  PORT_HARCOURT_LOCATIONS, LAGOS_LOCATIONS, GAS_TYPES,
} from "@/lib/types"
import L from "leaflet"
import "leaflet/dist/leaflet.css"
import { usePathname } from "next/navigation"
import { LayoutDashboard, Map, Layers, BarChart3, Settings } from "lucide-react"
import { LineChart, Line, XAxis, YAxis, ResponsiveContainer, Tooltip } from "recharts"

// ─── Leaflet icon fix ─────────────────────────────────────────────────────────
delete (L.Icon.Default.prototype as any)._getIconUrl
L.Icon.Default.mergeOptions({
  iconRetinaUrl: "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png",
  iconUrl:       "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png",
  shadowUrl:     "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png",
})

// ─── Types ────────────────────────────────────────────────────────────────────
interface AirComponents {
  co:    number   // μg/m³  (OpenWeather)
  no:    number   // μg/m³
  no2:   number   // μg/m³
  o3:    number   // μg/m³
  so2:   number   // μg/m³
  pm2_5: number   // μg/m³
  pm10:  number   // μg/m³
  nh3:   number   // μg/m³
}

interface DistrictData {
  id:          string
  name:        string
  type:        string
  coordinates: [number, number]
  aqi:         number     // US EPA 0-500
  color:       string
  level:       string
  dominantPollutant: string
  components:  AirComponents
  error?:      boolean
}

interface SearchResult {
  display_name: string
  lat: string
  lon: string
}

interface MapSectionProps {
  selectedLocation?: string
  onLocationSelect?:  (location: string) => void
  selectedGas?:       keyof typeof GAS_TYPES
  viewMode?:          "real-time" | "layers" | "satellite"
}

// ═══════════════════════════════════════════════════════════════════════════════
//  US EPA AQI CALCULATION
//  Source: EPA Technical Assistance Document for AQI Reporting (2024 revision)
//  OpenWeather docs: https://openweathermap.org/air-pollution-index-levels
//
//  KEY FACTS about OpenWeather units (confirmed from OW docs):
//    co    → μg/m³  (typical background: 200–400 μg/m³ ≈ 0.17–0.35 ppm)
//    no2   → μg/m³
//    o3    → μg/m³
//    so2   → μg/m³
//    pm2_5 → μg/m³  (instantaneous, not 24-hr avg — we use as-is)
//    pm10  → μg/m³
//
//  Molecular weight conversions at 25°C, 1 atm:
//    NO2: 1 ppb = 1.88 μg/m³  → divide by 1.88
//    O3:  1 ppb = 1.96 μg/m³  → divide by 1.96  (MW=48, 24.45 L/mol at 25°C)
//    SO2: 1 ppb = 2.62 μg/m³  → divide by 2.62
//    CO:  1 ppm = 1145 μg/m³  → divide by 1145
// ═══════════════════════════════════════════════════════════════════════════════

interface Breakpoint {
  cLow:  number
  cHigh: number
  iLow:  number
  iHigh: number
}

// PM2.5 μg/m³ — 2024 EPA revised breakpoints (tighter than pre-2024)
// NOTE: We use continuous ranges with no gaps (cHigh of row N = cLow of row N+1)
// This prevents values at exact boundaries falling through findBreakpoint.
const PM25_BREAKPOINTS: Breakpoint[] = [
  { cLow: 0.0,   cHigh: 9.0,   iLow: 0,   iHigh: 50  },
  { cLow: 9.0,   cHigh: 35.4,  iLow: 50,  iHigh: 100 },
  { cLow: 35.4,  cHigh: 55.4,  iLow: 100, iHigh: 150 },
  { cLow: 55.4,  cHigh: 125.4, iLow: 150, iHigh: 200 },
  { cLow: 125.4, cHigh: 225.4, iLow: 200, iHigh: 300 },
  { cLow: 225.4, cHigh: 325.4, iLow: 300, iHigh: 400 },
  { cLow: 325.4, cHigh: 500.4, iLow: 400, iHigh: 500 },
]

// PM10 μg/m³ — continuous ranges
const PM10_BREAKPOINTS: Breakpoint[] = [
  { cLow: 0,   cHigh: 54,   iLow: 0,   iHigh: 50  },
  { cLow: 54,  cHigh: 154,  iLow: 50,  iHigh: 100 },
  { cLow: 154, cHigh: 254,  iLow: 100, iHigh: 150 },
  { cLow: 254, cHigh: 354,  iLow: 150, iHigh: 200 },
  { cLow: 354, cHigh: 424,  iLow: 200, iHigh: 300 },
  { cLow: 424, cHigh: 504,  iLow: 300, iHigh: 400 },
  { cLow: 504, cHigh: 604,  iLow: 400, iHigh: 500 },
]

// NO2 ppb (1-hr) — after converting from μg/m³ with /1.88
const NO2_BREAKPOINTS: Breakpoint[] = [
  { cLow: 0,    cHigh: 53,   iLow: 0,   iHigh: 50  },
  { cLow: 53,   cHigh: 100,  iLow: 50,  iHigh: 100 },
  { cLow: 100,  cHigh: 360,  iLow: 100, iHigh: 150 },
  { cLow: 360,  cHigh: 649,  iLow: 150, iHigh: 200 },
  { cLow: 649,  cHigh: 1249, iLow: 200, iHigh: 300 },
  { cLow: 1249, cHigh: 1649, iLow: 300, iHigh: 400 },
  { cLow: 1649, cHigh: 2049, iLow: 400, iHigh: 500 },
]

// O3 ppb (8-hr) — after converting from μg/m³ with /1.96
const O3_BREAKPOINTS: Breakpoint[] = [
  { cLow: 0,   cHigh: 54,  iLow: 0,   iHigh: 50  },
  { cLow: 54,  cHigh: 70,  iLow: 50,  iHigh: 100 },
  { cLow: 70,  cHigh: 85,  iLow: 100, iHigh: 150 },
  { cLow: 85,  cHigh: 105, iLow: 150, iHigh: 200 },
  { cLow: 105, cHigh: 200, iLow: 200, iHigh: 300 },
]

// SO2 ppb (1-hr) — after converting from μg/m³ with /2.62
const SO2_BREAKPOINTS: Breakpoint[] = [
  { cLow: 0,   cHigh: 35,   iLow: 0,   iHigh: 50  },
  { cLow: 35,  cHigh: 75,   iLow: 50,  iHigh: 100 },
  { cLow: 75,  cHigh: 185,  iLow: 100, iHigh: 150 },
  { cLow: 185, cHigh: 304,  iLow: 150, iHigh: 200 },
  { cLow: 304, cHigh: 604,  iLow: 200, iHigh: 300 },
  { cLow: 604, cHigh: 804,  iLow: 300, iHigh: 400 },
  { cLow: 804, cHigh: 1004, iLow: 400, iHigh: 500 },
]

// CO ppm (8-hr) — after converting from μg/m³ with /1145
const CO_BREAKPOINTS: Breakpoint[] = [
  { cLow: 0.0,  cHigh: 4.4,  iLow: 0,   iHigh: 50  },
  { cLow: 4.4,  cHigh: 9.4,  iLow: 50,  iHigh: 100 },
  { cLow: 9.4,  cHigh: 12.4, iLow: 100, iHigh: 150 },
  { cLow: 12.4, cHigh: 15.4, iLow: 150, iHigh: 200 },
  { cLow: 15.4, cHigh: 30.4, iLow: 200, iHigh: 300 },
  { cLow: 30.4, cHigh: 40.4, iLow: 300, iHigh: 400 },
  { cLow: 40.4, cHigh: 50.4, iLow: 400, iHigh: 500 },
]

/** Linear interpolation between two EPA breakpoints */
function interpolateAQI(C: number, bp: Breakpoint): number {
  return Math.round(
    ((bp.iHigh - bp.iLow) / (bp.cHigh - bp.cLow)) * (C - bp.cLow) + bp.iLow
  )
}

/** Find the breakpoint row containing C. Uses >= low and <= high. */
function findBreakpoint(C: number, table: Breakpoint[]): Breakpoint | null {
  // Walk the table; use first row where C >= cLow and C <= cHigh
  for (const bp of table) {
    if (C >= bp.cLow && C <= bp.cHigh) return bp
  }
  // If C exceeds the last row's cHigh, cap at AQI 500
  if (C > table[table.length - 1].cHigh) return table[table.length - 1]
  return null
}

function subAQI(C: number, table: Breakpoint[]): number {
  if (C <= 0) return 0
  const bp = findBreakpoint(C, table)
  if (!bp) return 0
  return interpolateAQI(C, bp)
}

// Unit conversion helpers
const to_no2_ppb = (ugm3: number) => ugm3 / 1.88
const to_o3_ppb  = (ugm3: number) => ugm3 / 1.96
const to_so2_ppb = (ugm3: number) => ugm3 / 2.62
const to_co_ppm  = (ugm3: number) => ugm3 / 1145

/**
 * Compute the US EPA AQI from OpenWeather component concentrations.
 * Returns { aqi, dominantPollutant }.
 */
function computeEPAAQI(c: AirComponents): { aqi: number; dominantPollutant: string } {
  const candidates = [
    {
      name: "PM2.5",
      rawValue: c.pm2_5,
      convertedValue: Math.round(c.pm2_5 * 10) / 10,  // truncate to 1 decimal
      unit: "μg/m³",
      subAqi: subAQI(Math.round(c.pm2_5 * 10) / 10, PM25_BREAKPOINTS),
    },
    {
      name: "PM10",
      rawValue: c.pm10,
      convertedValue: Math.trunc(c.pm10),              // truncate to integer
      unit: "μg/m³",
      subAqi: subAQI(Math.trunc(c.pm10), PM10_BREAKPOINTS),
    },
    {
      name: "NO₂",
      rawValue: c.no2,
      convertedValue: Math.round(to_no2_ppb(c.no2) * 10) / 10,
      unit: "ppb",
      subAqi: subAQI(Math.round(to_no2_ppb(c.no2) * 10) / 10, NO2_BREAKPOINTS),
    },
    {
      name: "O₃",
      rawValue: c.o3,
      convertedValue: Math.round(to_o3_ppb(c.o3) * 10) / 10,
      unit: "ppb",
      subAqi: subAQI(Math.round(to_o3_ppb(c.o3) * 10) / 10, O3_BREAKPOINTS),
    },
    {
      name: "SO₂",
      rawValue: c.so2,
      convertedValue: Math.round(to_so2_ppb(c.so2) * 10) / 10,
      unit: "ppb",
      subAqi: subAQI(Math.round(to_so2_ppb(c.so2) * 10) / 10, SO2_BREAKPOINTS),
    },
    {
      name: "CO",
      rawValue: c.co,
      convertedValue: Math.round(to_co_ppm(c.co) * 100) / 100,
      unit: "ppm",
      subAqi: subAQI(Math.round(to_co_ppm(c.co) * 100) / 100, CO_BREAKPOINTS),
    },
  ]

  const best = candidates.reduce((a, b) => (b.subAqi > a.subAqi ? b : a))

  return { aqi: best.subAqi, dominantPollutant: best.name }
}

/**
 * Map a 0-500 EPA AQI to colour and category label.
 */
function aqiToCategory(aqi: number): { color: string; level: string } {
  // Guard: NaN / undefined / negative all fall to "Good" as a safe default
  if (!aqi || isNaN(aqi) || aqi <= 0) return { color: "#00e400", level: "Good" }
  if (aqi <= 50)  return { color: "#00e400", level: "Good"                           }
  if (aqi <= 100) return { color: "#ffff00", level: "Moderate"                       }
  if (aqi <= 150) return { color: "#ff7e00", level: "Unhealthy for Sensitive Groups" }
  if (aqi <= 200) return { color: "#ff0000", level: "Unhealthy"                      }
  if (aqi <= 300) return { color: "#8f3f97", level: "Very Unhealthy"                 }
  return              { color: "#7e0023", level: "Hazardous"                      }
}

// WHO annual mean guidelines (μg/m³) — for secondary comparison panel
const WHO = { pm25: 15, no2: 40 }

// ─── Fetch from our real API ──────────────────────────────────────────────────
async function fetchAirQuality(
  lat: number, lon: number
): Promise<{ components: AirComponents } | null> {
  try {
    const res  = await fetch(`/api/air-quality?lat=${lat}&lon=${lon}`)
    if (!res.ok) return null
    const json = await res.json()
    const feat = json?.features?.[0]
    if (!feat) return null
    return { components: feat.properties.components }
  } catch {
    return null
  }
}

// ─── Build estimated intra-day trend from live PM2.5 ─────────────────────────
const DAILY_PATTERN = [0.72, 0.80, 0.95, 0.88, 1.10, 0.92, 0.80]
const TREND_LABELS  = ["6AM", "8AM", "10AM", "12PM", "3PM", "6PM", "9PM"]
const buildTrendData = (pm25: number) =>
  DAILY_PATTERN.map((f, i) => ({ time: TREND_LABELS[i], value: +(pm25 * f).toFixed(1) }))

// ─── Leaflet controllers ──────────────────────────────────────────────────────
function MapStyleController({ viewMode }: { viewMode: "real-time" | "layers" | "satellite" }) {
  const map = useMap()
  useEffect(() => {
    map.eachLayer((l) => { if (l instanceof L.TileLayer) map.removeLayer(l) })
    let tile: L.TileLayer
    switch (viewMode) {
      case "satellite":
        tile = L.tileLayer("https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}", { attribution: "© Esri" })
        break
      case "layers":
        tile = L.tileLayer("https://{s}.tile.opentopomap.org/{z}/{x}/{y}.png", { attribution: "© OpenTopoMap" })
        break
      default:
        tile = L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", { attribution: "© OpenStreetMap" })
    }
    tile.addTo(map)
  }, [map, viewMode])
  return null
}

function MapClickHandler({ onClick }: { onClick: (e: L.LeafletMouseEvent) => void }) {
  const map = useMap()
  useEffect(() => {
    map.on("click", onClick)
    return () => { map.off("click", onClick) }
  }, [map, onClick])
  return null
}

const GAS_TO_COMPONENT: Record<string, keyof AirComponents> = {
  no2: "no2", co: "co", o3: "o3", pm2_5: "pm2_5", pm10: "pm10", so2: "so2",
}

function AirQualityMarker({
  station, selectedGas, isSelected, onLocationSelect,
}: {
  station:           DistrictData
  selectedGas:       keyof typeof GAS_TYPES
  isSelected:        boolean
  onLocationSelect?: (location: string) => void
}) {
  const gasInfo  = GAS_TYPES[selectedGas]
  const compKey  = GAS_TO_COMPONENT[selectedGas] ?? "pm2_5"
  const gasValue = station.components[compKey] ?? 0

  const icon = L.divIcon({
    html: `<div style="
      background:${isSelected ? "rgba(0,167,179,0.95)" : "rgba(255,255,255,0.96)"};
      color:${isSelected ? "white" : "#1e293b"};
      padding:${isSelected ? "10px 14px" : "7px 11px"};
      border-radius:8px;font-size:12px;font-weight:500;
      border:${isSelected ? "2px solid #00A7B3" : "1px solid rgba(0,0,0,0.1)"};
      backdrop-filter:blur(10px);min-width:130px;text-align:center;cursor:pointer;
      box-shadow:${isSelected ? "0 8px 25px rgba(0,167,179,0.3)" : "0 4px 12px rgba(0,0,0,0.12)"};
    ">
      <div style="font-weight:600;margin-bottom:3px;">${station.name}</div>
      <div style="color:${station.color};font-weight:700;margin-bottom:2px;">AQI ${station.aqi}</div>
      <div style="font-size:10px;color:${station.color};margin-bottom:3px;">${station.level}</div>
      <div style="font-size:10px;color:#64748b;">${gasInfo.label}: ${gasValue.toFixed(1)} ${gasInfo.unit}</div>
    </div>`,
    className: "custom-air-quality-marker",
    iconSize:   [isSelected ? 155 : 135, isSelected ? 80 : 70],
    iconAnchor: [isSelected ? 77  : 67,  isSelected ? 80 : 70],
  })

  return (
    <Marker
      position={station.coordinates}
      icon={icon}
      eventHandlers={{ click: () => onLocationSelect?.(station.name) }}
    >
      <Popup>
        <div style={{ minWidth: 200, fontFamily: "system-ui" }}>
          <h3 style={{ margin: "0 0 4px", fontSize: 15, fontWeight: 600 }}>{station.name}</h3>
          <p  style={{ margin: "0 0 8px", color: "#6b7280", fontSize: 12 }}>{station.type}</p>
          <div style={{ display: "flex", gap: 8, marginBottom: 8, alignItems: "center" }}>
            <span style={{ background: station.color, color: station.aqi <= 100 ? "#000" : "#fff", padding: "3px 8px", borderRadius: 12, fontSize: 12, fontWeight: 700 }}>
              US EPA AQI: {station.aqi}
            </span>
            <span style={{ color: station.color, fontWeight: 600, fontSize: 12 }}>{station.level}</span>
          </div>
          <p style={{ margin: "0 0 3px", color: "#4b5563", fontSize: 12 }}>
            Dominant: {station.dominantPollutant}
          </p>
          <p style={{ margin: "0 0 3px", color: "#4b5563", fontSize: 12 }}>
            PM2.5: {station.components.pm2_5.toFixed(1)} μg/m³ · PM10: {station.components.pm10.toFixed(1)} μg/m³
          </p>
          <p style={{ margin: 0, color: "#4b5563", fontSize: 12 }}>
            NO₂: {station.components.no2.toFixed(1)} μg/m³ · SO₂: {station.components.so2.toFixed(1)} μg/m³
          </p>
        </div>
      </Popup>
    </Marker>
  )
}

// ─── AQI Gauge ────────────────────────────────────────────────────────────────
function AQIGauge({ value, isDark }: { value: number; isDark: boolean }) {
  const max   = 500
  const pct   = Math.min(value / max, 1)
  const angle = -180 + pct * 180
  const r = 54, cx = 70, cy = 70
  const toRad = (d: number) => (d * Math.PI) / 180
  const arcX  = cx + r * Math.cos(toRad(angle - 90))
  const arcY  = cy + r * Math.sin(toRad(angle - 90))
  const { color } = aqiToCategory(value)
  return (
    <svg viewBox="0 0 140 90" className="w-full max-w-[160px]">
      <path d={`M ${cx-r} ${cy} A ${r} ${r} 0 0 1 ${cx+r} ${cy}`}  fill="none" stroke={isDark ? "#1e293b" : "#e2e8f0"} strokeWidth="12" strokeLinecap="round" />
      <path d={`M ${cx-r} ${cy} A ${r} ${r} 0 0 1 ${arcX} ${arcY}`} fill="none" stroke={color} strokeWidth="12" strokeLinecap="round" />
      <text x={cx} y={cy+4}  textAnchor="middle" fill={isDark ? "white" : "#111827"} fontSize="18" fontWeight="700">{value}</text>
      <text x={cx} y={cy+18} textAnchor="middle" fill="#94a3b8" fontSize="8">EPA AQI (0–500)</text>
      <text x={cx-r} y={cy+14} textAnchor="middle" fill="#94a3b8" fontSize="8">0</text>
      <text x={cx+r} y={cy+14} textAnchor="middle" fill="#94a3b8" fontSize="8">500</text>
    </svg>
  )
}

// ─── Main component ───────────────────────────────────────────────────────────
export function MapSection({
  selectedLocation,
  onLocationSelect,
  selectedGas = "no2",
  viewMode    = "real-time",
}: MapSectionProps) {
  const pathname = usePathname()

  const [districtsData,    setDistrictsData]    = useState<DistrictData[]>([])
  const [dataError,        setDataError]        = useState<string | null>(null)
  const [dataLoading,      setDataLoading]      = useState(true)
  const [customMarker,     setCustomMarker]     = useState<DistrictData | null>(null)
  const [searchAddress,    setSearchAddress]    = useState("")
  const [searchResults,    setSearchResults]    = useState<SearchResult[]>([])
  const [isSearchExpanded, setIsSearchExpanded] = useState(false)
  const [isSearching,      setIsSearching]      = useState(false)
  const [isDark,           setIsDark]           = useState(false)

  // ── Mobile location picker sheet ──────────────────────────────────────────
  const [locationSheetOpen,   setLocationSheetOpen]   = useState(false)
  const [locationSheetSearch, setLocationSheetSearch] = useState("")
  const [gpsLoading,          setGpsLoading]          = useState(false)
  const [gpsError,            setGpsError]            = useState<string | null>(null)
  const [gpsStation,          setGpsStation]          = useState<DistrictData | null>(null)

  const mapRef         = useRef<any>(null)
  const searchInputRef = useRef<HTMLInputElement>(null)
  const sheetSearchRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    if (isSearchExpanded) setTimeout(() => searchInputRef.current?.focus(), 0)
  }, [isSearchExpanded])

  useEffect(() => {
    if (locationSheetOpen) setTimeout(() => sheetSearchRef.current?.focus(), 100)
  }, [locationSheetOpen])

  // ── Fetch all stations (parallel) ────────────────────────────────────────
  const fetchDistrictsData = useCallback(async () => {
    setDataLoading(true)
    setDataError(null)

    const results = await Promise.all(
      ALL_LOCATIONS.map(async (location) => {
        const data = await fetchAirQuality(location.coordinates.lat, location.coordinates.lng)

        const components: AirComponents = data?.components ?? {
          co: 0, no: 0, no2: 0, o3: 0, so2: 0, pm2_5: 0, pm10: 0, nh3: 0
        }

        const { aqi, dominantPollutant } = computeEPAAQI(components)
        const { color, level }           = aqiToCategory(aqi)
        return {
          id:               location.district.toLowerCase().replace(/\s+/g, "-"),
          name:             location.name,
          type:             location.district,
          coordinates:      [location.coordinates.lat, location.coordinates.lng] as [number, number],
          aqi,
          color,
          level,
          dominantPollutant,
          components,
          error:            !data,
        } satisfies DistrictData
      })
    )

    setDistrictsData(results)
    setDataLoading(false)
  }, [])

  useEffect(() => { fetchDistrictsData() }, [fetchDistrictsData])

  // ── GPS: request current location, fetch AQI for it ──────────────────────
  const handleGetGPS = useCallback(async () => {
    if (!navigator.geolocation) {
      setGpsError("Geolocation is not supported by your browser.")
      return
    }
    setGpsLoading(true)
    setGpsError(null)

    navigator.geolocation.getCurrentPosition(
      async (pos) => {
        try {
          const { latitude: lat, longitude: lon } = pos.coords
          const data = await fetchAirQuality(lat, lon)
          if (!data) throw new Error("No air quality data for your location.")

          const { aqi, dominantPollutant } = computeEPAAQI(data.components)
          const { color, level }           = aqiToCategory(aqi)

          // Reverse-geocode to get a readable name
          let placeName = "My Location"
          try {
            const geo = await fetch(`https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lon}`)
            const geoJson = await geo.json()
            placeName = geoJson?.address?.suburb
              ?? geoJson?.address?.neighbourhood
              ?? geoJson?.address?.city_district
              ?? geoJson?.address?.city
              ?? geoJson?.display_name?.split(",")[0]
              ?? "My Location"
          } catch { /* keep default */ }

          const station: DistrictData = {
            id: "gps-location",
            name: placeName,
            type: "GPS Location",
            coordinates: [lat, lon],
            aqi, color, level, dominantPollutant,
            components: data.components,
            error: false,
          }

          setGpsStation(station)
          setCustomMarker(station)
          onLocationSelect?.(station.name)
          mapRef.current?.flyTo([lat, lon], 13)
          setLocationSheetOpen(false)
        } catch (err) {
          setGpsError(err instanceof Error ? err.message : "Failed to get location data.")
        } finally {
          setGpsLoading(false)
        }
      },
      (err) => {
        setGpsLoading(false)
        switch (err.code) {
          case err.PERMISSION_DENIED:
            setGpsError("Location permission denied. Please allow access in your browser settings.")
            break
          case err.POSITION_UNAVAILABLE:
            setGpsError("Location unavailable. Try again or pick a station manually.")
            break
          default:
            setGpsError("Could not determine your location. Please try again.")
        }
      },
      { timeout: 10000, maximumAge: 60000 }
    )
  }, [onLocationSelect])

  // Auto-request GPS on first load if permission already granted (all devices, silent fail)
  useEffect(() => {
    if (typeof window === "undefined") return
    navigator.permissions?.query({ name: "geolocation" as PermissionName }).then((result) => {
      if (result.state === "granted") handleGetGPS()
    }).catch(() => { /* permissions API not available — user must tap button */ })
  }, [handleGetGPS])

  // ── Map click ─────────────────────────────────────────────────────────────
  const handleMapClick = async (e: L.LeafletMouseEvent) => {
    setDataLoading(true)
    try {
      const { lat, lng } = e.latlng
      const data = await fetchAirQuality(lat, lng)
      if (!data) throw new Error("No data returned")
      const { aqi, dominantPollutant } = computeEPAAQI(data.components)
      const { color, level }           = aqiToCategory(aqi)
      setCustomMarker({
        id: "custom-" + Date.now(), name: "Custom Location", type: "Selected Point",
        coordinates: [lat, lng], aqi, color, level, dominantPollutant,
        components: data.components, error: false,
      })
      onLocationSelect?.("Custom Location")
    } catch (err) {
      setDataError(`Could not fetch data: ${err instanceof Error ? err.message : String(err)}`)
    } finally { setDataLoading(false) }
  }

  // ── Address search ────────────────────────────────────────────────────────
  const handleAddressSearch = async () => {
    if (!searchAddress.trim()) return
    setIsSearching(true)
    try {
      const res  = await fetch(`https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(searchAddress + " Nigeria")}&countrycodes=ng&bounded=1&viewbox=2.7,13.9,14.7,4.3&limit=8`)
      const data: SearchResult[] = await res.json()
      setSearchResults(data.filter((r) => { const la = +r.lat, lo = +r.lon; return la >= 4.3 && la <= 13.9 && lo >= 2.7 && lo <= 14.7 }))
    } catch { setDataError("Search failed.") }
    finally  { setIsSearching(false) }
  }

  const handleAddressSelect = (r: SearchResult) => {
    mapRef.current?.flyTo([+r.lat, +r.lon], 15)
    setSearchResults([]); setIsSearchExpanded(false); setSearchAddress("")
  }

  // ── Derived values ────────────────────────────────────────────────────────
  const sel              = districtsData.find((d) => d.name === selectedLocation)
  const currentAqi       = sel?.aqi                     ?? 0
  const currentLevel     = sel?.level                    ?? "—"
  const currentColor     = sel?.color                    ?? "#6b7280"
  const dominantPollutant= sel?.dominantPollutant        ?? "—"
  const pm25             = sel?.components.pm2_5         ?? 0
  const no2              = sel?.components.no2           ?? 0
  const so2              = sel?.components.so2           ?? 0
  const co               = sel?.components.co            ?? 0
  const o3               = sel?.components.o3            ?? 0
  const pm10             = sel?.components.pm10          ?? 0
  const trendData        = buildTrendData(pm25)

  // ── Design tokens ─────────────────────────────────────────────────────────
  const D = {
    page:    isDark ? "#0d1117"  : "#f0f4f8",
    card:    isDark ? "#161b22"  : "#ffffff",
    topbar:  isDark ? "#0d1117"  : "#ffffff",
    border:  isDark ? "rgba(255,255,255,0.06)" : "rgba(0,0,0,0.07)",
    divider: isDark ? "rgba(255,255,255,0.06)" : "#e5e7eb",
    title:   isDark ? "#f1f5f9"  : "#111827",
    body:    isDark ? "#94a3b8"  : "#6b7280",
    muted:   isDark ? "#64748b"  : "#9ca3af",
    iconBg:  isDark ? "rgba(255,255,255,0.06)" : "#f3f4f6",
    iconClr: isDark ? "#94a3b8"  : "#6b7280",
    track:   isDark ? "#1e293b"  : "#e2e8f0",
    axis:    isDark ? "#64748b"  : "#9ca3af",
    ttBg:    isDark ? "#0d1117"  : "#ffffff",
    ttBdr:   isDark ? "rgba(255,255,255,0.1)" : "#e5e7eb",
    ttClr:   isDark ? "#f1f5f9"  : "#111827",
    srchBg:  isDark ? "rgba(22,27,34,0.97)"  : "rgba(255,255,255,0.98)",
    srchBdr: isDark ? "rgba(255,255,255,0.08)" : "#e5e7eb",
  }

  // ─────────────────────────────────────────────────────────────────────────
  return (
    <>
      {/* ════════════════ MOBILE ════════════════ */}
      <div className="md:hidden flex flex-col h-[100dvh] transition-colors duration-300" style={{ background: D.page }}>

        {/* Top bar */}
        <div className="flex items-center justify-between px-4 py-3 flex-shrink-0 border-b" style={{ background: D.topbar, borderColor: D.divider }}>
          <div className="flex items-center gap-3">
            <button className="w-8 h-8 flex items-center justify-center rounded-lg" style={{ background: D.iconBg }}>
              <Menu style={{ width: 16, height: 16, color: D.iconClr }} />
            </button>
            <div className="flex items-center gap-2">
              <div className="w-7 h-7 rounded-lg bg-[#00A7B3] flex items-center justify-center">
                <span className="text-white text-xs font-bold">A</span>
              </div>
              <span className="font-semibold" style={{ color: D.title }}>AirSense</span>
            </div>
          </div>

          {/* Location pill — tappable, opens sheet */}
          <button
            onClick={() => setLocationSheetOpen(true)}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-full border flex-1 mx-3 max-w-[180px] truncate"
            style={{ background: D.iconBg, borderColor: D.border }}
          >
            <MapPin style={{ width: 12, height: 12, color: "#00A7B3", flexShrink: 0 }} />
            <span className="text-xs font-medium truncate" style={{ color: D.title }}>
              {sel?.name ?? gpsStation?.name ?? "Select location"}
            </span>
            <ChevronDown style={{ width: 12, height: 12, color: D.muted, flexShrink: 0 }} />
          </button>

          <div className="flex items-center gap-1.5">
            <button onClick={() => setIsDark(!isDark)} className="w-8 h-8 rounded-full flex items-center justify-center" style={{ background: D.iconBg }}>
              {isDark ? <Sun style={{ width: 16, height: 16, color: "#f59e0b" }} /> : <Moon style={{ width: 16, height: 16, color: D.iconClr }} />}
            </button>
            <div className="w-8 h-8 rounded-full bg-gradient-to-br from-[#00A7B3] to-[#0077b6] flex items-center justify-center">
              <User style={{ width: 16, height: 16, color: "white" }} />
            </div>
          </div>
        </div>

        {/* ── Location bottom sheet ── */}
        {locationSheetOpen && (
          <>
            {/* Backdrop */}
            <div
              className="fixed inset-0 bg-black/50 z-40 transition-opacity"
              onClick={() => setLocationSheetOpen(false)}
            />

            {/* Sheet */}
            <div
              className="fixed bottom-0 left-0 right-0 z-50 rounded-t-3xl flex flex-col"
              style={{
                background: D.card,
                maxHeight: "82dvh",
                boxShadow: "0 -8px 40px rgba(0,0,0,0.2)",
              }}
            >
              {/* Handle */}
              <div className="flex justify-center pt-3 pb-1 flex-shrink-0">
                <div className="w-10 h-1 rounded-full" style={{ background: D.border }} />
              </div>

              {/* Sheet header */}
              <div className="flex items-center justify-between px-5 pb-3 pt-1 flex-shrink-0">
                <h3 className="text-base font-semibold" style={{ color: D.title }}>Choose Location</h3>
                <button
                  onClick={() => setLocationSheetOpen(false)}
                  className="w-7 h-7 flex items-center justify-center rounded-full"
                  style={{ background: D.iconBg }}
                >
                  <X style={{ width: 14, height: 14, color: D.muted }} />
                </button>
              </div>

              {/* GPS button */}
              <div className="px-5 pb-3 flex-shrink-0">
                <button
                  onClick={handleGetGPS}
                  disabled={gpsLoading}
                  className="w-full flex items-center gap-3 px-4 py-3 rounded-2xl border transition-opacity active:opacity-70"
                  style={{
                    background: "rgba(0,167,179,0.08)",
                    borderColor: "rgba(0,167,179,0.3)",
                  }}
                >
                  {gpsLoading
                    ? <Loader2 className="w-5 h-5 animate-spin text-[#00A7B3]" />
                    : <Navigation style={{ width: 18, height: 18, color: "#00A7B3" }} />
                  }
                  <div className="text-left">
                    <p className="text-sm font-semibold text-[#00A7B3]">
                      {gpsLoading ? "Detecting location…" : "Use my current location"}
                    </p>
                    {gpsStation && !gpsLoading && (
                      <p className="text-xs mt-0.5" style={{ color: D.muted }}>
                        Last: {gpsStation.name} · AQI {gpsStation.aqi}
                      </p>
                    )}
                    {gpsError && !gpsLoading && (
                      <p className="text-xs mt-0.5 text-red-500">{gpsError}</p>
                    )}
                  </div>
                  {gpsStation && !gpsLoading && (
                    <span className="ml-auto text-xs font-bold px-2 py-0.5 rounded-full" style={{ background: `${gpsStation.color}20`, color: gpsStation.color }}>
                      {gpsStation.level.split(" ")[0]}
                    </span>
                  )}
                </button>
              </div>

              {/* Divider */}
              <div className="mx-5 mb-3 flex-shrink-0 border-t" style={{ borderColor: D.divider }} />

              {/* Search */}
              <div className="px-5 mb-3 flex-shrink-0">
                <div className="flex items-center gap-2 px-3 py-2.5 rounded-xl border" style={{ background: D.iconBg, borderColor: D.border }}>
                  <Search style={{ width: 14, height: 14, color: D.muted, flexShrink: 0 }} />
                  <input
                    ref={sheetSearchRef}
                    value={locationSheetSearch}
                    onChange={(e) => setLocationSheetSearch(e.target.value)}
                    placeholder="Search stations…"
                    className="flex-1 bg-transparent text-sm outline-none"
                    style={{ color: D.title, fontSize: 16 }}
                  />
                  {locationSheetSearch && (
                    <button onClick={() => setLocationSheetSearch("")}>
                      <X style={{ width: 14, height: 14, color: D.muted }} />
                    </button>
                  )}
                </div>
              </div>

              {/* Station list */}
              <div className="overflow-y-auto px-5 pb-8 space-y-2">
                {districtsData
                  .filter((s) =>
                    !locationSheetSearch ||
                    s.name.toLowerCase().includes(locationSheetSearch.toLowerCase()) ||
                    s.type.toLowerCase().includes(locationSheetSearch.toLowerCase())
                  )
                  .map((station) => {
                    const isActive = selectedLocation === station.name
                    return (
                      <button
                        key={station.id}
                        onClick={() => {
                          onLocationSelect?.(station.name)
                          mapRef.current?.flyTo(station.coordinates, 13)
                          setLocationSheetOpen(false)
                          setLocationSheetSearch("")
                        }}
                        className="w-full flex items-center justify-between p-3.5 rounded-2xl border text-left active:opacity-70 transition-opacity"
                        style={{
                          background:  isActive ? `${station.color}15` : D.card,
                          borderColor: isActive ? `${station.color}50` : D.border,
                        }}
                      >
                        <div className="flex items-center gap-3 min-w-0">
                          <div
                            className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0 font-bold text-sm"
                            style={{ background: `${station.color}20`, color: station.color }}
                          >
                            {station.aqi}
                          </div>
                          <div className="min-w-0">
                            <p className="text-sm font-medium truncate" style={{ color: D.title }}>{station.name}</p>
                            <p className="text-xs mt-0.5" style={{ color: D.muted }}>
                              {station.type} · PM2.5 {station.components.pm2_5.toFixed(1)} μg/m³
                            </p>
                          </div>
                        </div>
                        <div className="flex items-center gap-2 ml-2 shrink-0">
                          <span className="text-xs font-semibold px-2 py-0.5 rounded-full" style={{ background: `${station.color}20`, color: station.color }}>
                            {station.level.split(" ")[0]}
                          </span>
                          {isActive && <Check style={{ width: 14, height: 14, color: station.color }} />}
                        </div>
                      </button>
                    )
                  })
                }
                {dataLoading && (
                  <div className="flex items-center justify-center py-8 gap-2">
                    <Loader2 className="w-4 h-4 animate-spin text-[#00A7B3]" />
                    <span className="text-sm" style={{ color: D.muted }}>Loading stations…</span>
                  </div>
                )}
              </div>
            </div>
          </>
        )}

        <div className="flex-1 overflow-y-auto pb-24 space-y-4 px-4 pt-4">

          {/* ── Live readings ── */}
          <div>
            <div className="flex items-center justify-between mb-3">
              <div>
                <div className="flex items-center gap-2">
                  <h2 className="text-base font-semibold" style={{ color: D.title }}>
                    {sel?.name ?? gpsStation?.name ?? "Select a station"}
                  </h2>
                  {gpsStation && (sel?.name === gpsStation.name || !sel) && (
                    <span className="flex items-center gap-1 text-[10px] font-semibold px-1.5 py-0.5 rounded-full"
                      style={{ background: "rgba(0,167,179,0.12)", color: "#00A7B3" }}>
                      <Navigation style={{ width: 9, height: 9 }} /> GPS
                    </span>
                  )}
                </div>
                
              </div>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => setLocationSheetOpen(true)}
                  className="flex items-center gap-1 text-xs px-2 py-1 rounded-lg border"
                  style={{ background: D.iconBg, borderColor: D.border, color: D.body }}
                >
                  <MapPin style={{ width: 11, height: 11, color: "#00A7B3" }} />
                  Change
                </button>
                <button
                  onClick={fetchDistrictsData}
                  className="flex items-center gap-1 text-xs px-2 py-1 rounded-lg"
                  style={{ background: "rgba(0,167,179,0.1)", color: "#00A7B3", border: "1px solid rgba(0,167,179,0.2)" }}
                >
                  <RefreshCw className="w-3 h-3" />
                </button>
              </div>
            </div>

            {dataLoading ? (
              <div className="flex items-center justify-center py-10 gap-2">
                <Loader2 className="w-5 h-5 animate-spin text-[#00A7B3]" />
                <span className="text-sm" style={{ color: D.body }}>Fetching live data…</span>
              </div>
            ) : (
              <>
                {/* AQI hero card */}
                {sel && (
                  <div className="col-span-2 rounded-2xl p-4 border shadow-sm mb-3" style={{ background: `${currentColor}18`, borderColor: `${currentColor}40` }}>
                    <div className="flex items-start justify-between">
                      <div>
                        <p className="text-xs font-medium mb-0.5" style={{ color: D.body }}>US EPA Air Quality Index</p>
                        <p className="text-3xl font-black" style={{ color: currentColor }}>{currentAqi}</p>
                        <p className="text-sm font-semibold mt-0.5" style={{ color: currentColor }}>{currentLevel}</p>
                        <p className="text-xs mt-1" style={{ color: D.muted }}>Driven by: {dominantPollutant}</p>
                      </div>
                      <div className="flex flex-col gap-1 items-end">
                        {[
                          { label: "Good",        color: "#00e400" },
                          { label: "Moderate",    color: "#ffff00" },
                          { label: "USG",         color: "#ff7e00" },
                          { label: "Unhealthy",   color: "#ff0000" },
                          { label: "V.Unhealthy", color: "#8f3f97" },
                          { label: "Hazardous",   color: "#7e0023" },
                        ].map(({ label, color }) => (
                          <div key={label} className="flex items-center gap-1">
                            <span className="text-[9px]" style={{ color: D.muted }}>{label}</span>
                            <span className="w-3 h-3 rounded-sm" style={{ background: color, outline: currentColor === color ? "2px solid white" : "none" }} />
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                )}

                {/* Pollutant breakdown */}
                <div className="grid grid-cols-2 gap-3">
                  {[
                    { label: "PM2.5",  value: pm25,  unit: "μg/m³", dot: pm25 > WHO.pm25 ? "#f59e0b" : "#10b981", warn: pm25 > WHO.pm25,  warnText: `${(pm25-WHO.pm25).toFixed(1)} above WHO` },
                    { label: "PM10",   value: pm10,  unit: "μg/m³", dot: "#14b8a6", warn: false, warnText: "" },
                    { label: "NO₂",   value: no2,   unit: "μg/m³", dot: no2 > WHO.no2 ? "#f59e0b" : "#3b82f6",  warn: no2 > WHO.no2,    warnText: `${(no2-WHO.no2).toFixed(1)} above WHO` },
                    { label: "O₃",    value: o3,    unit: "μg/m³", dot: "#06b6d4",   warn: false, warnText: "" },
                    { label: "SO₂",   value: so2,   unit: "μg/m³", dot: "#a855f7",   warn: false, warnText: "" },
                    { label: "CO",    value: co,    unit: "μg/m³", dot: "#ec4899",   warn: false, warnText: "" },
                  ].map((item) => (
                    <div key={item.label} className="rounded-2xl p-3 border shadow-sm" style={{ background: D.card, borderColor: D.border }}>
                      <div className="flex items-center justify-between mb-1.5">
                        <span className="text-xs font-medium" style={{ color: D.body }}>{item.label}</span>
                        <span className="w-2 h-2 rounded-full" style={{ background: item.dot }} />
                      </div>
                      <div className="text-xl font-bold" style={{ color: D.title }}>{item.value.toFixed(1)}</div>
                      <div className="flex items-center justify-between mt-0.5">
                        <span className="text-[10px]" style={{ color: D.muted }}>{item.unit}</span>
                        {item.warn && (
                          <span className="text-[9px] font-semibold px-1 py-0.5 rounded" style={{ background: "#f59e0b20", color: "#f59e0b" }}>
                            {item.warnText}
                          </span>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </>
            )}
          </div>

          {/* ── AI insights ── */}
          {!dataLoading && sel && (
            <div className="rounded-2xl p-4 border shadow-sm" style={{ background: D.card, borderColor: D.border }}>
              <div className="flex items-start gap-3 mb-4">
                <div className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0" style={{ background: "rgba(0,167,179,0.1)", border: "1px solid rgba(0,167,179,0.2)" }}>
                  <svg className="w-5 h-5 text-[#00A7B3]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
                  </svg>
                </div>
                <div>
                  <div className="font-semibold" style={{ color: D.title }}>AI Insights</div>
                  <div className="text-xs" style={{ color: D.body }}>Computed from live readings</div>
                </div>
              </div>
              <div className="space-y-3">
                <div className="flex gap-3">
                  <span className="w-2 h-2 rounded-full mt-1.5 flex-shrink-0" style={{ background: currentColor }} />
                  <div>
                    <p className="text-sm font-semibold mb-1" style={{ color: D.title }}>
                      {currentLevel} — AQI {currentAqi}
                    </p>
                    <p className="text-xs leading-relaxed" style={{ color: D.body }}>
                      The dominant pollutant is <strong>{dominantPollutant}</strong>.{" "}
                      {currentAqi <= 50  && "Air quality is satisfactory and poses little or no risk."}
                      {currentAqi > 50  && currentAqi <= 100  && "Unusually sensitive individuals may experience minor effects."}
                      {currentAqi > 100 && currentAqi <= 150  && "Members of sensitive groups may experience health effects. The general public is less likely to be affected."}
                      {currentAqi > 150 && currentAqi <= 200  && "Everyone may begin to experience health effects. Sensitive groups should avoid prolonged outdoor exertion."}
                      {currentAqi > 200 && "Health alert: everyone may experience serious health effects. Avoid outdoor activity."}
                    </p>
                  </div>
                </div>
                <div className="flex gap-3">
                  <span className="w-2 h-2 rounded-full mt-1.5 flex-shrink-0" style={{ background: pm25 > WHO.pm25 ? "#f59e0b" : "#10b981" }} />
                  <div>
                    <p className="text-sm font-semibold mb-1" style={{ color: D.title }}>PM2.5 vs WHO guideline</p>
                    <p className="text-xs leading-relaxed" style={{ color: D.body }}>
                      {pm25.toFixed(1)} μg/m³ —{" "}
                      {pm25 <= WHO.pm25
                        ? `within the WHO annual mean guideline of ${WHO.pm25} μg/m³.`
                        : `${(pm25 / WHO.pm25).toFixed(1)}× the WHO annual mean guideline of ${WHO.pm25} μg/m³. Long-term exposure at these levels carries elevated health risk.`
                      }
                    </p>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* ── Live Map ── */}
          <div className="rounded-2xl border shadow-sm overflow-hidden" style={{ background: D.card, borderColor: D.border }}>
            <div className="flex items-center justify-between px-4 py-3">
              <span className="font-semibold" style={{ color: D.title }}>Live Map</span>
              <span className="text-xs" style={{ color: D.muted }}>Tap a marker to select station</span>
            </div>
            <div className="relative h-72">
              <div className="absolute top-2 left-2 z-[1000]">
                {!isSearchExpanded ? (
                  <button onClick={() => setIsSearchExpanded(true)} className="w-8 h-8 rounded-lg flex items-center justify-center shadow" style={{ background: D.card, border: `1px solid ${D.border}` }}>
                    <Search style={{ width: 15, height: 15, color: D.iconClr }} />
                  </button>
                ) : (
                  <div className="rounded-xl p-2 w-60 shadow-xl backdrop-blur" style={{ background: D.srchBg, border: `1px solid ${D.srchBdr}` }}>
                    <div className="flex items-center gap-2">
                      <Search style={{ width: 14, height: 14, color: D.muted, flexShrink: 0 }} />
                      <input
                        ref={searchInputRef}
                        value={searchAddress}
                        onChange={(e) => setSearchAddress(e.target.value)}
                        placeholder="Search Nigeria…"
                        className="flex-1 bg-transparent text-xs outline-none"
                        style={{ color: D.title, fontSize: 16 }}
                        onKeyDown={(e) => {
                          if (e.key === "Enter")  handleAddressSearch()
                          if (e.key === "Escape") { setIsSearchExpanded(false); setSearchResults([]); setSearchAddress("") }
                        }}
                      />
                      {isSearching
                        ? <Loader2 className="w-3.5 h-3.5 text-[#00A7B3] animate-spin" />
                        : <button onClick={() => { setIsSearchExpanded(false); setSearchResults([]); setSearchAddress("") }}>
                            <X style={{ width: 14, height: 14, color: D.muted }} />
                          </button>
                      }
                    </div>
                    {searchResults.length > 0 && (
                      <div className="mt-2 max-h-40 overflow-y-auto pt-2 space-y-1 border-t" style={{ borderColor: D.divider }}>
                        {searchResults.map((r, i) => (
                          <button key={i} onClick={() => handleAddressSelect(r)} className="w-full text-left p-1.5 rounded-lg text-xs" style={{ color: D.body }}>
                            <div className="font-medium truncate" style={{ color: D.title }}>{r.display_name.split(",")[0]}</div>
                          </button>
                        ))}
                      </div>
                    )}
                  </div>
                )}
              </div>

              <MapContainer ref={mapRef} center={[9.0765, 7.3986]} zoom={10} style={{ height: "100%", width: "100%" }} zoomControl={false} className="z-0">
                <MapStyleController viewMode={viewMode} />
                <MapClickHandler onClick={handleMapClick} />
                {!dataLoading && districtsData.map((s) => (
                  <AirQualityMarker key={s.id} station={s} selectedGas={selectedGas} isSelected={selectedLocation === s.name} onLocationSelect={onLocationSelect} />
                ))}
                {customMarker && <AirQualityMarker key="custom" station={customMarker} selectedGas={selectedGas} isSelected={false} />}
              </MapContainer>

              {dataLoading && (
                <div className="absolute inset-0 flex items-center justify-center bg-black/10 z-[1000]">
                  <div className="rounded-xl p-4 flex items-center gap-3 shadow-lg" style={{ background: D.card }}>
                    <Loader2 className="w-5 h-5 animate-spin text-[#00A7B3]" />
                    <span className="text-sm" style={{ color: D.body }}>Loading…</span>
                  </div>
                </div>
              )}
              {dataError && !dataLoading && (
                <div className="absolute inset-0 flex items-center justify-center bg-black/10 z-[1000]">
                  <div className="rounded-xl p-4 text-center shadow-lg" style={{ background: D.card }}>
                    <AlertTriangle className="w-7 h-7 text-red-400 mx-auto mb-2" />
                    <p className="text-red-500 text-xs mb-3">{dataError}</p>
                    <button onClick={fetchDistrictsData} className="px-3 py-1.5 bg-[#00A7B3] text-white text-xs rounded-lg flex items-center gap-1.5 mx-auto">
                      <RefreshCw className="w-3 h-3" /> Retry
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* ── Trend chart ── */}
          {!dataLoading && sel && (
            <div>
              <div className="flex items-center justify-between mb-1">
                <h2 className="text-base font-semibold" style={{ color: D.title }}>PM2.5 Pattern</h2>
                <span className="text-xs px-2 py-0.5 rounded" style={{ background: "rgba(0,167,179,0.1)", color: "#00A7B3" }}>
                  Estimated · live base
                </span>
              </div>
              <p className="text-xs mb-3" style={{ color: D.muted }}>
                Daily shape scaled from live reading of {pm25.toFixed(1)} μg/m³.  free tier has no historical endpoint.
              </p>
              <div className="rounded-2xl p-4 border shadow-sm" style={{ background: D.card, borderColor: D.border }}>
                <ResponsiveContainer width="100%" height={130}>
                  <LineChart data={trendData} margin={{ top: 4, right: 4, bottom: 0, left: -28 }}>
                    <XAxis dataKey="time" tick={{ fill: D.axis, fontSize: 10 }} axisLine={false} tickLine={false} />
                    <YAxis tick={{ fill: D.axis, fontSize: 10 }} axisLine={false} tickLine={false} />
                    <Tooltip contentStyle={{ background: D.ttBg, border: `1px solid ${D.ttBdr}`, borderRadius: 8, color: D.ttClr, fontSize: 11 }} formatter={(v: number) => [`${v} μg/m³`, "PM2.5 est."]} />
                    <Line type="monotone" dataKey="value" stroke="#00A7B3" strokeWidth={2} dot={{ fill: "#00A7B3", r: 3, strokeWidth: 0 }} activeDot={{ r: 5, fill: "#00A7B3" }} />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            </div>
          )}

          {/* ── AQI gauge + WHO bars ── */}
          {!dataLoading && sel && (
            <div className="grid grid-cols-2 gap-3">
              <div className="rounded-2xl p-4 border shadow-sm flex flex-col items-center" style={{ background: D.card, borderColor: D.border }}>
                <span className="text-sm font-semibold mb-2 self-start" style={{ color: D.title }}>AQI</span>
                <AQIGauge value={currentAqi} isDark={isDark} />
                <span className="text-xs mt-1 font-semibold text-center" style={{ color: currentColor }}>{currentLevel}</span>
              </div>
              <div className="rounded-2xl p-4 border shadow-sm" style={{ background: D.card, borderColor: D.border }}>
                <span className="text-sm font-semibold block mb-3" style={{ color: D.title }}>vs WHO Limits</span>
                <div className="space-y-3">
                  {[
                    { label: "PM2.5", value: pm25, who: WHO.pm25 },
                    { label: "NO₂",  value: no2,  who: WHO.no2  },
                  ].map((item) => {
                    const pct  = Math.min((item.value / item.who) * 100, 100)
                    const over = item.value > item.who
                    return (
                      <div key={item.label}>
                        <div className="flex justify-between text-xs mb-1">
                          <span style={{ color: D.body }}>{item.label}</span>
                          <span className="font-medium" style={{ color: D.title }}>{item.value.toFixed(1)}/{item.who}</span>
                        </div>
                        <div className="h-2 rounded-full overflow-hidden" style={{ background: D.track }}>
                          <div className="h-full rounded-full transition-all duration-700" style={{ width: `${pct}%`, background: over ? "#ef4444" : "#10b981" }} />
                        </div>
                        {over && (
                          <p className="text-[10px] mt-1" style={{ color: "#ef4444" }}>
                            {((item.value / item.who - 1) * 100).toFixed(0)}% above WHO
                          </p>
                        )}
                      </div>
                    )
                  })}
                </div>
              </div>
            </div>
          )}

          {/* ── All stations ── */}
          {!dataLoading && (
            <div>
              <h2 className="text-base font-semibold mb-3" style={{ color: D.title }}>All Stations</h2>
              <div className="space-y-2">
                {districtsData.map((station) => (
                  <button
                    key={station.id}
                    onClick={() => onLocationSelect?.(station.name)}
                    className="w-full rounded-2xl p-3 border text-left flex items-center justify-between active:opacity-70 transition-opacity"
                    style={{
                      background:  selectedLocation === station.name ? `${station.color}15` : D.card,
                      borderColor: selectedLocation === station.name ? `${station.color}50` : D.border,
                    }}
                  >
                    <div className="min-w-0">
                      <div className="text-sm font-medium truncate" style={{ color: D.title }}>{station.name}</div>
                      <div className="text-xs mt-0.5" style={{ color: D.muted }}>
                        PM2.5 {station.components.pm2_5.toFixed(1)} · NO₂ {station.components.no2.toFixed(1)} μg/m³
                      </div>
                    </div>
                    <div className="flex flex-col items-end gap-1 ml-2 shrink-0">
                      <span className="text-xs font-bold" style={{ color: station.color }}>
                        AQI {station.aqi}
                      </span>
                      <span className="text-[10px] font-medium px-1.5 py-0.5 rounded-full" style={{ background: `${station.color}20`, color: station.color }}>
                        {station.level.split(" ")[0]}
                      </span>
                      {station.error && <span className="text-[10px]" style={{ color: D.muted }}>⚠ no data</span>}
                    </div>
                  </button>
                ))}
              </div>
            </div>
          )}

          <div className="h-4" />
        </div>
      </div>

      {/* ════════════════ DESKTOP (unchanged) ════════════════ */}
      <div className="hidden md:block h-full rounded-lg border border-border">
        <div className="relative h-[calc(100vh-12rem)] border-t">
          <div className="absolute top-4 right-2 z-[1000]">
            <Select onValueChange={(value) => {
              const loc = ALL_LOCATIONS.find((l) => l.name === value)
              if (loc && mapRef.current) { mapRef.current.flyTo([loc.coordinates.lat, loc.coordinates.lng], 13); onLocationSelect?.(loc.name) }
            }}>
              <SelectTrigger className="w-[200px] bg-white/90 backdrop-blur-sm">
                <SelectValue placeholder="Select a location" />
              </SelectTrigger>
              <SelectContent>
                <SelectGroup><SelectLabel>Abuja</SelectLabel>         {ABUJA_LOCATIONS.map((l)         => <SelectItem key={l.name} value={l.name}>{l.name}</SelectItem>)}</SelectGroup>
                <SelectGroup><SelectLabel>Port Harcourt</SelectLabel> {PORT_HARCOURT_LOCATIONS.map((l) => <SelectItem key={l.name} value={l.name}>{l.name}</SelectItem>)}</SelectGroup>
                <SelectGroup><SelectLabel>Lagos</SelectLabel>         {LAGOS_LOCATIONS.map((l)         => <SelectItem key={l.name} value={l.name}>{l.name}</SelectItem>)}</SelectGroup>
              </SelectContent>
            </Select>
          </div>

          <div className="absolute top-4 left-4 z-[1000] flex items-center gap-2">
            {/* GPS button — desktop */}
            <Button
              onClick={handleGetGPS}
              disabled={gpsLoading}
              size="sm"
              className="bg-white/95 hover:bg-white text-gray-700 border border-gray-200 shadow-lg backdrop-blur-sm flex items-center gap-1.5"
              title="Use my current location"
            >
              {gpsLoading
                ? <Loader2 className="w-4 h-4 animate-spin text-[#00A7B3]" />
                : <Navigation className="w-4 h-4 text-[#00A7B3]" />
              }
              <span className="text-xs">{gpsLoading ? "Locating…" : "My location"}</span>
            </Button>
            {!isSearchExpanded ? (
              <Button onClick={() => setIsSearchExpanded(true)} size="sm" className="bg-white/95 hover:bg-white text-gray-700 border border-gray-200 shadow-lg backdrop-blur-sm">
                <Search className="w-4 h-4" />
              </Button>
            ) : (
              <div className="bg-white/98 backdrop-blur-md rounded-lg shadow-xl border border-gray-200 p-3 min-w-[340px]">
                <div className="flex items-center gap-2">
                  <Search className={`w-4 h-4 flex-shrink-0 ${isSearching ? "text-blue-500 animate-pulse" : "text-gray-500"}`} />
                  <input
                    ref={searchInputRef}
                    value={searchAddress}
                    onChange={(e) => setSearchAddress(e.target.value)}
                    placeholder="Search locations in Nigeria..."
                    className="flex-1 bg-transparent border-none outline-none text-sm placeholder-gray-500 py-1"
                    onKeyDown={(e) => {
                      if (e.key === "Enter")  handleAddressSearch()
                      if (e.key === "Escape") { setIsSearchExpanded(false); setSearchResults([]); setSearchAddress("") }
                    }}
                    disabled={isSearching}
                  />
                  <Button onClick={handleAddressSearch} size="sm" disabled={isSearching || !searchAddress.trim()} className="bg-blue-500 hover:bg-blue-600 text-white px-3 py-1 text-xs">
                    {isSearching ? <Loader2 className="w-3 h-3 animate-spin" /> : "Search"}
                  </Button>
                  <Button onClick={() => { setIsSearchExpanded(false); setSearchResults([]); setSearchAddress("") }} size="sm" variant="ghost" className="p-1 h-auto">
                    <X className="w-4 h-4" />
                  </Button>
                </div>
                {searchResults.length > 0 && (
                  <div className="mt-3 max-h-56 overflow-y-auto border-t border-gray-100 pt-2">
                    {searchResults.map((r, i) => (
                      <div key={i} onClick={() => handleAddressSelect(r)} className="p-3 cursor-pointer hover:bg-blue-50 text-sm text-gray-700 border-b border-gray-50 last:border-b-0 rounded-md">
                        <div className="truncate font-medium">{r.display_name.split(",")[0]}</div>
                        <div className="truncate text-xs text-gray-500 mt-1">{r.display_name}</div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}
          </div>

          <MapContainer ref={mapRef} center={[9.0765, 7.3986]} zoom={11} style={{ height: "100%", width: "100%" }} className="z-0">
            <MapStyleController viewMode={viewMode} />
            <MapClickHandler onClick={handleMapClick} />
            {!dataLoading && districtsData.map((s) => <AirQualityMarker key={s.id} station={s} selectedGas={selectedGas} isSelected={selectedLocation === s.name} onLocationSelect={onLocationSelect} />)}
            {customMarker && <AirQualityMarker key="custom" station={customMarker} selectedGas={selectedGas} isSelected={false} />}
          </MapContainer>

          {dataLoading && (
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 bg-gray-800/90 backdrop-blur-sm rounded-lg p-4 border border-gray-600 z-[1000]">
              <div className="flex items-center gap-3">
                <Loader2 className="w-5 h-5 animate-spin text-blue-400" />
                <span className="text-white text-sm">Loading air quality data…</span>
              </div>
            </div>
          )}
          {dataError && !dataLoading && (
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 bg-gray-800/90 backdrop-blur-sm rounded-lg p-4 border border-red-600 z-[1000]">
              <div className="text-center">
                <AlertTriangle className="w-8 h-8 text-red-400 mx-auto mb-2" />
                <p className="text-red-300 text-sm mb-3">{dataError}</p>
                <Button onClick={fetchDistrictsData} size="sm" className="bg-blue-600 hover:bg-blue-700">
                  <RefreshCw className="w-4 h-4 mr-2" /> Retry
                </Button>
              </div>
            </div>
          )}
        </div>
      </div>
    </>
  )
}