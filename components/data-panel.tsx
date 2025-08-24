"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { Activity, TrendingUp, TrendingDown, AlertTriangle } from "lucide-react"

const mockData = {
  mean: 42.3,
  min: 18.7,
  max: 89.2,
  unit: "μg/m³",
  level: "Moderate",
  levelColor: "bg-yellow-100 text-yellow-800 border-yellow-300",
  trend: "up",
  change: "+5.2%",
  healthIndex: 65,
}

export function DataPanel() {
  const getHealthColor = (index: number) => {
    if (index <= 50) return "bg-green-500"
    if (index <= 100) return "bg-yellow-500"
    if (index <= 150) return "bg-orange-500"
    return "bg-red-500"
  }

  const getHealthLabel = (index: number) => {
    if (index <= 50) return "Good"
    if (index <= 100) return "Moderate"
    if (index <= 150) return "Unhealthy for Sensitive Groups"
    return "Unhealthy"
  }

  return (
    <div className="space-y-6">
      {/* Current Readings Card */}
      <Card className="border-2 border-green-100 shadow-xl bg-white/80 backdrop-blur-sm">
        <CardHeader className="pb-4">
          <CardTitle className="text-lg flex items-center gap-2">
            <div className="w-8 h-8 bg-green-100 rounded-lg flex items-center justify-center">
              <Activity className="w-5 h-5 text-green-600" />
            </div>
            Current Readings
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="text-center">
            <div className="flex items-center justify-center gap-2 mb-2">
              <p className="text-3xl font-bold text-gray-900">{mockData.mean}</p>
              <span className="text-lg text-gray-500">{mockData.unit}</span>
              {mockData.trend === "up" ? (
                <TrendingUp className="w-5 h-5 text-red-500" />
              ) : (
                <TrendingDown className="w-5 h-5 text-green-500" />
              )}
            </div>
            <p className="text-sm text-gray-600">Mean Concentration</p>
            <Badge
              variant="outline"
              className={`mt-2 ${mockData.trend === "up" ? "text-red-600 border-red-200" : "text-green-600 border-green-200"}`}
            >
              {mockData.change} from yesterday
            </Badge>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="text-center p-3 bg-green-50 rounded-xl">
              <p className="text-sm text-gray-600 mb-1">Minimum</p>
              <p className="text-xl font-bold text-green-600">{mockData.min}</p>
            </div>
            <div className="text-center p-3 bg-red-50 rounded-xl">
              <p className="text-sm text-gray-600 mb-1">Maximum</p>
              <p className="text-xl font-bold text-red-600">{mockData.max}</p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Air Quality Level Card */}
      <Card className="border-2 border-blue-100 shadow-xl bg-white/80 backdrop-blur-sm">
        <CardHeader className="pb-4">
          <CardTitle className="text-lg flex items-center gap-2">
            <div className="w-8 h-8 bg-blue-100 rounded-lg flex items-center justify-center">
              <AlertTriangle className="w-5 h-5 text-blue-600" />
            </div>
            Health Index
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="text-center">
            <div className="text-2xl font-bold text-gray-900 mb-1">{mockData.healthIndex}</div>
            <Badge className={`${mockData.levelColor} px-3 py-1 text-sm font-medium`}>
              {getHealthLabel(mockData.healthIndex)}
            </Badge>
          </div>

          <div className="space-y-2">
            <div className="flex justify-between text-sm">
              <span>Health Impact</span>
              <span>{mockData.healthIndex}/200</span>
            </div>
            <Progress
              value={mockData.healthIndex / 2}
              className="h-3"
              style={{
                background: `linear-gradient(to right, ${getHealthColor(mockData.healthIndex)} 0%, ${getHealthColor(mockData.healthIndex)} 100%)`,
              }}
            />
          </div>

          <div className="text-xs text-gray-600 bg-gray-50 p-3 rounded-lg">
            <strong>Recommendation:</strong> Moderate activity is acceptable for most people. Sensitive individuals
            should consider reducing prolonged outdoor exertion.
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
