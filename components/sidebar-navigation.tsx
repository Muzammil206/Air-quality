"use client"

import { useState } from "react"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { LayoutDashboard, Map, Layers, BarChart3, Brain, FileText, Settings, User, ChevronLeft, ChevronRight } from "lucide-react"
import Link from "next/link"
import Image from "next/image"

const navigationItems = [
  {
    icon: LayoutDashboard,
    label: "Dashboard",
    href: "/dashboard",
    active: true,
  },
  {
    icon: Map,
    label: "Map",
    href: "/dashboard/map",
  },
  {
    icon: Layers,
    label: "Layers",
    href: "/dashboard/layers",
  },
  {
    icon: BarChart3,
    label: "Calendar Map",
    href: "/dashboard/analytics",
  },
  {
    icon: Brain,
    label: " Air Sense AI ",
    href: "/dashboard/Ai",
  },
  {
    icon: FileText,
    label: "Reports",
    href: "/dashboard/reports",
  },
  {
    icon: Settings,
    label: "Settings",
    href: "/dashboard/settings",
  },
]

interface SidebarNavigationProps {
  className?: string
}

export function SidebarNavigation({ className }: SidebarNavigationProps) {
  const [activeItem, setActiveItem] = useState("Dashboard")
  const [isCollapsed, setIsCollapsed] = useState(false)

  const toggleCollapse = () => setIsCollapsed(!isCollapsed)

  return (
    <div className={cn("h-screen bg-background border-r border-border flex flex-col transition-all duration-300", 
      isCollapsed ? "w-16" : "w-64", 
      className
    )}>
      {/* Logo and Toggle */}
      <div className="p-4 border-b border-border flex items-center justify-between">
        {!isCollapsed && (
          <div className="flex items-center space-x-3">
            <Image src="/logo2.svg" alt="Air Quality Dashboard" width={32} height={32} />
            <span className="text-medium font-semibold italic text-[#00A7B3FF]">Air Sense</span>
          </div>
        )}
        <Button 
          variant="ghost" 
          size="sm" 
          onClick={toggleCollapse}
          className="p-2"
        >
          {isCollapsed ? <ChevronRight className="w-4 h-4" /> : <ChevronLeft className="w-4 h-4" />}
        </Button>
      </div>

      {/* Navigation Items */}
      <nav className="flex-1 p-2 space-y-2">
        {navigationItems.map((item) => (
          <Link key={item.label} href={item.href}>
            <Button
              variant={activeItem === item.label ? "secondary" : "ghost"}
              className={cn(
                "w-full justify-start gap-3 h-12 font-normal",
                activeItem === item.label && "bg-secondary text-secondary-foreground",
                isCollapsed ? "justify-center px-0" : "text-left"
              )}
              onClick={() => setActiveItem(item.label)}
            >
              <item.icon className="w-5 h-5" />
              {!isCollapsed && item.label}
            </Button>
          </Link>
        ))}
      </nav>

      {/* User Section */}
      <div className="p-2 border-t border-border">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="w-8 h-8 bg-muted rounded-full flex items-center justify-center">
              <User className="w-4 h-4" />
            </div>
            {!isCollapsed && <span className="text-sm font-medium">User</span>}
          </div>
          {!isCollapsed && (
            <Button variant="ghost" size="sm">
              <Settings className="w-4 h-4" />
            </Button>
          )}
        </div>
      </div>
    </div>
  )
}
