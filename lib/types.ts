// Air quality data types and interfaces

export interface AirQualityReading {
  id: string
  timestamp: Date
  location: {
    name: string
    district: string
    coordinates: {
      lat: number
      lng: number
    }
  }
  gasType: keyof typeof GAS_TYPES
  concentration: number
  unit: string
  healthIndex: number
  qualityLevel: "Good" | "Moderate" | "Unhealthy for Sensitive Groups" | "Unhealthy" | "Very Unhealthy" | "Hazardous"
  trend: "up" | "down"
  changePercent: string
  healthRecommendation: string
}

export interface AirQualityStats {
  mean: number
  min: number
  max: number
  trend: "up" | "down"
  changePercent: string
  unit: string
  healthIndex: number
  qualityLevel: string
  lastUpdated: Date
}

export interface LocationData {
  name: string
  district: string
  type: string
  coordinates: {
    lat: number
    lng: number
  }
  currentReading?: AirQualityReading
}

export interface WeatherData {
  windSpeed: number
  windDirection: string
  temperature: number
  humidity: number
  pressure: number
}

export interface AIInsight {
  id: string
  title: string
  description: string
  type: "analysis" | "prediction" | "recommendation" | "alert"
  severity: "low" | "medium" | "high"
  timestamp: Date
  location?: string
  recommendations?: string[]
}

export const GAS_TYPES = {
  no2: {
    id: "no2",
    label: "NO₂",
    name: "Nitrogen Dioxide",
    unit: "μg/m³",
    gradient: "from-blue-500 to-blue-600",
    bgGradient: "from-blue-500/10 to-blue-600/5",
    borderColor: "border-blue-500/20",
    textColor: "text-blue-300",
    activeGradient: "from-blue-500 to-blue-600",
  },
  co: {
    id: "co",
    label: "CO",
    name: "Carbon Monoxide",
    unit: "μg/m³",
    gradient: "from-green-500 to-green-600",
    bgGradient: "from-green-500/10 to-green-600/5",
    borderColor: "border-green-500/20",
    textColor: "text-green-300",
    activeGradient: "from-green-500 to-green-600",
  },
  o3: {
    id: "o3",
    label: "O₃",
    name: "Ozone",
    unit: "μg/m³",
    gradient: "from-cyan-500 to-cyan-600",
    bgGradient: "from-cyan-500/10 to-cyan-600/5",
    borderColor: "border-cyan-500/20",
    textColor: "text-cyan-300",
    activeGradient: "from-cyan-500 to-cyan-600",
  },
  pm2_5: {
    id: "pm2_5",
    label: "PM2.5",
    name: "Fine Particles",
    unit: "μg/m³",
    gradient: "from-purple-500 to-purple-600",
    bgGradient: "from-purple-500/10 to-purple-600/5",
    borderColor: "border-purple-500/20",
    textColor: "text-purple-300",
    activeGradient: "from-purple-500 to-purple-600",
  },
  pm10: {
    id: "pm10",
    label: "PM10",
    name: "Coarse Particles",
    unit: "μg/m³",
    gradient: "from-teal-500 to-teal-600",
    bgGradient: "from-teal-500/10 to-teal-600/5",
    borderColor: "border-teal-500/20",
    textColor: "text-teal-300",
    activeGradient: "from-teal-500 to-teal-600",
  },
  so2: {
    id: "so2",
    label: "SO₂",
    name: "Sulfur Dioxide",
    unit: "μg/m³",
    gradient: "from-orange-500 to-orange-600",
    bgGradient: "from-orange-500/10 to-orange-600/5",
    borderColor: "border-orange-500/20",
    textColor: "text-orange-300",
    activeGradient: "from-orange-500 to-orange-600",
  },
} as const

