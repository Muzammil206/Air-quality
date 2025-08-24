"use client"

import { Button } from "@/components/ui/button"
import { SidebarTrigger } from "@/components/ui/sidebar"
import { Separator } from "@/components/ui/separator"
import { Badge } from "@/components/ui/badge"
import { Bell, Share2, Maximize2, RefreshCw } from "lucide-react"
import { useState } from "react"

export function DashboardHeader() {
  const [isRefreshing, setIsRefreshing] = useState(false)

  const handleRefresh = () => {
    setIsRefreshing(true)
    setTimeout(() => setIsRefreshing(false), 2000)
  }

  return (
    <header className="flex h-16 shrink-0 items-center gap-2 border-b border-gray-700 px-4 bg-gray-900/95 backdrop-blur-sm">
      <SidebarTrigger className="-ml-1 text-gray-300 hover:text-white" />
      <Separator orientation="vertical" className="mr-2 h-4 bg-gray-700" />

      <div className="flex-1 flex items-center justify-between">
        <div className="flex items-center gap-4">
          <h1 className="text-lg font-semibold text-white">Abuja Air Quality Monitor</h1>
          <Badge className="bg-green-500/20 text-green-300 border-green-500/30">Live Data</Badge>
        </div>

        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={handleRefresh}
            disabled={isRefreshing}
            className="border-gray-600 text-gray-300 hover:bg-gray-800 hover:text-white bg-transparent"
          >
            <RefreshCw className={`w-4 h-4 mr-1 ${isRefreshing ? "animate-spin" : ""}`} />
            Refresh
          </Button>
          <Button
            variant="outline"
            size="sm"
            className="border-gray-600 text-gray-300 hover:bg-gray-800 hover:text-white bg-transparent"
          >
            <Share2 className="w-4 h-4 mr-1" />
            Share
          </Button>
          <Button
            variant="outline"
            size="sm"
            className="border-gray-600 text-gray-300 hover:bg-gray-800 hover:text-white bg-transparent"
          >
            <Maximize2 className="w-4 h-4 mr-1" />
            Fullscreen
          </Button>
          <Button
            variant="outline"
            size="sm"
            className="border-gray-600 text-gray-300 hover:bg-gray-800 hover:text-white bg-transparent"
          >
            <Bell className="w-4 h-4" />
          </Button>
        </div>
      </div>
    </header>
  )
}
