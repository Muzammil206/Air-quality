"use client"

import { useState, useEffect } from "react"
import { type PropsWithChildren } from "react"
import { cn } from "@/lib/utils"
import { usePathname } from "next/navigation"
import { Button } from "@/components/ui/button"
import {
  LayoutDashboard,
  Map,
  Layers,
  BarChart3,
  Brain,
  FileText,
  Settings,
  User,
  ChevronLeft,
  ChevronRight,
} from "lucide-react"
import Link from "next/link"
import Image from "next/image"

const navigationItems = [
  {
    icon: LayoutDashboard,
    label: "Dashboard Air Quality",
    href: "/dashboard",
  },
  {
    icon: Map,
    label: "Maps and field data",
    href: "/dashboard/map",
  },
  {
    icon: BarChart3,
    label: "Calendar Map",
    href: "/dashboard/analytics",
  },
  {
    icon: Brain,
    label: "Air Sense AI",
    href: "/dashboard/Ai",
  },
  {
    icon: FileText,
    label: "Upload field data",
    href: "/dashboard/reports",
  },
  {
    icon: Settings,
    label: "Settings",
    href: "/dashboard/settings",
  },
]

// Only these three appear in the mobile bottom nav
const mobileNavItems = [
  {
    icon: LayoutDashboard,
    label: "Dashboard",
    href: "/dashboard",
  },
  {
    icon: Brain,
    label: "Air Sense AI",
    href: "/dashboard/Ai",
  },
    {
    icon: BarChart3,
    label: "Calendar Map",
    href: "/dashboard/analytics",
  },
  {
    icon: Settings,
    label: "upload",
    href: "/dashboard/reports",
  },
]

interface SidebarNavigationProps {
  className?: string
}

export function SidebarNavigation({
  className,
  children,
}: PropsWithChildren<SidebarNavigationProps>) {
  const pathname = usePathname()
  const [isCollapsed, setIsCollapsed] = useState(false)

  useEffect(() => {
    if (pathname === "/dashboard/map") {
      setIsCollapsed(true)
    }
  }, [pathname])

  const toggleCollapse = () => setIsCollapsed(!isCollapsed)

  const isActive = (href: string) => pathname === href

  return (
    <>
      {/* ── Desktop / Tablet Sidebar ── */}
      <aside
        className={cn(
          "hidden md:flex h-full bg-background border-r border-border flex-col transition-all duration-300",
          isCollapsed ? "w-16" : "w-64",
          className
        )}
      >
        {/* Logo + Toggle */}
        <div className="p-4 border-b border-border flex items-center justify-between">
          {!isCollapsed && (
            <div className="flex items-center space-x-3">
              <Image
                src="/logo2.svg"
                alt="Air Quality Dashboard"
                width={32}
                height={32}
              />
              <span className="text-medium font-semibold italic text-[#00A7B3FF]">
                Air Sense
              </span>
            </div>
          )}
          <Button
            variant="ghost"
            size="sm"
            onClick={toggleCollapse}
            className="p-2"
          >
            {isCollapsed ? (
              <ChevronRight className="w-4 h-4" />
            ) : (
              <ChevronLeft className="w-4 h-4" />
            )}
          </Button>
        </div>

        {/* Nav Items */}
        <nav className="flex-1 p-2 space-y-2">
          {navigationItems.map((item) => (
            <Link key={item.label} href={item.href}>
              <Button
                variant={isActive(item.href) ? "secondary" : "ghost"}
                className={cn(
                  "w-full justify-start gap-3 h-12 font-normal",
                  isActive(item.href) &&
                    "bg-secondary text-secondary-foreground",
                  isCollapsed ? "justify-center px-0" : "text-left"
                )}
              >
                <item.icon className="w-5 h-5 shrink-0" />
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
              {!isCollapsed && (
                <span className="text-sm font-medium">User</span>
              )}
            </div>
            {!isCollapsed && (
              <Button variant="ghost" size="sm">
                <Settings className="w-4 h-4" />
              </Button>
            )}
          </div>
        </div>
      </aside>

      {/* ── Mobile Bottom Navigation Bar ── */}
      <nav className="md:hidden fixed bottom-0 left-0 right-0 z-50 bg-background border-t border-border">
        <div className="flex items-center justify-around px-2 py-1 safe-area-pb">
          {mobileNavItems.map((item) => {
            const active = isActive(item.href)
            return (
              <Link
                key={item.label}
                href={item.href}
                className={cn(
                  "flex flex-col items-center justify-center gap-1 flex-1 py-2 px-1 rounded-xl transition-colors",
                  active
                    ? "text-[#00A7B3FF]"
                    : "text-muted-foreground hover:text-foreground"
                )}
              >
                <div
                  className={cn(
                    "flex items-center justify-center w-10 h-6 rounded-full transition-colors",
                    active ? "bg-[#00A7B3FF]/15" : ""
                  )}
                >
                  <item.icon className="w-5 h-5" />
                </div>
                <span className="text-[10px] font-medium leading-tight text-center">
                  {item.label}
                </span>
              </Link>
            )
          })}
        </div>
      </nav>
    </>
  )
}