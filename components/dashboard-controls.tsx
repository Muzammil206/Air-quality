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
  { value: "no2" as const, label: "NO₂", color: "text-orange-500" },
  { value: "pm2_5" as const, label: "PM2.5", color: "text-yellow-500" },
  { value: "o3" as const, label: "O₃", color: "text-purple-500" },
  { value: "co" as const, label: "CO", color: "text-blue-500" },
  { value: "so2" as const, label: "SO₂", color: "text-green-500" },
]

export function DashboardControls({ selectedGas, onGasChange, selectedDate, onDateChange }: DashboardControlsProps) {
  const [isCalendarOpen, setIsCalendarOpen] = useState(false)

  const selectedGasOption = gasOptions.find((option) => option.value === selectedGas)

  return (
    <div className="absolute top-4 right-4 z-10 flex gap-3">
      {/* Gas Selector */}
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button
            variant="outline"
            className="bg-background/80 backdrop-blur border-border hover:bg-muted/80 min-w-[120px] justify-between"
          >
            <span className={`font-medium ${selectedGasOption?.color}`}>{selectedGasOption?.label}</span>
            <ChevronDown className="h-4 w-4 opacity-50" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end" className="w-[120px]">
          {gasOptions.map((option) => (
            <DropdownMenuItem key={option.value} onClick={() => onGasChange(option.value)} className="cursor-pointer">
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
            className="bg-background/80 backdrop-blur border-border hover:bg-muted/80 min-w-[140px] justify-between"
          >
            <Calendar className="h-4 w-4" />
            <span className="font-medium">{format(selectedDate, "MMM dd, yyyy")}</span>
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-auto p-0" align="end">
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
