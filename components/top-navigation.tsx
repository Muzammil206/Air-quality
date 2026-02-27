"use client"

import { Button } from "@/components/ui/button"
import { Bell, Settings, User } from "lucide-react"
import { ThemeToggle } from "@/components/theme-toggle"
import Image from "next/image"

export function TopNavigation() {
  return (
    <div className="h-14 md:h-16 border-b border-border bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 flex items-center justify-between px-4 md:px-6 gap-2">

      {/* Brand — only visible on mobile (sidebar is hidden on mobile) */}
      <div className="flex items-center gap-2 md:hidden">
        <Image src="/logo2.svg" alt="Air Sense" width={28} height={28} />
        <span className="text-sm font-semibold italic text-[#00A7B3]">Air Sense</span>
      </div>

      {/* Right-side actions */}
      <div className="flex items-center gap-1 md:gap-3 ml-auto">
        {/* Icon-only on mobile, icon + label on md+ */}
        <Button
          variant="outline"
          size="sm"
          className="bg-cyan-500 hover:bg-cyan-600 text-white border-cyan-500 hover:border-cyan-600 px-2 md:px-3"
        >
          <Bell className="w-4 h-4" />
          <span className="hidden md:inline ml-2">Notifications</span>
        </Button>

        <Button
          variant="outline"
          size="sm"
          className="bg-cyan-500 hover:bg-cyan-600 text-white border-cyan-500 hover:border-cyan-600 px-2 md:px-3"
        >
          <Settings className="w-4 h-4" />
          <span className="hidden md:inline ml-2">Settings</span>
        </Button>

        <ThemeToggle />

        <Button variant="ghost" size="sm" className="rounded-full p-1">
          <div className="w-8 h-8 bg-muted rounded-full flex items-center justify-center">
            <User className="w-4 h-4" />
          </div>
        </Button>
      </div>
    </div>
  )
}