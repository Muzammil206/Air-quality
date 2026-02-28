"use client"

import { Button } from "@/components/ui/button"
import { Bell, Settings, User, LogOut } from "lucide-react"
import { ThemeToggle } from "@/components/theme-toggle"
import Image from "next/image"
import { useState } from "react"
import { supabase } from "@/lib/supabaseClient"
import { useRouter } from "next/navigation"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"

export function TopNavigation() {
  const [isLoading, setIsLoading] = useState(false)
  const router = useRouter()

  const handleLogout = async () => {
    setIsLoading(true)
    try {
      await supabase.auth.signOut()
      router.push("/login")
    } catch (error) {
      console.error("Logout error:", error)
    } finally {
      setIsLoading(false)
    }
  }

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

        

        <ThemeToggle />

        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" size="sm" className="rounded-full p-1">
              <div className="w-8 h-8 bg-muted rounded-full flex items-center justify-center">
                <User className="w-4 h-4" />
              </div>
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-48">
            <DropdownMenuItem disabled>
              <span className="text-xs text-muted-foreground">My Account</span>
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem onClick={handleLogout} disabled={isLoading}>
              <LogOut className="w-4 h-4 mr-2" />
              <span>{isLoading ? "Logging out..." : "Logout"}</span>
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </div>
  )
}