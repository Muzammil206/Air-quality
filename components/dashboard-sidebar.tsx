"use client"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Calendar } from "@/components/ui/calendar"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { Progress } from "@/components/ui/progress"
import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarSeparator,
} from "@/components/ui/sidebar"
import {
  Wind,
  Search,
  CalendarIcon,
  TrendingUp,
  TrendingDown,
  AlertTriangle,
  Settings,
  BarChart3,
  Download,
  Loader2,
} from "lucide-react"
import { format } from "date-fns"
import { useState } from "react"
import { useCurrentReading, useLocationStats } from "@/hooks/use-air-quality"
import type { GAS_TYPES } from "@/lib/types"

const gasTypes = [
  {
    id: "no2",
    label: "NO₂",
    name: "Nitrogen Dioxide",
    gradient: "from-blue-500 to-blue-600",
    bgGradient: "from-blue-500/10 to-blue-600/5",
    borderColor: "border-blue-500/20",
    textColor: "text-blue-300",
    activeGradient: "from-blue-500 to-blue-600",
  },
  {
    id: "co",
    label: "CO",
    name: "Carbon Monoxide",
    gradient: "from-green-500 to-green-600",
    bgGradient: "from-green-500/10 to-green-600/5",
    borderColor: "border-green-500/20",
    textColor: "text-green-300",
    activeGradient: "from-green-500 to-green-600",
  },
  {
    id: "o3",
    label: "O₃",
    name: "Ozone",
    gradient: "from-cyan-500 to-cyan-600",
    bgGradient: "from-cyan-500/10 to-cyan-600/5",
    borderColor: "border-cyan-500/20",
    textColor: "text-cyan-300",
    activeGradient: "from-cyan-500 to-cyan-600",
  },
  {
    id: "pm2_5",
    label: "PM2.5",
    name: "Fine Particles",
    gradient: "from-purple-500 to-purple-600",
    bgGradient: "from-purple-500/10 to-purple-600/5",
    borderColor: "border-purple-500/20",
    textColor: "text-purple-300",
    activeGradient: "from-purple-500 to-purple-600",
  },
  {
    id: "pm10",
    label: "PM10",
    name: "Coarse Particles",
    gradient: "from-teal-500 to-teal-600",
    bgGradient: "from-teal-500/10 to-teal-600/5",
    borderColor: "border-teal-500/20",
    textColor: "text-teal-300",
    activeGradient: "from-teal-500 to-teal-600",
  },
]

interface DashboardSidebarProps {
  selectedGas: string
  onGasChange: (gasId: string) => void
  dateRange: { from: Date | undefined; to: Date | undefined }
  onDateRangeChange: (range: { from: Date | undefined; to: Date | undefined }) => void
  selectedLocation: string
  onLocationChange: (location: string) => void
}

