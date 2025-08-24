"use client"

import { Button } from "@/components/ui/button"
import { Calendar } from "@/components/ui/calendar"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { CalendarIcon, Clock } from "lucide-react"
import { format } from "date-fns"

interface DateRangePickerProps {
  dateRange: { from: Date | undefined; to: Date | undefined }
  onDateRangeChange: (range: { from: Date | undefined; to: Date | undefined }) => void
}

export function DateRangePicker({ dateRange, onDateRangeChange }: DateRangePickerProps) {
  const quickRanges = [
    { label: "Last 7 days", days: 7 },
    { label: "Last 30 days", days: 30 },
    { label: "Last 90 days", days: 90 },
  ]

  const setQuickRange = (days: number) => {
    const to = new Date()
    const from = new Date()
    from.setDate(from.getDate() - days)
    onDateRangeChange({ from, to })
  }

  return (
    <div className="bg-white/60 backdrop-blur-sm rounded-2xl p-6 border border-blue-100 shadow-lg">
      <div className="flex items-center gap-2 mb-6">
        <Clock className="w-5 h-5 text-blue-600" />
        <h3 className="text-xl font-bold text-gray-900">Time Period</h3>
      </div>

      <div className="flex flex-col sm:flex-row gap-4">
        <Popover>
          <PopoverTrigger asChild>
            <Button
              variant="outline"
              className="justify-start text-left font-normal border-2 border-blue-200 bg-white/80 hover:bg-blue-50 hover:border-blue-300 rounded-xl px-4 py-3 transition-all duration-200"
            >
              <CalendarIcon className="mr-2 h-4 w-4" />
              {dateRange?.from ? (
                dateRange.to ? (
                  <>
                    {format(dateRange.from, "MMM dd, yyyy")} - {format(dateRange.to, "MMM dd, yyyy")}
                  </>
                ) : (
                  format(dateRange.from, "MMM dd, yyyy")
                )
              ) : (
                <span>Pick a date range</span>
              )}
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-auto p-0" align="start">
            <Calendar
              initialFocus
              mode="range"
              defaultMonth={dateRange?.from}
              selected={dateRange}
              onSelect={(range: any) => onDateRangeChange(range)}
              numberOfMonths={2}
              className="rounded-xl"
            />
          </PopoverContent>
        </Popover>

        <div className="flex gap-2">
          {quickRanges.map((range) => (
            <Button
              key={range.days}
              variant="outline"
              size="sm"
              onClick={() => setQuickRange(range.days)}
              className="border-blue-200 text-blue-700 hover:bg-blue-50 hover:border-blue-300 rounded-lg transition-all duration-200"
            >
              {range.label}
            </Button>
          ))}
        </div>
      </div>
    </div>
  )
}
