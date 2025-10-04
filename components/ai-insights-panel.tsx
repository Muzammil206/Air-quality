"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Brain } from "lucide-react"

interface AIInsightsPanelProps {
  location: string
  gasType: string
}

export function AIInsightsPanel({ location, gasType }: AIInsightsPanelProps) {
  return (
    <Card className="border-0 shadow-none">
      <CardHeader className="pb-3">
        <CardTitle className="flex items-center gap-2 text-lg font-semibold text-cyan-500">
          <Brain className="w-5 h-5" />
          AI Insights
        </CardTitle>
      </CardHeader>
      <CardContent>
        <p className="text-sm text-muted-foreground leading-relaxed">
          AirSense AI predicts a moderate increase in PM2.5 levels in the eastern district over the next 12 hours due to
          atmospheric conditions. NO2 concentrations are expected to stabilize after morning peak traffic. Continuous
          monitoring is advised for sensitive areas.
        </p>
      </CardContent>
    </Card>
  )
}
