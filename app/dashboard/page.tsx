"use client"

import { useState } from "react"
import { SidebarProvider, SidebarInset } from "@/components/ui/sidebar"
import { DashboardSidebar } from "@/components/dashboard-sidebar"
import { DashboardHeader } from "@/components/dashboard-header"
import { MapSection } from "@/components/map-section"
import { AIInsights } from "@/components/ai-insights"

export default function DashboardPage() {
  const [selectedGas, setSelectedGas] = useState("no2")
  const [dateRange, setDateRange] = useState<{ from: Date | undefined; to: Date | undefined }>({
    from: new Date(2024, 0, 1),
    to: new Date(),
  })
  const [selectedLocation, setSelectedLocation] = useState("Maitama, Abuja")

  return (
    <SidebarProvider>
      <div className="min-h-screen flex w-full bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900">
        <DashboardSidebar
          selectedGas={selectedGas}
          onGasChange={setSelectedGas}
          dateRange={dateRange}
          onDateRangeChange={setDateRange}
          selectedLocation={selectedLocation}
          onLocationChange={setSelectedLocation}
        />
        <SidebarInset className="flex-1">
          <DashboardHeader />
          <main className="flex-1 p-6 space-y-6 h-[calc(100vh-4rem)] overflow-y-auto">
            <div className="h-[calc(100vh-8rem)]">
              <MapSection />
            </div>
            <AIInsights location={selectedLocation} gasType={selectedGas} />
          </main>
        </SidebarInset>
      </div>
    </SidebarProvider>
  )
}
