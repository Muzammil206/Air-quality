"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Sparkles, Brain, RefreshCw, ThumbsUp, ThumbsDown, TrendingUp, AlertTriangle, Loader2 } from "lucide-react"
import { useState, useEffect } from "react"
import type { GAS_TYPES } from "@/lib/types"
import { generateAIInsights } from "@/lib/ai-insights"

interface GeoJSONAirQualityResponse {
  type: string
  features: Array<{
    type: string
    geometry: {
      type: string
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

interface AIInsightsProps {
  location: string
  gasType: keyof typeof GAS_TYPES
  apiResponse: GeoJSONAirQualityResponse
}

// Helper function to get AQI category and severity
const getAqiCategory = (aqi: number) => {
  if (aqi >= 0 && aqi <= 50) return { name: 'Good', severity: 'low', color: 'green' }
  if (aqi > 50 && aqi <= 100) return { name: 'Moderate', severity: 'low', color: 'green' }
  if (aqi > 100 && aqi <= 150) return { name: 'Unhealthy for Sensitive Groups', severity: 'medium', color: 'yellow' }
  if (aqi > 150 && aqi <= 200) return { name: 'Unhealthy', severity: 'high', color: 'red' }
  if (aqi > 200 && aqi <= 300) return { name: 'Very Unhealthy', severity: 'high', color: 'red' }
  return { name: 'Hazardous', severity: 'high', color: 'red' }
}

export function AIInsights({ location, gasType, apiResponse }: AIInsightsProps) {
  const [isRefreshing, setIsRefreshing] = useState(false)
  const [insights, setInsights] = useState<any[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const fetchInsights = async () => {
    setLoading(true)
    setError(null)
    setInsights([])

    try {
      if (!apiResponse || !apiResponse.features || apiResponse.features.length === 0) {
        throw new Error('No air quality data available')
      }

      const currentData = apiResponse.features[0].properties
      const aqi = currentData.air_quality_index
      const aqiInfo = getAqiCategory(aqi)
      const components = currentData.components

      // Generate main insight
      const mainInsight = {
        title: `${aqiInfo.name} Air Quality Conditions`,
        description: `The current Air Quality Index (AQI) is ${aqi}, indicating ${aqiInfo.name.toLowerCase()} conditions. PM2.5 levels are ${components.pm2_5} μg/m³ and PM10 levels are ${components.pm10} μg/m³ in ${location}.`,
        severity: aqiInfo.severity,
        timestamp: currentData.timestamp,
        recommendations: [
          "Keep track of daily air quality updates",
          "Ensure proper ventilation in indoor spaces",
          "Consider using air purifiers during peak pollution hours",
          "Follow local health guidelines for outdoor activities",
          "Stay hydrated and maintain good respiratory health",
          "Use protective masks when necessary"
        ]
      }

      // Additional insights based on specific pollutants
      const additionalInsights = [
        {
          title: "Particulate Matter Analysis",
          description: `PM2.5 concentration is ${components.pm2_5} μg/m³, while PM10 is ${components.pm10} μg/m³. These levels are ${components.pm2_5 > 12 ? 'above' : 'within'} WHO guidelines.`,
          severity: components.pm2_5 > 12 ? "medium" : "low"
        },
        {
          title: "Gas Pollutants Status",
          description: `CO levels are ${components.co} μg/m³, and NO2 levels are ${components.no2} μg/m³. ${gasType.toUpperCase()} is the primary focus pollutant.`,
          severity: components.co > 1000 ? "high" : "low"
        }
      ]

      setInsights([mainInsight, ...additionalInsights])
    } catch (err: any) {
      setError("Failed to generate insights. Please try again later.")
      console.error('Error generating insights:', err)
    } finally {
      setLoading(false)
      setIsRefreshing(false)
    }
  }

  useEffect(() => {
    if (location && gasType && apiResponse) {
      fetchInsights()
    }
  }, [location, gasType, apiResponse])

  const handleRefresh = async () => {
    setIsRefreshing(true)
    await fetchInsights()
  }

  if (loading) {
    return (
      <Card className="border-2 border-green-100 shadow-xl bg-white/80 backdrop-blur-sm">
        <CardContent className="flex items-center justify-center py-8">
          <Loader2 className="w-6 h-6 animate-spin text-green-600" />
          <span className="ml-3 text-green-700 text-sm font-medium">Generating AI insights...</span>
        </CardContent>
      </Card>
    )
  }

  if (error || !insights.length) {
    console.error('AI Insights Error:', error)
    return (
      <Card className="border-2 border-green-100 shadow-xl bg-white/80 backdrop-blur-sm">
        <CardContent className="text-center py-8">
          <Brain className="w-8 h-8 text-green-600 mx-auto mb-3" />
          <div className="text-green-700 font-medium text-sm">Unable to generate insights</div>
          <div className="text-xs text-gray-500 mt-1 max-w-[300px] mx-auto break-words">
            {error?.includes('Invalid air quality data format') 
              ? 'The air quality data format is invalid. Please check the API response.'
              : error || "Please try again later"
            }
          </div>
          <Button 
            onClick={handleRefresh} 
            size="sm" 
            className="mt-3 bg-green-600 hover:bg-green-700 text-white"
            disabled={error?.includes('Invalid air quality data format')}
          >
            Try Again
          </Button>
        </CardContent>
      </Card>
    )
  }

  const mainInsight = insights[0]

  return (
    <Card className="border-2 border-green-100 shadow-xl bg-white/80 backdrop-blur-sm">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2 text-lg text-gray-900">
            <div className="w-7 h-7 bg-green-100 rounded-lg flex items-center justify-center">
              <Brain className="w-4 h-4 text-green-600" />
            </div>
            <span className="truncate">AI Insights</span>
            <Badge className="bg-green-100 text-green-800 border-green-200 text-xs">
              <Sparkles className="w-3 h-3 mr-1" />
              Live
            </Badge>
          </CardTitle>
          <Button
            variant="outline"
            size="sm"
            onClick={handleRefresh}
            disabled={isRefreshing}
            className="border-green-200 text-green-700 hover:bg-green-50 bg-transparent h-8 px-2"
          >
            <RefreshCw className={`w-3 h-3 ${isRefreshing ? "animate-spin" : ""}`} />
          </Button>
        </div>
      </CardHeader>
      <CardContent className="space-y-4 max-h-[calc(100vh-200px)] overflow-y-auto scrollbar-thin scrollbar-thumb-gray-300 scrollbar-track-transparent">
        {/* Main Analysis */}
        <div className="bg-green-50 backdrop-blur-sm rounded-xl p-4 border border-green-100">
          <div className="flex items-start gap-3">
            <div className="w-8 h-8 bg-gradient-to-br from-green-500 to-green-600 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
              <Sparkles className="w-4 h-4 text-white" />
            </div>
            <div className="flex-1 min-w-0">
              <h4 className="font-semibold text-gray-900 mb-2 text-sm leading-tight">{mainInsight.title}</h4>
              <p className="text-gray-700 leading-relaxed mb-3 text-xs">{mainInsight.description}</p>
              <div className="flex items-center gap-2 flex-wrap">
                <Badge
                  className={`text-xs ${
                    mainInsight.severity === "high"
                      ? "bg-red-100 text-red-700 border-red-200"
                      : mainInsight.severity === "medium"
                        ? "bg-yellow-100 text-yellow-700 border-yellow-200"
                        : "bg-green-100 text-green-700 border-green-200"
                  }`}
                >
                  {mainInsight.severity} priority
                </Badge>
                <span className="text-xs text-gray-500">{new Date(mainInsight.timestamp).toLocaleTimeString()}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Additional Insights */}
        {insights.length > 1 && (
          <div className="space-y-3">
            {insights.slice(1, 3).map((insight, index) => (
              <div
                key={index}
                className={`${
                  insight.severity === "high"
                    ? "bg-red-50 border border-red-100"
                    : insight.severity === "medium"
                      ? "bg-amber-50 border border-amber-100"
                      : "bg-green-50 border border-green-100"
                } rounded-lg p-3`}
              >
                <div className="flex items-center gap-2 mb-2">
                  {insight.severity === "high" ? (
                    <AlertTriangle className="w-3 h-3 text-red-500 flex-shrink-0" />
                  ) : insight.severity === "medium" ? (
                    <AlertTriangle className="w-3 h-3 text-amber-500 flex-shrink-0" />
                  ) : (
                    <TrendingUp className="w-3 h-3 text-green-500 flex-shrink-0" />
                  )}
                  <h4
                    className={`font-semibold text-xs ${
                      insight.severity === "high"
                        ? "text-red-700"
                        : insight.severity === "medium"
                          ? "text-amber-700"
                          : "text-green-700"
                    }`}
                  >
                    {insight.title}
                  </h4>
                </div>
                <p
                  className={`text-xs leading-relaxed ${
                    insight.severity === "high"
                      ? "text-red-600"
                      : insight.severity === "medium"
                        ? "text-amber-600"
                        : "text-green-600"
                  }`}
                >
                  {insight.description}
                </p>
              </div>
            ))}
          </div>
        )}

        {/* Health Recommendations */}
        {mainInsight.recommendations && mainInsight.recommendations.length > 0 && (
          <div className="bg-gradient-to-r from-green-50 to-blue-50 rounded-lg p-3 border border-green-100">
            <h4 className="font-semibold text-gray-900 mb-2 text-sm">Health Recommendations</h4>
            <div className="space-y-3">
              <div>
                <h5 className="font-medium text-green-700 mb-1 text-xs">✓ Recommended Actions</h5>
                <ul className="text-xs text-gray-600 space-y-0.5">
                  {mainInsight.recommendations.slice(0, 3).map((rec: string, index: number) => (
                    <li key={index} className="leading-relaxed">
                      • {rec}
                    </li>
                  ))}
                </ul>
              </div>
              {mainInsight.recommendations.length > 3 && (
                <div>
                  <h5 className="font-medium text-amber-600 mb-1 text-xs">⚠ Additional Precautions</h5>
                  <ul className="text-xs text-gray-600 space-y-0.5">
                    {mainInsight.recommendations.slice(3, 6).map((rec: string, index: number) => (
                      <li key={index} className="leading-relaxed">
                        • {rec}
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Feedback */}
        <div className="flex items-center justify-between pt-3 border-t border-green-100">
          <p className="text-xs text-gray-500">Was this helpful?</p>
          <div className="flex gap-1">
            <Button
              variant="outline"
              size="sm"
              className="border-green-200 text-green-600 hover:bg-green-50 hover:text-green-700 bg-transparent h-7 px-2"
            >
              <ThumbsUp className="w-3 h-3" />
            </Button>
            <Button
              variant="outline"
              size="sm"
              className="border-red-200 text-red-500 hover:bg-red-50 hover:text-red-600 bg-transparent h-7 px-2"
            >
              <ThumbsDown className="w-3 h-3" />
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
