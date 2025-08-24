"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { TrendingUp, Download, Share2, BarChart3, LineChart, Activity, Loader2 } from "lucide-react"
import {
  LineChart as RechartsLineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  AreaChart,
  Area,
  BarChart,
  Bar,
} from "recharts"
import { useState, useMemo } from "react"
import { useHistoricalData } from "@/hooks/use-air-quality"
import type { GAS_TYPES } from "@/lib/types"
import { format } from "date-fns"

interface ChartSectionProps {
  location: string
  gasType: keyof typeof GAS_TYPES
  dateRange: { from: Date | undefined; to: Date | undefined }
}

type ChartType = "line" | "area" | "bar"

export function ChartSection({ location, gasType, dateRange }: ChartSectionProps) {
  const [chartType, setChartType] = useState<ChartType>("line")

  const startDate = dateRange.from || new Date(Date.now() - 7 * 24 * 60 * 60 * 1000)
  const endDate = dateRange.to || new Date()

  const { data, loading, error } = useHistoricalData(location, gasType, startDate, endDate)

  const chartData = useMemo(() => {
    return data.map((reading) => ({
      timestamp: reading.timestamp,
      date: format(new Date(reading.timestamp), "MMM dd"),
      time: format(new Date(reading.timestamp), "HH:mm"),
      concentration: reading.concentration,
      healthIndex: reading.healthIndex,
      qualityLevel: reading.qualityLevel,
    }))
  }, [data])

  const getQualityColor = (level: string) => {
    switch (level) {
      case "Good":
        return "#10b981"
      case "Moderate":
        return "#f59e0b"
      case "Unhealthy for Sensitive Groups":
        return "#f97316"
      case "Unhealthy":
        return "#ef4444"
      case "Very Unhealthy":
        return "#dc2626"
      default:
        return "#6b7280"
    }
  }

  const exportData = () => {
    const csvContent = [
      ["Date", "Time", "Concentration", "Health Index", "Quality Level"],
      ...chartData.map((d) => [d.date, d.time, d.concentration, d.healthIndex, d.qualityLevel]),
    ]
      .map((row) => row.join(","))
      .join("\n")

    const blob = new Blob([csvContent], { type: "text/csv" })
    const url = window.URL.createObjectURL(blob)
    const a = document.createElement("a")
    a.href = url
    a.download = `air-quality-${location}-${gasType}-${format(new Date(), "yyyy-MM-dd")}.csv`
    a.click()
    window.URL.revokeObjectURL(url)
  }

  const shareData = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: `Air Quality Data - ${location}`,
          text: `${gasType} concentration data for ${location} from ${format(startDate, "MMM dd")} to ${format(endDate, "MMM dd")}`,
          url: window.location.href,
        })
      } catch (error) {
        console.log("Error sharing:", error)
      }
    } else {
      // Fallback: copy to clipboard
      navigator.clipboard.writeText(window.location.href)
    }
  }

  const renderChart = () => {
    const commonProps = {
      data: chartData,
      margin: { top: 5, right: 30, left: 20, bottom: 5 },
    }

    switch (chartType) {
      case "area":
        return (
          <AreaChart {...commonProps}>
            <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
            <XAxis dataKey="date" stroke="#6b7280" fontSize={12} />
            <YAxis stroke="#6b7280" fontSize={12} />
            <Tooltip
              contentStyle={{
                backgroundColor: "#f9fafb",
                border: "1px solid #e5e7eb",
                borderRadius: "8px",
                fontSize: "12px",
              }}
              labelFormatter={(label) => `Date: ${label}`}
              formatter={(value: any, name: string) => [
                `${value}${name === "concentration" ? " μg/m³" : ""}`,
                name === "concentration" ? "Concentration" : "Health Index",
              ]}
            />
            <Legend />
            <Area
              type="monotone"
              dataKey="concentration"
              stroke="#3b82f6"
              fill="#3b82f6"
              fillOpacity={0.3}
              name="Concentration"
            />
          </AreaChart>
        )

      case "bar":
        return (
          <BarChart {...commonProps}>
            <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
            <XAxis dataKey="date" stroke="#6b7280" fontSize={12} />
            <YAxis stroke="#6b7280" fontSize={12} />
            <Tooltip
              contentStyle={{
                backgroundColor: "#f9fafb",
                border: "1px solid #e5e7eb",
                borderRadius: "8px",
                fontSize: "12px",
              }}
              labelFormatter={(label) => `Date: ${label}`}
              formatter={(value: any, name: string) => [
                `${value}${name === "concentration" ? " μg/m³" : ""}`,
                name === "concentration" ? "Concentration" : "Health Index",
              ]}
            />
            <Legend />
            <Bar dataKey="concentration" fill="#3b82f6" name="Concentration" radius={[2, 2, 0, 0]} />
          </BarChart>
        )

      default: // line
        return (
          <RechartsLineChart {...commonProps}>
            <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
            <XAxis dataKey="date" stroke="#6b7280" fontSize={12} />
            <YAxis stroke="#6b7280" fontSize={12} />
            <Tooltip
              contentStyle={{
                backgroundColor: "#f9fafb",
                border: "1px solid #e5e7eb",
                borderRadius: "8px",
                fontSize: "12px",
              }}
              labelFormatter={(label) => `Date: ${label}`}
              formatter={(value: any, name: string) => [
                `${value}${name === "concentration" ? " μg/m³" : ""}`,
                name === "concentration" ? "Concentration" : "Health Index",
              ]}
            />
            <Legend />
            <Line
              type="monotone"
              dataKey="concentration"
              stroke="#3b82f6"
              strokeWidth={2}
              dot={{ fill: "#3b82f6", strokeWidth: 2, r: 4 }}
              name="Concentration"
            />
            <Line
              type="monotone"
              dataKey="healthIndex"
              stroke="#10b981"
              strokeWidth={2}
              dot={{ fill: "#10b981", strokeWidth: 2, r: 4 }}
              name="Health Index"
            />
          </RechartsLineChart>
        )
    }
  }

  if (loading) {
    return (
      <Card className="border-2 border-blue-100 shadow-xl bg-white/80 backdrop-blur-sm">
        <CardHeader className="pb-4">
          <CardTitle className="flex items-center gap-2 text-xl">
            <div className="w-8 h-8 bg-blue-100 rounded-lg flex items-center justify-center">
              <TrendingUp className="w-5 h-5 text-blue-600" />
            </div>
            Concentration Over Time
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="h-80 flex items-center justify-center">
            <div className="text-center">
              <Loader2 className="w-12 h-12 animate-spin text-blue-600 mx-auto mb-4" />
              <p className="text-gray-600 font-medium">Loading historical data...</p>
              <p className="text-gray-500 text-sm mt-1">
                Fetching {gasType} readings for {location}
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    )
  }

  if (error || !data.length) {
    return (
      <Card className="border-2 border-red-100 shadow-xl bg-white/80 backdrop-blur-sm">
        <CardHeader className="pb-4">
          <CardTitle className="flex items-center gap-2 text-xl">
            <div className="w-8 h-8 bg-red-100 rounded-lg flex items-center justify-center">
              <TrendingUp className="w-5 h-5 text-red-600" />
            </div>
            Concentration Over Time
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="h-80 flex items-center justify-center">
            <div className="text-center">
              <Activity className="w-12 h-12 text-red-500 mx-auto mb-4" />
              <p className="text-red-600 font-medium">Unable to load chart data</p>
              <p className="text-gray-500 text-sm mt-1">{error || "No data available for the selected period"}</p>
            </div>
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card className="border-2 border-blue-100 shadow-xl bg-white/80 backdrop-blur-sm">
      <CardHeader className="pb-4">
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2 text-xl">
            <div className="w-8 h-8 bg-blue-100 rounded-lg flex items-center justify-center">
              <TrendingUp className="w-5 h-5 text-blue-600" />
            </div>
            Concentration Over Time
            <Badge className="bg-blue-100 text-blue-800 border-blue-200 ml-2">{chartData.length} data points</Badge>
          </CardTitle>
          <div className="flex gap-2">
            <Select value={chartType} onValueChange={(value: ChartType) => setChartType(value)}>
              <SelectTrigger className="w-32 border-blue-200 text-blue-700 hover:bg-blue-50">
                <BarChart3 className="w-4 h-4 mr-1" />
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="line">
                  <div className="flex items-center gap-2">
                    <LineChart className="w-4 h-4" />
                    Line Chart
                  </div>
                </SelectItem>
                <SelectItem value="area">
                  <div className="flex items-center gap-2">
                    <Activity className="w-4 h-4" />
                    Area Chart
                  </div>
                </SelectItem>
                <SelectItem value="bar">
                  <div className="flex items-center gap-2">
                    <BarChart3 className="w-4 h-4" />
                    Bar Chart
                  </div>
                </SelectItem>
              </SelectContent>
            </Select>
            <Button
              variant="outline"
              size="sm"
              onClick={exportData}
              className="border-blue-200 text-blue-700 hover:bg-blue-50 bg-transparent"
            >
              <Download className="w-4 h-4 mr-1" />
              Export
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={shareData}
              className="border-blue-200 text-blue-700 hover:bg-blue-50 bg-transparent"
            >
              <Share2 className="w-4 h-4" />
            </Button>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <div className="h-80 w-full">
          <ResponsiveContainer width="100%" height="100%">
            {renderChart()}
          </ResponsiveContainer>
        </div>

        <div className="mt-4 grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="text-center p-3 bg-blue-50 rounded-lg">
            <p className="text-sm text-gray-600 mb-1">Average</p>
            <p className="text-lg font-bold text-blue-600">
              {(chartData.reduce((sum, d) => sum + d.concentration, 0) / chartData.length).toFixed(1)} μg/m³
            </p>
          </div>
          <div className="text-center p-3 bg-green-50 rounded-lg">
            <p className="text-sm text-gray-600 mb-1">Minimum</p>
            <p className="text-lg font-bold text-green-600">
              {Math.min(...chartData.map((d) => d.concentration)).toFixed(1)} μg/m³
            </p>
          </div>
          <div className="text-center p-3 bg-red-50 rounded-lg">
            <p className="text-sm text-gray-600 mb-1">Maximum</p>
            <p className="text-lg font-bold text-red-600">
              {Math.max(...chartData.map((d) => d.concentration)).toFixed(1)} μg/m³
            </p>
          </div>
          <div className="text-center p-3 bg-purple-50 rounded-lg">
            <p className="text-sm text-gray-600 mb-1">Data Points</p>
            <p className="text-lg font-bold text-purple-600">{chartData.length}</p>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
