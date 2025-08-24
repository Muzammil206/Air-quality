"use client"

import { useState } from "react"
import { SidebarProvider, SidebarInset } from "@/components/ui/sidebar"
import { DashboardSidebar } from "@/components/dashboard-sidebar"
import { DashboardHeader } from "@/components/dashboard-header"
import { MapSection } from "@/components/map-section"
import { AIInsights } from "@/components/ai-insights"
import { ChartSection } from "@/components/chart-section"
import { DataPanel } from "@/components/data-panel"
import type { GAS_TYPES } from "@/lib/types"

export default function DashboardPage() {
  const [selectedGas, setSelectedGas] = useState<keyof typeof GAS_TYPES>("no2")
  const [dateRange, setDateRange] = useState<{ from: Date | undefined; to: Date | undefined }>({
    from: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000), // 7 days ago
    to: new Date(),
  })
  const [selectedLocation, setSelectedLocation] = useState("Maitama, Abuja")

  return (
    <SidebarProvider>
      <div className="min-h-screen flex w-full bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900">
        <DashboardSidebar
          selectedGas={selectedGas}
          onGasChange={(gasId) => setSelectedGas(gasId as keyof typeof GAS_TYPES)}
          dateRange={dateRange}
          onDateRangeChange={setDateRange}
          selectedLocation={selectedLocation}
          onLocationChange={setSelectedLocation}
        />
        <SidebarInset className="flex-1">
          <DashboardHeader />
          <main className="flex-1 p-6 space-y-6 h-[calc(100vh-4rem)] overflow-y-auto">
            {/* Main content grid */}
            <div className="grid grid-cols-1 xl:grid-cols-4 gap-6 h-full">
              {/* Left column - Map and Data Panel */}
              <div className="xl:col-span-2 space-y-6">
                <div className="h-[500px]">
                  <MapSection selectedLocation={selectedLocation} onLocationSelect={setSelectedLocation} />
                </div>
                {/* <DataPanel location={selectedLocation} gasType={selectedGas} /> */}
              </div>

              {/* Right column - Chart and AI Insights */}
              <div className="xl:col-span-2 space-y-6">
                <ChartSection location={selectedLocation} gasType={selectedGas} dateRange={dateRange} />
                <AIInsights location={selectedLocation} gasType={selectedGas} />
              </div>
            </div>
          </main>
        </SidebarInset>
      </div>
    </SidebarProvider>
  )
}
