"use client"

import { useState } from "react"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Search, MapPin, Sparkles } from "lucide-react"

const suggestions = ["New York, NY", "Los Angeles, CA", "London, UK", "Tokyo, Japan", "Paris, France"]

export function HeroSection() {
  const [location, setLocation] = useState("")
  const [showSuggestions, setShowSuggestions] = useState(false)
  const [filteredSuggestions, setFilteredSuggestions] = useState(suggestions)

  const handleLocationChange = (value: string) => {
    setLocation(value)
    const filtered = suggestions.filter((suggestion) => suggestion.toLowerCase().includes(value.toLowerCase()))
    setFilteredSuggestions(filtered)
    setShowSuggestions(value.length > 0)
  }

  const selectSuggestion = (suggestion: string) => {
    setLocation(suggestion)
    setShowSuggestions(false)
  }

  return (
    <section className="relative py-20 px-4 sm:px-6 lg:px-8 overflow-hidden">
      {/* Background Elements */}
      <div className="absolute inset-0 bg-gradient-to-br from-blue-50 via-white to-green-50" />
      <div className="absolute top-20 left-10 w-72 h-72 bg-blue-200/30 rounded-full blur-3xl animate-pulse" />
      <div className="absolute bottom-20 right-10 w-96 h-96 bg-green-200/30 rounded-full blur-3xl animate-pulse delay-1000" />

      <div className="relative max-w-5xl mx-auto text-center">
        <div className="inline-flex items-center gap-2 bg-blue-50 text-blue-700 px-4 py-2 rounded-full text-sm font-medium mb-6 border border-blue-200">
          <Sparkles className="w-4 h-4" />
          Powered by Sentinel-5P Satellite Data
        </div>

        <h1 className="text-5xl md:text-7xl font-bold text-gray-900 mb-6 leading-tight">
          Track Air Quality in{" "}
          <span className="bg-gradient-to-r from-blue-600 via-blue-700 to-green-600 bg-clip-text text-transparent animate-gradient">
            Real-Time
          </span>
        </h1>

        <p className="text-xl md:text-2xl text-gray-600 mb-12 max-w-3xl mx-auto leading-relaxed">
          Monitor global air pollution with precision satellite data and AI-powered insights
        </p>

        {/* Enhanced Search Bar */}
        <div className="max-w-lg mx-auto relative">
          <div className="relative group">
            <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5 group-focus-within:text-blue-500 transition-colors" />
            <Input
              type="text"
              placeholder="Search for any location worldwide..."
              value={location}
              onChange={(e) => handleLocationChange(e.target.value)}
              onFocus={() => setShowSuggestions(location.length > 0)}
              className="pl-12 pr-12 py-4 text-lg border-2 border-blue-200 focus:border-blue-400 rounded-2xl bg-white/80 backdrop-blur-sm shadow-lg hover:shadow-xl transition-all duration-300 focus:shadow-xl"
            />
            <MapPin className="absolute right-4 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
          </div>

          {/* Autocomplete Suggestions */}
          {showSuggestions && filteredSuggestions.length > 0 && (
            <div className="absolute top-full left-0 right-0 mt-2 bg-white/95 backdrop-blur-sm border border-blue-200 rounded-xl shadow-xl z-10 overflow-hidden">
              {filteredSuggestions.map((suggestion, index) => (
                <button
                  key={index}
                  onClick={() => selectSuggestion(suggestion)}
                  className="w-full px-4 py-3 text-left hover:bg-blue-50 transition-colors border-b border-blue-100 last:border-b-0 flex items-center gap-3"
                >
                  <MapPin className="w-4 h-4 text-gray-400" />
                  {suggestion}
                </button>
              ))}
            </div>
          )}

          <Button
            className="mt-6 px-8 py-3 bg-gradient-to-r from-blue-600 to-green-600 hover:from-blue-700 hover:to-green-700 text-white rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-105"
            size="lg"
          >
            Start Monitoring
          </Button>
        </div>
      </div>
    </section>
  )
}
