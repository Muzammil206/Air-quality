"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Sparkles, Brain, RefreshCw, ThumbsUp, ThumbsDown, TrendingUp, AlertTriangle, Loader2 } from "lucide-react"
import { useState } from "react"
import { useAIInsights } from "@/hooks/use-air-quality"
import type { GAS_TYPES } from "@/lib/types"

interface AIInsightsProps {
  location: any
  gasType: any
}

export function AIInsights({ location, gasType }: AIInsightsProps) {
  const [isRefreshing, setIsRefreshing] = useState(false)

  const { insights, loading, error, refresh } = useAIInsights(location, gasType)

  const handleRefresh = async () => {
    setIsRefreshing(true)
    await refresh()
    setTimeout(() => setIsRefreshing(false), 1000)
  }

  if (loading) {
    return (
      <Card className="border-2 border-purple-500/30 shadow-xl bg-gradient-to-br from-purple-500/5 via-gray-800/90 to-blue-500/5 backdrop-blur-sm">
        <CardContent className="flex items-center justify-center py-12">
          <Loader2 className="w-8 h-8 animate-spin text-purple-400" />
          <span className="ml-3 text-purple-300">Generating AI insights...</span>
        </CardContent>
      </Card>
    )
  }

  if (error || !insights.length) {
    return (
      <Card className="border-2 border-purple-500/30 shadow-xl bg-gradient-to-br from-purple-500/5 via-gray-800/90 to-blue-500/5 backdrop-blur-sm">
        <CardContent className="text-center py-12">
          <Brain className="w-12 h-12 text-purple-400 mx-auto mb-4" />
          <div className="text-purple-300 font-medium">Unable to generate insights</div>
          <div className="text-sm text-gray-400 mt-1">{error || "Please try again later"}</div>
          <Button onClick={handleRefresh} className="mt-4 bg-purple-600 hover:bg-purple-700">
            Try Again
          </Button>
        </CardContent>
      </Card>
    )
  }

  const mainInsight = insights[0]

  return (
    <Card className="border-2 border-purple-500/30 shadow-xl bg-gradient-to-br from-purple-500/5 via-gray-800/90 to-blue-500/5 backdrop-blur-sm">
      <CardHeader className="pb-4">
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2 text-xl text-white">
            <div className="w-8 h-8 bg-gradient-to-br from-purple-500 to-blue-500 rounded-lg flex items-center justify-center">
              <Brain className="w-5 h-5 text-white" />
            </div>
            AI-Powered Insights for {location}
            <Badge className="bg-purple-500/20 text-purple-300 border-purple-500/30 ml-2">
              <Sparkles className="w-3 h-3 mr-1" />
              Live Analysis
            </Badge>
          </CardTitle>
          <Button
            variant="outline"
            size="sm"
            onClick={handleRefresh}
            disabled={isRefreshing}
            className="border-purple-500/30 text-purple-300 hover:bg-purple-500/10 hover:text-purple-200 bg-transparent"
          >
            <RefreshCw className={`w-4 h-4 mr-1 ${isRefreshing ? "animate-spin" : ""}`} />
            Refresh
          </Button>
        </div>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Main Analysis */}
        <div className="bg-gray-800/70 backdrop-blur-sm rounded-xl p-5 border border-gray-600">
          <div className="flex items-start gap-3">
            <div className="w-10 h-10 bg-gradient-to-br from-purple-400 to-blue-400 rounded-full flex items-center justify-center flex-shrink-0 mt-1">
              <Sparkles className="w-5 h-5 text-white" />
            </div>
            <div className="flex-1">
              <h4 className="font-semibold text-white mb-3">{mainInsight.title}</h4>
              <p className="text-gray-300 leading-relaxed mb-4">{mainInsight.description}</p>
              <div className="flex items-center gap-2">
                <Badge
                  className={`${mainInsight.severity === "high" ? "bg-red-500/20 text-red-300 border-red-500/30" : mainInsight.severity === "medium" ? "bg-yellow-500/20 text-yellow-300 border-yellow-500/30" : "bg-green-500/20 text-green-300 border-green-500/30"}`}
                >
                  {mainInsight.severity} priority
                </Badge>
                <span className="text-xs text-gray-400">
                  Generated {new Date(mainInsight.timestamp).toLocaleTimeString()}
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Additional Insights */}
        {insights.length > 1 && (
          <div className="grid md:grid-cols-2 gap-4">
            {insights.slice(1, 3).map((insight, index) => (
              <div
                key={index}
                className={`${insight.severity === "high" ? "bg-red-500/10 border border-red-500/30" : insight.severity === "medium" ? "bg-amber-500/10 border border-amber-500/30" : "bg-green-500/10 border border-green-500/30"} rounded-xl p-4`}
              >
                <div className="flex items-center gap-2 mb-2">
                  {insight.severity === "high" ? (
                    <AlertTriangle className="w-4 h-4 text-red-400" />
                  ) : insight.severity === "medium" ? (
                    <AlertTriangle className="w-4 h-4 text-amber-400" />
                  ) : (
                    <TrendingUp className="w-4 h-4 text-green-400" />
                  )}
                  <h4
                    className={`font-semibold ${insight.severity === "high" ? "text-red-300" : insight.severity === "medium" ? "text-amber-300" : "text-green-300"}`}
                  >
                    {insight.title}
                  </h4>
                </div>
                <p
                  className={`text-sm ${insight.severity === "high" ? "text-red-200" : insight.severity === "medium" ? "text-amber-200" : "text-green-200"}`}
                >
                  {insight.description}
                </p>
              </div>
            ))}
          </div>
        )}

        {/* Health Recommendations */}
        {mainInsight.recommendations && mainInsight.recommendations.length > 0 && (
          <div className="bg-gradient-to-r from-blue-500/10 to-green-500/10 rounded-xl p-4 border border-gray-600">
            <h4 className="font-semibold text-white mb-3">Health Recommendations</h4>
            <div className="grid md:grid-cols-2 gap-4">
              <div>
                <h5 className="font-medium text-green-300 mb-2">✓ Recommended Actions</h5>
                <ul className="text-sm text-gray-300 space-y-1">
                  {mainInsight.recommendations.slice(0, 3).map((rec, index) => (
                    <li key={index}>• {rec}</li>
                  ))}
                </ul>
              </div>
              {mainInsight.recommendations.length > 3 && (
                <div>
                  <h5 className="font-medium text-amber-300 mb-2">⚠ Additional Precautions</h5>
                  <ul className="text-sm text-gray-300 space-y-1">
                    {mainInsight.recommendations.slice(3, 6).map((rec, index) => (
                      <li key={index}>• {rec}</li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Feedback */}
        <div className="flex items-center justify-between pt-4 border-t border-gray-700">
          <p className="text-sm text-gray-400">Was this analysis helpful?</p>
          <div className="flex gap-2">
            <Button
              variant="outline"
              size="sm"
              className="border-green-500/30 text-green-300 hover:bg-green-500/10 hover:text-green-200 bg-transparent"
            >
              <ThumbsUp className="w-4 h-4 mr-1" />
              Yes
            </Button>
            <Button
              variant="outline"
              size="sm"
              className="border-red-500/30 text-red-300 hover:bg-red-500/10 hover:text-red-200 bg-transparent"
            >
              <ThumbsDown className="w-4 h-4 mr-1" />
              No
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
