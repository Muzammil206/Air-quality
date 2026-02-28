"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Sparkles, Brain, RefreshCw, ThumbsUp, ThumbsDown, TrendingUp, AlertTriangle, Loader2 } from "lucide-react"
import { useState, useEffect, useRef } from "react"
import type { GAS_TYPES } from "@/lib/types"
import { fetchAIInsights, buildInsightRequest, type InsightsResponse } from "@/lib/ai-insights"

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
      location: { lat: number; lon: number }
    }
  }>
}

interface AIInsightsProps {
  location: string
  gasType: keyof typeof GAS_TYPES
  apiResponse: GeoJSONAirQualityResponse
}

export function AIInsights({ location, gasType, apiResponse }: AIInsightsProps) {
  const [insights, setInsights]     = useState<InsightsResponse | null>(null)
  const [loading, setLoading]       = useState(false)
  const [error, setError]           = useState<string | null>(null)
  const [isRefreshing, setIsRefreshing] = useState(false)
  const abortRef = useRef<AbortController | null>(null)

  const fetchInsights = async (isRefresh = false) => {
    if (!apiResponse?.features?.length) return

    // Cancel any in-flight request
    abortRef.current?.abort()
    abortRef.current = new AbortController()

    isRefresh ? setIsRefreshing(true) : setLoading(true)
    setError(null)

    try {
      const payload = buildInsightRequest(location, gasType as string, apiResponse, "web")
      const data = await fetchAIInsights(payload, { signal: abortRef.current.signal })
      setInsights(data)
    } catch (err: any) {
      if (err.name === "AbortError") return
      console.error("[AIInsights]", err)
      setError(err.message ?? "Failed to generate insights. Please try again.")
    } finally {
      setLoading(false)
      setIsRefreshing(false)
    }
  }

  useEffect(() => {
    fetchInsights()
    return () => abortRef.current?.abort()
  }, [location, gasType, apiResponse])

  // ── Loading state ──
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

  // ── Error / empty state ──
  if (error || !insights) {
    return (
      <Card className="border-2 border-green-100 shadow-xl bg-white/80 backdrop-blur-sm">
        <CardContent className="text-center py-8">
          <Brain className="w-8 h-8 text-green-600 mx-auto mb-3" />
          <div className="text-green-700 font-medium text-sm">Unable to generate insights</div>
          <div className="text-xs text-gray-500 mt-1 max-w-[300px] mx-auto break-words">
            {error ?? "Please try again later"}
          </div>
          <Button
            onClick={() => fetchInsights(true)}
            size="sm"
            className="mt-3 bg-green-600 hover:bg-green-700 text-white"
          >
            Try Again
          </Button>
        </CardContent>
      </Card>
    )
  }

  const { main, pollutants, gases, recommendations } = insights

  const severityClasses = (severity: string) => ({
    badge: severity === "high"
      ? "bg-red-100 text-red-700 border-red-200"
      : severity === "medium"
        ? "bg-yellow-100 text-yellow-700 border-yellow-200"
        : "bg-green-100 text-green-700 border-green-200",
    card: severity === "high"
      ? "bg-red-50 border border-red-100"
      : severity === "medium"
        ? "bg-amber-50 border border-amber-100"
        : "bg-green-50 border border-green-100",
    text: severity === "high" ? "text-red-700" : severity === "medium" ? "text-amber-700" : "text-green-700",
    body: severity === "high" ? "text-red-600" : severity === "medium" ? "text-amber-600" : "text-green-600",
    icon: severity === "high"
      ? <AlertTriangle className="w-3 h-3 text-red-500 flex-shrink-0" />
      : severity === "medium"
        ? <AlertTriangle className="w-3 h-3 text-amber-500 flex-shrink-0" />
        : <TrendingUp className="w-3 h-3 text-green-500 flex-shrink-0" />,
  })

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
            onClick={() => fetchInsights(true)}
            disabled={isRefreshing}
            className="border-green-200 text-green-700 hover:bg-green-50 bg-transparent h-8 px-2"
          >
            <RefreshCw className={`w-3 h-3 ${isRefreshing ? "animate-spin" : ""}`} />
          </Button>
        </div>
      </CardHeader>

      <CardContent className="space-y-4 max-h-[calc(100vh-200px)] overflow-y-auto scrollbar-thin scrollbar-thumb-gray-300 scrollbar-track-transparent">

        {/* ── Main Analysis ── */}
        <div className="bg-green-50 backdrop-blur-sm rounded-xl p-4 border border-green-100">
          <div className="flex items-start gap-3">
            <div className="w-8 h-8 bg-gradient-to-br from-green-500 to-green-600 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
              <Sparkles className="w-4 h-4 text-white" />
            </div>
            <div className="flex-1 min-w-0">
              <h4 className="font-semibold text-gray-900 mb-2 text-sm leading-tight">{main.title}</h4>
              <p className="text-gray-700 leading-relaxed mb-3 text-xs">{main.description}</p>
              <div className="flex items-center gap-2 flex-wrap">
                <Badge className={`text-xs ${severityClasses(main.severity).badge}`}>
                  {main.severity} priority
                </Badge>
                <span className="text-xs text-gray-500">
                  {new Date(main.timestamp * 1000).toLocaleTimeString()}
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* ── Pollutants + Gases ── */}
        <div className="space-y-3">
          {[pollutants, gases].map((insight, i) => {
            const s = severityClasses(insight.severity)
            return (
              <div key={i} className={`${s.card} rounded-lg p-3`}>
                <div className="flex items-center gap-2 mb-2">
                  {s.icon}
                  <h4 className={`font-semibold text-xs ${s.text}`}>{insight.title}</h4>
                </div>
                <p className={`text-xs leading-relaxed ${s.body}`}>{insight.description}</p>
              </div>
            )
          })}
        </div>

        {/* ── Health Recommendations ── */}
        <div className="bg-gradient-to-r from-green-50 to-blue-50 rounded-lg p-3 border border-green-100">
          <h4 className="font-semibold text-gray-900 mb-2 text-sm">Health Recommendations</h4>
          <div className="space-y-3">
            <div>
              <h5 className="font-medium text-green-700 mb-1 text-xs">✓ Recommended Actions</h5>
              <ul className="text-xs text-gray-600 space-y-0.5">
                {recommendations.actions.map((rec, i) => (
                  <li key={i} className="leading-relaxed">• {rec}</li>
                ))}
              </ul>
            </div>
            {recommendations.precautions.length > 0 && (
              <div>
                <h5 className="font-medium text-amber-600 mb-1 text-xs">⚠ Additional Precautions</h5>
                <ul className="text-xs text-gray-600 space-y-0.5">
                  {recommendations.precautions.map((rec, i) => (
                    <li key={i} className="leading-relaxed">• {rec}</li>
                  ))}
                </ul>
              </div>
            )}
          </div>
        </div>

        {/* ── Feedback ── */}
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