export function DashboardSidebar({
  selectedGas,
  onGasChange,
  dateRange,
  onDateRangeChange,
  selectedLocation,
  onLocationChange,
}: DashboardSidebarProps) {
  const [showSuggestions, setShowSuggestions] = useState(false)

  const { reading, loading: readingLoading } = useCurrentReading(
    selectedLocation,
    selectedGas as keyof typeof GAS_TYPES,
  )
  const { stats, loading: statsLoading } = useLocationStats(selectedLocation, selectedGas as keyof typeof GAS_TYPES)

  const suggestions = [
    { name: "Maitama, Abuja", type: "Government District" },
    { name: "Garki, Abuja", type: "Commercial Hub" },
    { name: "Wuse, Abuja", type: "Business District" },
    { name: "Asokoro, Abuja", type: "Diplomatic Zone" },
    { name: "Gwarinpa, Abuja", type: "Residential" },
    { name: "Kubwa, Abuja", type: "Suburban Area" },
    { name: "Gwagwalada, Abuja", type: "Area Council" },
    { name: "Kuje, Abuja", type: "Area Council" },
  ]

  const quickRanges = [
    { label: "7 days", days: 7 },
    { label: "30 days", days: 30 },
    { label: "90 days", days: 90 },
  ]

  const setQuickRange = (days: number) => {
    const to = new Date()
    const from = new Date()
    from.setDate(from.getDate() - days)
    onDateRangeChange({ from, to })
  }

  const selectedGasData = gasTypes.find((gas) => gas.id === selectedGas)

  return (
    <Sidebar className="border-r border-gray-800 bg-gray-900">
      {/* Header */}
      <SidebarHeader className="border-b border-gray-800 p-6 bg-gray-900">
        <div className="flex items-center space-x-4">
          <div className="relative">
            <div className="w-12 h-12 bg-gradient-to-br from-blue-500 via-blue-600 to-green-500 rounded-2xl flex items-center justify-center shadow-xl">
              <Wind className="w-7 h-7 text-white" />
            </div>
            <div className="absolute -top-1 -right-1 w-4 h-4 bg-green-400 rounded-full border-2 border-gray-900 animate-pulse" />
          </div>
          <div className="flex-1">
            <span className="text-2xl font-bold bg-gradient-to-r from-blue-400 via-blue-500 to-green-400 bg-clip-text text-transparent">
              AirSense
            </span>
            <div className="flex items-center gap-2 mt-1">
              <div className="text-xs text-gray-400">Abuja Dashboard</div>
              <Badge className="bg-green-500/20 text-green-300 border-green-500/30 text-xs px-2 py-0.5">Live</Badge>
            </div>
          </div>
        </div>
      </SidebarHeader>

      <SidebarContent className="p-6 space-y-8 overflow-y-auto bg-gray-900">
        {/* Location Search */}
        <SidebarGroup>
          <SidebarGroupLabel className="text-sm font-bold text-gray-200 mb-4">Abuja District</SidebarGroupLabel>
          <SidebarGroupContent>
            <div className="relative">
              <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-500 w-5 h-5" />
              <Input
                type="text"
                placeholder="Search district..."
                value={selectedLocation}
                onChange={(e) => onLocationChange(e.target.value)}
                onFocus={() => setShowSuggestions(true)}
                className="pl-12 pr-4 py-3 border-gray-700 bg-gray-800 text-gray-200 focus:border-blue-500 focus:bg-gray-800 rounded-xl placeholder:text-gray-500 transition-all duration-200"
              />
            </div>

            {showSuggestions && (
              <div className="mt-3 bg-gray-800 border border-gray-700 rounded-xl shadow-2xl overflow-hidden">
                {suggestions.map((suggestion, index) => (
                  <button
                    key={index}
                    onClick={() => {
                      onLocationChange(suggestion.name)
                      setShowSuggestions(false)
                    }}
                    className="w-full px-4 py-3 text-left hover:bg-gray-700 transition-all duration-200 border-b border-gray-700 last:border-b-0"
                  >
                    <div className="text-sm font-medium text-gray-200">{suggestion.name}</div>
                    <div className="text-xs text-gray-400">{suggestion.type}</div>
                  </button>
                ))}
              </div>
            )}
          </SidebarGroupContent>
        </SidebarGroup>

        <SidebarSeparator className="bg-gray-800" />

        {/* Gas Type Selector */}
        <SidebarGroup>
          <SidebarGroupLabel className="text-sm font-bold text-gray-200 mb-4">
            Gas Type
            {selectedGasData && (
              <Badge
                className={`${selectedGasData.bgGradient} ${selectedGasData.textColor} ${selectedGasData.borderColor} text-xs px-2 py-0.5 ml-2`}
              >
                {selectedGasData.name}
              </Badge>
            )}
          </SidebarGroupLabel>
          <SidebarGroupContent>
            <div className="grid grid-cols-1 gap-3">
              {gasTypes.map((gas) => (
                <Button
                  key={gas.id}
                  variant="outline"
                  onClick={() => onGasChange(gas.id)}
                  className={`${
                    selectedGas === gas.id
                      ? `bg-gradient-to-r ${gas.activeGradient} text-white border-transparent shadow-lg`
                      : `bg-gray-800 ${gas.textColor} border-gray-700 hover:bg-gray-700 hover:border-gray-600`
                  } px-4 py-4 rounded-xl font-medium transition-all duration-300 border flex items-center gap-3 justify-start`}
                >
                  <div className="flex-1 text-left">
                    <div className="font-bold text-lg">{gas.label}</div>
                    <div className="text-xs opacity-80">{gas.name}</div>
                  </div>
                </Button>
              ))}
            </div>
          </SidebarGroupContent>
        </SidebarGroup>

        <SidebarSeparator className="bg-gray-800" />

        {/* Date Range */}
        <SidebarGroup>
          <SidebarGroupLabel className="text-sm font-bold text-gray-200 mb-4">Time Period</SidebarGroupLabel>
          <SidebarGroupContent className="space-y-4">
            <Popover>
              <PopoverTrigger asChild>
                <Button
                  variant="outline"
                  className="w-full justify-start text-left font-normal border-gray-700 bg-gray-800 text-gray-200 hover:bg-gray-700 hover:border-gray-600 rounded-xl py-3 transition-all duration-200"
                >
                  <CalendarIcon className="mr-3 h-5 w-5 text-gray-400" />
                  <div className="flex-1">
                    <div className="text-sm font-medium">
                      {dateRange?.from ? (
                        dateRange.to ? (
                          <>
                            {format(dateRange.from, "MMM dd")} - {format(dateRange.to, "MMM dd")}
                          </>
                        ) : (
                          format(dateRange.from, "MMM dd, yyyy")
                        )
                      ) : (
                        "Select range"
                      )}
                    </div>
                    <div className="text-xs text-gray-400">Click to change</div>
                  </div>
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0 bg-gray-800 border-gray-700" align="start">
                <Calendar
                  initialFocus
                  mode="range"
                  defaultMonth={dateRange?.from}
                  selected={dateRange}
                  onSelect={(range) => {
                    if (range && range.from && range.to) {
                      onDateRangeChange({ from: range.from, to: range.to })
                    } else {
                      onDateRangeChange({ from: undefined, to: undefined })
                    }
                  }}
                  numberOfMonths={2}
                  className="rounded-xl bg-gray-800 text-gray-200"
                />
              </PopoverContent>
            </Popover>

            <div className="grid grid-cols-3 gap-2">
              {quickRanges.map((range) => (
                <Button
                  key={range.days}
                  variant="outline"
                  size="sm"
                  onClick={() => setQuickRange(range.days)}
                  className="text-xs border-gray-700 text-gray-300 hover:bg-gray-700 hover:border-gray-600 rounded-lg bg-gray-800 py-2 transition-all duration-200"
                >
                  {range.label}
                </Button>
              ))}
            </div>
          </SidebarGroupContent>
        </SidebarGroup>

        <SidebarSeparator className="bg-gray-800" />

        {/* Current Data */}
        <SidebarGroup>
          <SidebarGroupLabel className="text-sm font-bold text-gray-200 mb-4">Live Readings</SidebarGroupLabel>
          <SidebarGroupContent className="space-y-4">
            {readingLoading || statsLoading ? (
              <div className="bg-gray-800 border border-gray-700 rounded-2xl p-5 flex items-center justify-center">
                <Loader2 className="w-6 h-6 animate-spin text-blue-400" />
                <span className="ml-2 text-gray-400">Loading readings...</span>
              </div>
            ) : reading && stats ? (
              <>
                {/* Main Reading Card */}
                <div className="bg-gray-800 border border-gray-700 rounded-2xl p-5">
                  <div className="flex items-center justify-between mb-3">
                    <span className="text-sm text-gray-400 font-medium">Mean Concentration</span>
                    <div className="flex items-center gap-1">
                      {stats.trend === "up" ? (
                        <TrendingUp className="w-4 h-4 text-red-400" />
                      ) : (
                        <TrendingDown className="w-4 h-4 text-green-400" />
                      )}
                      <Badge
                        className={`text-xs ${stats.trend === "up" ? "text-red-400 border-red-500/30 bg-red-500/10" : "text-green-400 border-green-500/30 bg-green-500/10"}`}
                      >
                        {stats.changePercent}
                      </Badge>
                    </div>
                  </div>
                  <div className="flex items-baseline gap-2 mb-2">
                    <span className="text-3xl font-bold text-white">{reading.concentration.toFixed(1)}</span>
                    <span className="text-lg text-gray-400 font-medium">{reading.unit}</span>
                  </div>
                  <div className="text-xs text-gray-500">
                    Last updated: {new Date(reading.timestamp).toLocaleTimeString()}
                  </div>
                </div>

                {/* Min/Max Cards */}
                <div className="grid grid-cols-2 gap-3">
                  <div className="bg-gray-800 border border-gray-700 rounded-xl p-4 text-center">
                    <div className="text-xs text-gray-400 mb-1 font-medium">Minimum</div>
                    <div className="text-xl font-bold text-green-400">{stats.min.toFixed(1)}</div>
                    <div className="text-xs text-gray-500">Today</div>
                  </div>
                  <div className="bg-gray-800 border border-gray-700 rounded-xl p-4 text-center">
                    <div className="text-xs text-gray-400 mb-1 font-medium">Maximum</div>
                    <div className="text-xl font-bold text-red-400">{stats.max.toFixed(1)}</div>
                    <div className="text-xs text-gray-500">Today</div>
                  </div>
                </div>

                {/* Health Index Card */}
                <div className="bg-gray-800 border border-gray-700 rounded-xl p-4">
                  <div className="flex items-center gap-2 mb-3">
                    <AlertTriangle className="w-5 h-5 text-yellow-400" />
                    <span className="text-sm font-semibold text-gray-200">Health Impact</span>
                  </div>
                  <div className="flex items-center justify-between mb-3">
                    <div className="text-2xl font-bold text-white">{reading.healthIndex}</div>
                    <Badge
                      className={`${reading.qualityLevel === "Good" ? "bg-green-500/20 text-green-300 border-green-500/30" : reading.qualityLevel === "Moderate" ? "bg-yellow-500/20 text-yellow-300 border-yellow-500/30" : "bg-red-500/20 text-red-300 border-red-500/30"} text-sm px-3 py-1`}
                    >
                      {reading.qualityLevel}
                    </Badge>
                  </div>
                  <div className="space-y-2">
                    <div className="flex justify-between text-xs">
                      <span className="text-gray-400">Health Impact</span>
                      <span className="text-gray-300">{reading.healthIndex}/200</span>
                    </div>
                    <Progress value={reading.healthIndex / 2} className="h-2 bg-gray-700" />
                  </div>
                  <div className="text-xs text-gray-400 mt-2">{reading.healthRecommendation}</div>
                </div>
              </>
            ) : (
              <div className="bg-gray-800 border border-gray-700 rounded-2xl p-5 text-center">
                <div className="text-gray-400">No data available</div>
                <div className="text-xs text-gray-500 mt-1">Check your location and try again</div>
              </div>
            )}
          </SidebarGroupContent>
        </SidebarGroup>

        <SidebarSeparator className="bg-gray-800" />

        {/* Actions */}
        <SidebarGroup>
          <SidebarGroupLabel className="text-sm font-bold text-gray-200 mb-4">Quick Actions</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu className="space-y-2">
              <SidebarMenuItem>
                <SidebarMenuButton className="w-full text-gray-300 hover:bg-gray-800 hover:text-white rounded-xl py-3 transition-all duration-200">
                  <BarChart3 className="w-4 h-4" />
                  <span className="font-medium">View Analytics</span>
                </SidebarMenuButton>
              </SidebarMenuItem>
              <SidebarMenuItem>
                <SidebarMenuButton className="w-full text-gray-300 hover:bg-gray-800 hover:text-white rounded-xl py-3 transition-all duration-200">
                  <Download className="w-4 h-4" />
                  <span className="font-medium">Export Data</span>
                </SidebarMenuButton>
              </SidebarMenuItem>
              <SidebarMenuItem>
                <SidebarMenuButton className="w-full text-gray-300 hover:bg-gray-800 hover:text-white rounded-xl py-3 transition-all duration-200">
                  <Settings className="w-4 h-4" />
                  <span className="font-medium">Settings</span>
                </SidebarMenuButton>
              </SidebarMenuItem>
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>
    </Sidebar>
  )
}
