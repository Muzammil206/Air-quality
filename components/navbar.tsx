"use client"

import { Button } from "@/components/ui/button"
import { Wind, Menu, X } from "lucide-react"
import { useState } from "react"

export function Navbar() {
  const [isMenuOpen, setIsMenuOpen] = useState(false)

  return (
    <nav className="bg-white/90 backdrop-blur-xl border-b border-blue-100/50 sticky top-0 z-50 shadow-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 bg-gradient-to-br from-blue-500 via-blue-600 to-green-500 rounded-xl flex items-center justify-center shadow-lg transform hover:scale-105 transition-transform duration-200">
              <Wind className="w-6 h-6 text-white" />
            </div>
            <div>
              <span className="text-2xl font-bold bg-gradient-to-r from-blue-600 via-blue-700 to-green-600 bg-clip-text text-transparent">
                AirSense
              </span>
              <div className="text-xs text-gray-500 -mt-1">Real-time monitoring</div>
            </div>
          </div>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center space-x-6">
            <a href="#" className="text-gray-600 hover:text-blue-600 transition-colors font-medium">
              Dashboard
            </a>
            <a href="#" className="text-gray-600 hover:text-blue-600 transition-colors font-medium">
              Analytics
            </a>
            <a href="#" className="text-gray-600 hover:text-blue-600 transition-colors font-medium">
              Alerts
            </a>
            <Button
              variant="outline"
              className="border-2 border-blue-200 text-blue-700 hover:bg-blue-50 hover:border-blue-300 bg-transparent transition-all duration-200"
            >
              Login
            </Button>
          </div>

          {/* Mobile Menu Button */}
          <Button variant="ghost" size="icon" className="md:hidden" onClick={() => setIsMenuOpen(!isMenuOpen)}>
            {isMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </Button>
        </div>

        {/* Mobile Navigation */}
        {isMenuOpen && (
          <div className="md:hidden py-4 border-t border-blue-100">
            <div className="flex flex-col space-y-3">
              <a href="#" className="text-gray-600 hover:text-blue-600 transition-colors font-medium px-2 py-1">
                Dashboard
              </a>
              <a href="#" className="text-gray-600 hover:text-blue-600 transition-colors font-medium px-2 py-1">
                Analytics
              </a>
              <a href="#" className="text-gray-600 hover:text-blue-600 transition-colors font-medium px-2 py-1">
                Alerts
              </a>
              <Button variant="outline" className="mt-2 border-blue-200 text-blue-700 hover:bg-blue-50 bg-transparent">
                Login
              </Button>
            </div>
          </div>
        )}
      </div>
    </nav>
  )
}