export const ABUJA_LOCATIONS: LocationData[] = [
  {
    name: "Maitama, Abuja",
    district: "Maitama",
    type: "Government District",
    coordinates: { lat: 9.0765, lng: 7.4951 },
  },
  {
    name: "Garki, Abuja",
    district: "Garki",
    type: "Commercial Hub",
    coordinates: { lat: 9.0579, lng: 7.4951 },
  },
  {
    name: "Wuse, Abuja",
    district: "Wuse",
    type: "Business District",
    coordinates: { lat: 9.0643, lng: 7.4892 },
  },
  {
    name: "Asokoro, Abuja",
    district: "Asokoro",
    type: "Diplomatic Zone",
    coordinates: { lat: 9.0765, lng: 7.5243 },
  },
  {
    name: "Gwarinpa, Abuja",
    district: "Gwarinpa",
    type: "Residential",
    coordinates: { lat: 9.1108, lng: 7.4165 },
  },
  {
    name: "Kubwa, Abuja",
    district: "Kubwa",
    type: "Suburban Area",
    coordinates: { lat: 9.1372, lng: 7.3378 },
  },
  {
    name: "Gwagwalada, Abuja",
    district: "Gwagwalada",
    type: "Area Council",
    coordinates: { lat: 8.9428, lng: 7.0839 },
  },
  {
    name: "Kuje, Abuja",
    district: "Kuje",
    type: "Area Council",
    coordinates: { lat: 8.8784, lng: 7.2248 },
  },
]

export const PORT_HARCOURT_LOCATIONS: LocationData[] = [
  {
    name: "Port Harcourt City",
    district: "Port Harcourt",
    type: "City Center",
    coordinates: { lat: 4.8156, lng: 7.0498 },
  },
  {
    name: "Rumuokoro",
    district: "Obio-Akpor",
    type: "Commercial Area",
    coordinates: { lat: 4.8536, lng: 7.0106 },
  },
  {
    name: "Trans-Amadi",
    district: "Port Harcourt",
    type: "Industrial Area",
    coordinates: { lat: 4.8242, lng: 7.0256 },
  },
  {
    name: "Rumuola",
    district: "Port Harcourt",
    type: "Residential",
    coordinates: { lat: 4.8206, lng: 7.0417 },
  },
  {
    name: "Aba Road",
    district: "Port Harcourt",
    type: "Commercial Hub",
    coordinates: { lat: 4.8106, lng: 7.0125 },
  }
]

export const LAGOS_LOCATIONS: LocationData[] = [
  {
    name: "Victoria Island",
    district: "Lagos Island",
    type: "Business District",
    coordinates: { lat: 6.4281, lng: 3.4219 },
  },
  {
    name: "Ikeja",
    district: "Ikeja",
    type: "Government District",
    coordinates: { lat: 6.6059, lng: 3.3511 },
  },
  {
    name: "Lekki",
    district: "Eti-Osa",
    type: "Residential",
    coordinates: { lat: 6.4474, lng: 3.4899 },
  },
  {
    name: "Apapa",
    district: "Apapa",
    type: "Industrial Area",
    coordinates: { lat: 6.4484, lng: 3.3626 },
  },
  {
    name: "Surulere",
    district: "Surulere",
    type: "Residential",
    coordinates: { lat: 6.5010, lng: 3.3580 },
  },
  {
    name: "Agege",
    district: "Agege",
    type: "Residential",
    coordinates: { lat: 6.6239, lng: 3.3239 },
  }
]

export const ALL_LOCATIONS = [...ABUJA_LOCATIONS, ...PORT_HARCOURT_LOCATIONS, ...LAGOS_LOCATIONS]

export interface GeoJSONFeature {
  type: "Feature"
  geometry: {
    type: "Point"
    coordinates: [number, number] // [longitude, latitude]
  }
  properties: {
    air_quality_index: number
    aqi_description: string
    components: {
      co: number
      no: number
      no2: number
      o3: number
      so2: number
      pm2_5: number
      pm10: number
      nh3: number
    }
    timestamp: number
    location: {
      lat: number
      lon: number
    }
  }
}

export interface GeoJSONResponse {
  type: "FeatureCollection"
  features: GeoJSONFeature[]
}
