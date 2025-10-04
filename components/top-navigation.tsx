"use client"

import { Button } from "@/components/ui/button"
import { Bell, Settings, User } from "lucide-react"
import { ThemeToggle } from "@/components/theme-toggle"

export function TopNavigation() {
  return (
    <div className="h-16 border-b border-border bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 flex items-center justify-end px-6 gap-4">
      <Button
        variant="outline"
        size="sm"
        className="bg-cyan-500 hover:bg-cyan-600 text-white border-cyan-500 hover:border-cyan-600"
      >
        <Bell className="w-4 h-4 mr-2" />
        Notifications
      </Button>

      <Button
        variant="outline"
        size="sm"
        className="bg-cyan-500 hover:bg-cyan-600 text-white border-cyan-500 hover:border-cyan-600"
      >
        <Settings className="w-4 h-4 mr-2" />
        Settings
      </Button>

      <ThemeToggle />

      <Button variant="ghost" size="sm" className="rounded-full">
        <div className="w-8 h-8 bg-muted rounded-full flex items-center justify-center">
          <User className="w-4 h-4" />
        </div>
      </Button>
    </div>
  )
}
