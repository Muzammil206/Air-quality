"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { LineChart, Line, XAxis, YAxis, ResponsiveContainer, Tooltip } from "recharts"
import { Button } from "@/components/ui/button"
import { BarChart3, TrendingUp, TrendingDown } from "lucide-react"
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
  gasType: keyof typeof GAS_TYPES
}

export function PollutantCharts({ location, gasType }: PollutantChartsProps) {
  const [chartData, setChartData] = useState<Array<{ time: string; value: number }>>([])
  const [stats, setStats] = useState({ average: 0, min: 0, max: 0, dataPoints: 0 })

  useEffect(() => {
    const data = generateChartData(gasType, location)
    setChartData(data)
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

  const isIncreasing =
    chartData.length > 1 &&
    chartData[chartData.length - 1].value > chartData[0].value

  const gasColor = getGasColor(gasType)

  return (
    // Padding tightened on mobile, normal on sm+
    <div className="p-3 sm:p-6 space-y-4 sm:space-y-6">
      <Card className={`border-l-4 ${gasInfo.borderColor}`}>
        <CardHeader className="pb-2 sm:pb-3 px-3 sm:px-6 pt-3 sm:pt-6">
          <div className="flex items-start justify-between gap-2">
            <div className="min-w-0 flex-1">
              {/* Gas badge + name — wraps gracefully on narrow screens */}
              <CardTitle className="text-sm sm:text-lg font-semibold flex flex-wrap items-center gap-2 leading-tight">
                <span
                  className={`px-2 py-0.5 rounded text-xs font-bold bg-gradient-to-r ${gasInfo.gradient} text-white shrink-0`}
                >
                  {gasInfo.label}
                </span>
                <span className="truncate">{gasInfo.name} Concentration</span>
              </CardTitle>
              {/* Location — truncated if too long */}
              <p className="text-xs sm:text-sm text-muted-foreground mt-1 truncate">{location}</p>
            </div>
            <Button variant="ghost" size="sm" className="shrink-0 p-1 sm:p-2">
              <BarChart3 className="w-4 h-4" />
            </Button>
          </div>
        </CardHeader>

        <CardContent className="px-3 sm:px-6 pb-3 sm:pb-6">
          {/* Chart — taller on mobile so it's readable */}
          <div className="h-36 sm:h-40 mb-3 sm:mb-4">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={chartData}>
                <XAxis
                  dataKey="time"
                  axisLine={false}
                  tickLine={false}
                  tick={{ fontSize: 10, fill: "hsl(var(--muted-foreground))" }}
                  // Show fewer ticks on small screens
                  interval="preserveStartEnd"
                />
                <YAxis hide />
                <Tooltip
                  contentStyle={{
                    background: "hsl(var(--background))",
                    border: "1px solid hsl(var(--border))",
                    borderRadius: "8px",
                    fontSize: "12px",
                  }}
                  formatter={(value: number) => [`${value} ${gasInfo.unit}`, gasInfo.label]}
                  labelFormatter={(label) => `Time: ${label}`}
                />
                <Line
                  type="monotone"
                  dataKey="value"
                  stroke={gasColor}
                  strokeWidth={2.5}
                  dot={{ fill: gasColor, strokeWidth: 2, r: 3 }}
                  activeDot={{ r: 5, stroke: gasColor, strokeWidth: 2 }}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>

          {/* Stats grid — 2×2 on all sizes, compact on mobile */}
          <div className="grid grid-cols-2 gap-2 sm:gap-4 text-xs sm:text-sm">
            {[
              { label: "Average", value: `${stats.average} ${gasInfo.unit}` },
              { label: "Min", value: `${stats.min} ${gasInfo.unit}` },
              { label: "Max", value: `${stats.max} ${gasInfo.unit}` },
              { label: "Data Points", value: stats.dataPoints },
            ].map(({ label, value }) => (
              <div key={label} className="bg-muted/30 rounded-lg p-2 sm:p-0 sm:bg-transparent">
                <div className="text-muted-foreground text-[11px] sm:text-sm">{label}</div>
                <div className="font-semibold text-xs sm:text-sm mt-0.5">{value}</div>
              </div>
            ))}
          </div>

          {/* 24h trend */}
          <div className="mt-3 sm:mt-4 p-2 sm:p-3 bg-muted/50 rounded-lg">
            <div className="flex items-center justify-between text-xs sm:text-sm">
              <span className="text-muted-foreground">24h Trend:</span>
              <span
                className={`font-semibold flex items-center gap-1 ${
                  isIncreasing ? "text-red-500" : "text-green-500"
                }`}
              >
                {isIncreasing ? (
                  <TrendingUp className="w-3.5 h-3.5" />
                ) : (
                  <TrendingDown className="w-3.5 h-3.5" />
                )}
                {isIncreasing ? "Increasing" : "Decreasing"}
              </span>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}