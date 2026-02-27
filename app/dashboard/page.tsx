"use client"

import { useState } from "react"
import { TopNavigation } from "@/components/top-navigation"
import dynamic from "next/dynamic"

const MapSection = dynamic(
  () => import("@/components/map-section").then((mod) => mod.MapSection),
  { ssr: false }
)

import { PollutantCharts } from "@/components/pollutant-charts"
import { AIInsights } from "@/components/ai-insights"
import { PollutantControls } from "@/components/pollutant-controls"
import { DashboardControls } from "@/components/dashboard-controls"
import type { GAS_TYPES } from "@/lib/types"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { useAirQualityInsights } from "@/hooks/use-air-quality-insights"

export default function DashboardPage() {
  const [selectedGas, setSelectedGas] = useState<keyof typeof GAS_TYPES>("no2")
  const [selectedLocation, setSelectedLocation] = useState("Maitama, Abuja")
  const [mapView, setMapView] = useState<"real-time" | "layers" | "satellite">("real-time")
  const [selectedDate, setSelectedDate] = useState(new Date())

  const { data: airQualityData, isLoading, error } = useAirQualityInsights(selectedLocation, selectedGas)

  return (
    /**
     * Root: fills viewport.
     * On mobile we stack vertically; on desktop we go side-by-side.
     * pb-20 md:pb-0 reserves space for the mobile bottom nav bar.
     */
    <div className="flex h-[100dvh] bg-gray-50 dark:bg-gray-950 pb-20 md:pb-0">

      {/* Main content column */}
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        <TopNavigation />

        {/*
         * Content body.
         * Mobile:  stacks vertically (flex-col)
         * Desktop: map + side-panel side-by-side (flex-row)
         */}
        <div className="flex-1 flex flex-col md:flex-row min-h-0 overflow-hidden">

          {/* ── Map area ── */}
          <div className="relative flex-1 min-h-[40vh] md:min-h-0">
            {/* View-mode pill buttons */}
            <div className="absolute top-3 left-3 z-10 flex flex-wrap gap-1.5">
              {(["real-time", "layers", "satellite"] as const).map((view) => (
                <button
                  key={view}
                  onClick={() => setMapView(view)}
                  className={`px-3 py-1.5 rounded-xl text-[11px] sm:text-xs font-medium transition-all duration-200 shadow-sm ${
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

          {/*
           * ── Side panel (AI Insights + Charts) ──
           * Mobile:  full width, fixed height, scrollable
           * Desktop: 400 px wide, full height
           */}
          <div className="
            w-full md:w-[400px]
            h-[50vh] md:h-auto
            bg-white dark:bg-gray-900
            border-t md:border-t-0 md:border-l border-border
            flex flex-col shadow-xl
            overflow-hidden
          ">
            <Tabs defaultValue="charts" className="h-full flex flex-col">
              <div className="border-b border-border px-4 flex-shrink-0">
                <TabsList className="w-full">
                  <TabsTrigger value="insights" className="flex-1">AI Insights</TabsTrigger>
                  <TabsTrigger value="charts" className="flex-1">Charts</TabsTrigger>
                </TabsList>
              </div>

              <div className="flex-1 overflow-y-auto hidden md:block">
                <TabsContent value="insights" className="p-4 m-0 h-full">
                  <AIInsights
                    location={selectedLocation}
                    gasType={selectedGas}
                    apiResponse={airQualityData ?? { type: "FeatureCollection", features: [] }}
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

        {/* ── Pollutant Controls footer ── */}
        <div className="border-t border-border bg-white dark:bg-gray-900 flex-shrink-0 shadow-lg overflow-x-auto">
          {/* min-w ensures the control strip scrolls rather than wraps on small screens */}
          <div className="min-w-[480px] hidden md:block">
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