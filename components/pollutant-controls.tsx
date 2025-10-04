"use client"

import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"

const pollutants = [
  { id: "no2", label: "NO2", color: "bg-purple-500", active: true },
  { id: "co", label: "CO", color: "bg-orange-500", active: false },
  { id: "o3", label: "O3", color: "bg-gray-500", active: false },
  { id: "pm2_5", label: "PM2.5", color: "bg-yellow-500", active: false },
  { id: "pm10", label: "PM10", color: "bg-gray-400", active: false },
  { id: "ch4", label: "CH4", color: "bg-gray-400", active: false },
]

interface PollutantControlsProps {
  selectedGas: string
  onGasChange: (gasId: string) => void
}

export function PollutantControls({ selectedGas, onGasChange }: PollutantControlsProps) {
  return (
    <div className="p-4">
      <div className="flex items-center justify-between mb-4">
        <div>
          <div className="text-sm font-medium text-foreground">Pollutant Layers</div>
          <div className="text-xs text-muted-foreground">Time Period</div>
        </div>
        <div className="text-sm text-muted-foreground">Last 24 Hours</div>
      </div>

      <div className="flex flex-wrap gap-2">
        {pollutants.map((pollutant) => (
          <Button
            key={pollutant.id}
            variant={selectedGas === pollutant.id ? "default" : "outline"}
            size="sm"
            onClick={() => onGasChange(pollutant.id)}
            className={cn(
              "flex items-center gap-2 h-8",
              selectedGas === pollutant.id && "bg-primary text-primary-foreground",
            )}
          >
            <div className={cn("w-3 h-3 rounded-full", pollutant.color)} />
            {pollutant.label}
          </Button>
        ))}
      </div>
    </div>
  )
}
