"use client"

import { useState } from "react"
import { Calendar, ChevronDown } from "lucide-react"
import { Button } from "@/components/ui/button"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { Calendar as CalendarComponent } from "@/components/ui/calendar"
import { format } from "date-fns"
import type { GAS_TYPES } from "@/lib/types"

interface DashboardControlsProps {
  selectedGas: keyof typeof GAS_TYPES
  onGasChange: (gas: keyof typeof GAS_TYPES) => void
  selectedDate: Date
  onDateChange: (date: Date) => void
}

const gasOptions = [
  { value: "no2"   as const, label: "NO₂",  color: "text-orange-500" },
  { value: "pm2_5" as const, label: "PM2.5", color: "text-yellow-500" },
  { value: "o3"    as const, label: "O₃",   color: "text-purple-500" },
  { value: "co"    as const, label: "CO",    color: "text-blue-500"   },
  { value: "so2"   as const, label: "SO₂",  color: "text-green-500"  },
]

export function DashboardControls({
  selectedGas,
  onGasChange,
  selectedDate,
  onDateChange,
}: DashboardControlsProps) {
  const [isCalendarOpen, setIsCalendarOpen] = useState(false)
  const selectedGasOption = gasOptions.find((o) => o.value === selectedGas)

  return (
    <div
      className="
        absolute z-10 flex gap-2
        /* Mobile: sit just below the TopNavigation (top-2) and stay within screen */
        top-2 left-2 right-2
        /* Desktop: original positioning with more breathing room */
        md:top-8 md:left-4 md:right-auto
      "
    >
      {/* Gas Selector */}
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button
            variant="outline"
            className="
              bg-background/80 backdrop-blur border-border hover:bg-muted/80
              justify-between
              /* Shrink on mobile so both controls fit side by side */
              min-w-[100px] flex-1
              md:min-w-[120px] md:flex-none
            "
          >
            <span className={`font-medium ${selectedGasOption?.color}`}>
              {selectedGasOption?.label}
            </span>
            <ChevronDown className="h-4 w-4 opacity-50 ml-1 shrink-0" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="start" className="w-[120px]">
          {gasOptions.map((option) => (
            <DropdownMenuItem
              key={option.value}
              onClick={() => onGasChange(option.value)}
              className="cursor-pointer"
            >
              <span className={`font-medium ${option.color}`}>{option.label}</span>
            </DropdownMenuItem>
          ))}
        </DropdownMenuContent>
      </DropdownMenu>

      {/* Date Picker */}
      <Popover open={isCalendarOpen} onOpenChange={setIsCalendarOpen}>
        <PopoverTrigger asChild>
          <Button
            variant="outline"
            className="
              bg-background/80 backdrop-blur border-border hover:bg-muted/80
              justify-between gap-2
              min-w-[130px] flex-1
              md:min-w-[150px] md:flex-none
            "
          >
            <Calendar className="h-4 w-4 shrink-0" />
            <span className="font-medium truncate">
              {format(selectedDate, "MMM dd, yyyy")}
            </span>
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-auto p-0" align="start">
          <CalendarComponent
            mode="single"
            selected={selectedDate}
            onSelect={(date) => {
              if (date) {
                onDateChange(date)
                setIsCalendarOpen(false)
              }
            }}
            initialFocus
          />
        </PopoverContent>
      </Popover>
    </div>
  )
}