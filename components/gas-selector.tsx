"use client"

import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"

const gasTypes = [
  {
    id: "no2",
    label: "NO₂",
    name: "Nitrogen Dioxide",
    color: "bg-blue-100 text-blue-800 hover:bg-blue-200 border-blue-300",
    activeColor: "bg-blue-500 hover:bg-blue-600 text-white border-blue-500",
  },
  {
    id: "co",
    label: "CO",
    name: "Carbon Monoxide",
    color: "bg-green-100 text-green-800 hover:bg-green-200 border-green-300",
    activeColor: "bg-green-500 hover:bg-green-600 text-white border-green-500",
  },
  {
    id: "ch4",
    label: "CH₄",
    name: "Methane",
    color: "bg-teal-100 text-teal-800 hover:bg-teal-200 border-teal-300",
    activeColor: "bg-teal-500 hover:bg-teal-600 text-white border-teal-500",
  },
  {
    id: "o3",
    label: "O₃",
    name: "Ozone",
    color: "bg-cyan-100 text-cyan-800 hover:bg-cyan-200 border-cyan-300",
    activeColor: "bg-cyan-500 hover:bg-cyan-600 text-white border-cyan-500",
  },
  {
    id: "pm25",
    label: "PM2.5",
    name: "Fine Particles",
    color: "bg-emerald-100 text-emerald-800 hover:bg-emerald-200 border-emerald-300",
    activeColor: "bg-emerald-500 hover:bg-emerald-600 text-white border-emerald-500",
  },
]

interface GasSelectorProps {
  selectedGas: string
  onGasChange: (gasId: string) => void
}

export function GasSelector({ selectedGas, onGasChange }: GasSelectorProps) {
  return (
    <div className="bg-white/60 backdrop-blur-sm rounded-2xl p-6 border border-blue-100 shadow-lg">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h3 className="text-xl font-bold text-gray-900">Gas Type</h3>
          <p className="text-gray-600">Select pollutant to monitor</p>
        </div>
        <Badge variant="outline" className="bg-blue-50 text-blue-700 border-blue-200">
          {gasTypes.find((g) => g.id === selectedGas)?.name}
        </Badge>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
        {gasTypes.map((gas) => (
          <Button
            key={gas.id}
            variant="outline"
            onClick={() => onGasChange(gas.id)}
            className={`${
              selectedGas === gas.id
                ? `${gas.activeColor} shadow-lg transform scale-105`
                : `${gas.color} hover:scale-102`
            } px-4 py-6 rounded-xl font-semibold transition-all duration-200 border-2 flex flex-col items-center gap-2`}
          >
            <span className="text-lg">{gas.label}</span>
            <span className="text-xs opacity-80">{gas.name}</span>
          </Button>
        ))}
      </div>
    </div>
  )
}
