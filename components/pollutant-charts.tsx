"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { LineChart, Line, XAxis, YAxis, ResponsiveContainer } from "recharts"
import { Button } from "@/components/ui/button"
import { BarChart3 } from "lucide-react"
import { GAS_TYPES } from "@/lib/types"
import { useEffect, useState } from "react"

const generateChartData = (gasType: keyof typeof GAS_TYPES, location: string) => {
  const baseValues = {
    no2: { base: 45, variance: 15, trend: 0.8 },
    co: { base: 3.2, variance: 1.5, trend: -0.2 },
    o3: { base: 78, variance: 20, trend: 1.2 },
    pm2_5: { base: 18, variance: 8, trend: -0.5 },
    pm10: { base: 35, variance: 12, trend: 0.3 },
    so2: { base: 12, variance: 6, trend: -0.8 },
  }

  // Location-based multipliers
  const locationMultipliers: { [key: string]: number } = {
    "Maitama, Abuja": 0.8,
    "Garki, Abuja": 1.2,
    "Wuse, Abuja": 1.3,
    "Asokoro, Abuja": 0.7,
    "Gwarinpa, Abuja": 1.0,
    "Kubwa, Abuja": 1.1,
    "Gwagwalada, Abuja": 1.4,
    "Kuje, Abuja": 1.2,
  }

  const multiplier = locationMultipliers[location] || 1.0
  const gasConfig = baseValues[gasType] || baseValues.no2

  const times = ["00:00", "04:00", "08:00", "12:00", "16:00", "20:00", "23:59"]

  return times.map((time, index) => {
    const hourlyVariation = Math.sin((index / times.length) * Math.PI * 2) * gasConfig.variance * 0.3
    const randomVariation = (Math.random() - 0.5) * gasConfig.variance * 0.4
    const trendEffect = gasConfig.trend * index * 0.1

    const value = Math.max(0, (gasConfig.base + hourlyVariation + randomVariation + trendEffect) * multiplier)

    return {
      time,
      value: gasType === "co" ? Number(value.toFixed(1)) : Math.round(value),
    }
  })
}

interface PollutantChartsProps {
  location: string
  gasType: keyof typeof GAS_TYPES // Updated to use proper gas type
}

export function PollutantCharts({ location, gasType }: PollutantChartsProps) {
  const [chartData, setChartData] = useState<Array<{ time: string; value: number }>>([])
  const [stats, setStats] = useState({
    average: 0,
    min: 0,
    max: 0,
    dataPoints: 0,
  })

  useEffect(() => {
    const data = generateChartData(gasType, location)
    setChartData(data)

    // Calculate statistics
    const values = data.map((d) => d.value)
    setStats({
      average: Number((values.reduce((a, b) => a + b, 0) / values.length).toFixed(1)),
      min: Math.min(...values),
      max: Math.max(...values),
      dataPoints: values.length,
    })
  }, [location, gasType])

  const gasInfo = GAS_TYPES[gasType]

  const getGasColor = (gasType: keyof typeof GAS_TYPES) => {
    const colors = {
      no2: "#3b82f6",
      co: "#10b981",
      o3: "#06b6d4",
      pm2_5: "#8b5cf6",
      pm10: "#14b8a6",
      so2: "#f97316",
    }
    return colors[gasType] || "#eab308"
  }

  return (
    <div className="p-6 space-y-6">
      <Card className={`border-l-4 ${gasInfo.borderColor}`}>
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="text-lg font-semibold flex items-center gap-2">
                <span className={`px-2 py-1 rounded text-xs font-bold bg-gradient-to-r ${gasInfo.gradient} text-white`}>
                  {gasInfo.label}
                </span>
                {gasInfo.name} Concentration
              </CardTitle>
              <p className="text-sm text-muted-foreground mt-1">{location}</p>
            </div>
            <Button variant="ghost" size="sm">
              <BarChart3 className="w-4 h-4" />
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          <div className="h-40 mb-4">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={chartData}>
                <XAxis
                  dataKey="time"
                  axisLine={false}
                  tickLine={false}
                  tick={{ fontSize: 12, fill: "hsl(var(--muted-foreground))" }}
                />
                <YAxis hide />
                <Line
                  type="monotone"
                  dataKey="value"
                  stroke={getGasColor(gasType)}
                  strokeWidth={3}
                  dot={{ fill: getGasColor(gasType), strokeWidth: 2, r: 4 }}
                  activeDot={{ r: 6, stroke: getGasColor(gasType), strokeWidth: 2 }}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
          <div className="grid grid-cols-2 gap-4 text-sm">
            <div>
              <div className="text-muted-foreground">Average:</div>
              <div className="font-semibold">
                {stats.average} {gasInfo.unit}
              </div>
            </div>
            <div>
              <div className="text-muted-foreground">Min:</div>
              <div className="font-semibold">
                {stats.min} {gasInfo.unit}
              </div>
            </div>
            <div>
              <div className="text-muted-foreground">Max:</div>
              <div className="font-semibold">
                {stats.max} {gasInfo.unit}
              </div>
            </div>
            <div>
              <div className="text-muted-foreground">Data Points:</div>
              <div className="font-semibold">{stats.dataPoints}</div>
            </div>
          </div>

          <div className="mt-4 p-3 bg-muted/50 rounded-lg">
            <div className="flex items-center justify-between text-sm">
              <span className="text-muted-foreground">24h Trend:</span>
              <span
                className={`font-semibold ${chartData.length > 1 && chartData[chartData.length - 1].value > chartData[0].value ? "text-red-500" : "text-green-500"}`}
              >
                {chartData.length > 1 && chartData[chartData.length - 1].value > chartData[0].value
                  ? "↗ Increasing"
                  : "↘ Decreasing"}
              </span>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
