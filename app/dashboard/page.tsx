"use client"

import { useState } from "react"
import { SidebarNavigation } from "@/components/sidebar-navigation"
import { TopNavigation } from "@/components/top-navigation"
import { MapSection } from "@/components/map-section"
import { PollutantCharts } from "@/components/pollutant-charts"
import { AIInsights } from "@/components/ai-insights"
import { PollutantControls } from "@/components/pollutant-controls"
import { DashboardControls } from "@/components/dashboard-controls"
import { Card } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import type { GAS_TYPES } from "@/lib/types"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { useAirQualityInsights } from "@/hooks/use-air-quality-insights"

export default function DashboardPage() {
  const [selectedGas, setSelectedGas] = useState<keyof typeof GAS_TYPES>("no2")
  const [selectedLocation, setSelectedLocation] = useState("Maitama, Abuja")
  const [mapView, setMapView] = useState<"real-time" | "layers" | "satellite">("real-time")
  const [selectedDate, setSelectedDate] = useState(new Date())

  // Get air quality insights data
  const { data: airQualityData, isLoading, error } = useAirQualityInsights(selectedLocation, selectedGas)

  return (
    <div className="flex h-full bg-gray-50 dark:bg-gray-950">
     

      {/* Main content area */}
      <div className="flex-1 flex flex-col min-w-0 max-w-full">
        <TopNavigation />

        {/* Dashboard content */}
        <div className="flex-1 flex min-h-0">
          <div className="flex-1 relative min-w-0">
            <div className="absolute top-6 left-6 z-10 flex flex-wrap gap-2">
              {["real-time", "layers", "satellite"].map((view) => (
                <button
                  key={view}
                  onClick={() => setMapView(view as typeof mapView)}
                  className={`px-3 sm:px-4 py-2 rounded-xl text-xs sm:text-sm font-medium transition-all duration-200 shadow-sm ${
                    mapView === view
                      ? "bg-blue-500 text-white shadow-lg shadow-blue-500/25"
                      : "bg-white/90 backdrop-blur text-gray-700 hover:bg-white hover:shadow-md dark:bg-gray-800/90 dark:text-gray-300 dark:hover:bg-gray-800"
                  }`}
                >
                  {view.charAt(0).toUpperCase() + view.slice(1).replace("-", " ")}
                </button>
              ))}
            </div>

            <DashboardControls
              selectedGas={selectedGas}
              onGasChange={setSelectedGas}
              selectedDate={selectedDate}
              onDateChange={setSelectedDate}
            />

            <MapSection
              selectedLocation={selectedLocation}
              onLocationSelect={setSelectedLocation}
              viewMode={mapView}
              selectedGas={selectedGas}
            />
          </div>

                    <div className="w-[400px] bg-white dark:bg-gray-900 border-l border-border flex flex-col shadow-xl">
            <Tabs defaultValue="insights" className="h-full flex flex-col">
              <div className="border-b border-border px-4">
                <TabsList className="w-full">
                  <TabsTrigger value="insights" className="flex-1">AI Insights</TabsTrigger>
                  <TabsTrigger value="charts" className="flex-1">Charts</TabsTrigger>
                </TabsList>
              </div>
              
              <div className="flex-1 overflow-y-auto">
                <TabsContent value="insights" className="p-4 m-0 h-full">
                  <AIInsights 
                    location={selectedLocation} 
                    gasType={selectedGas} 
                    apiResponse={airQualityData || {
                      type: "FeatureCollection",
                      features: []
                    }}
                  />
                </TabsContent>
                
                <TabsContent value="charts" className="p-4 m-0 h-full">
                  <PollutantCharts 
                    location={selectedLocation} 
                    gasType={selectedGas} 
                  />
                </TabsContent>
              </div>
            </Tabs>
          </div>
        </div>

        <div className="border-t border-border bg-white dark:bg-gray-900 flex-shrink-0 shadow-lg overflow-x-auto">
          <div className="min-w-[640px]">
            <PollutantControls 
              selectedGas={selectedGas} 
              onGasChange={(gasId) => setSelectedGas(gasId as keyof typeof GAS_TYPES)} 
            />
          </div>
        </div>
      </div>
    </div>
  )
}
