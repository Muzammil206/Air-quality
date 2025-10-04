"use client"

import { useEffect } from "react"
import { useMap } from "react-leaflet"
import L from "leaflet"

interface HeatmapPoint {
  lat: number
  lng: number
  intensity: number
}

interface SimpleHeatmapLayerProps {
  points: HeatmapPoint[]
  radius?: number
  blur?: number
  maxZoom?: number
  max?: number
  gradient?: Record<string, string>
  opacity?: number
}

export default function SimpleHeatmapLayer({
  points,
  radius = 50,
  blur = 35,
  maxZoom = 17,
  max = 3.0,
  gradient,
  opacity = 0.8,
}: SimpleHeatmapLayerProps) {
  const map = useMap()

  useEffect(() => {
    console.log("[v0] Creating simple heatmap with", points.length, "points")
    console.log("[v0] Heatmap settings - Radius:", radius, "Blur:", blur, "Max:", max, "Opacity:", opacity)

    let heatmapLayer: L.LayerGroup | null = null

    if (points.length > 0) {
      try {
        // Create a layer group to hold all heatmap circles
        heatmapLayer = L.layerGroup()

        // Get gradient colors
        const gradientColors = gradient || {
          0.0: "#10b981", // Excellent - Emerald
          0.2: "#22c55e", // Good - Green
          0.4: "#eab308", // Moderate - Yellow
          0.7: "#f97316", // Unhealthy - Orange
          1.0: "#ef4444", // Hazardous - Red
        }

        // Convert gradient object to sorted array
        const gradientStops = Object.entries(gradientColors)
          .map(([stop, color]) => ({ stop: Number.parseFloat(stop), color }))
          .sort((a, b) => a.stop - b.stop)

        // Function to get color based on intensity
        const getColor = (intensity: number) => {
          if (intensity <= gradientStops[0].stop) return gradientStops[0].color
          if (intensity >= gradientStops[gradientStops.length - 1].stop)
            return gradientStops[gradientStops.length - 1].color

          // Find the two stops to interpolate between
          for (let i = 0; i < gradientStops.length - 1; i++) {
            if (intensity >= gradientStops[i].stop && intensity <= gradientStops[i + 1].stop) {
              // Simple interpolation - just return the lower color for now
              // Could implement proper color interpolation here
              return gradientStops[i + 1].color
            }
          }
          return gradientStops[gradientStops.length - 1].color
        }

        // Create circles for each point
        points.forEach((point) => {
          const color = getColor(point.intensity)
          const circleRadius = radius * (0.3 + point.intensity * 0.7) // Scale radius based on intensity

          const circle = L.circle([point.lat, point.lng], {
            radius: circleRadius * 10, // Convert to meters (approximate)
            fillColor: color,
            color: color,
            weight: 0,
            fillOpacity: opacity * point.intensity,
            className: "heatmap-circle",
          })

          if (heatmapLayer) {
            heatmapLayer.addLayer(circle)
          }
        })

        // Add the layer group to the map
        if (heatmapLayer) {
          heatmapLayer.addTo(map)
          console.log("[v0] Simple heatmap layer added successfully")
        }
      } catch (error) {
        console.error("[v0] Error creating simple heatmap:", error)
      }
    } else {
      console.log("[v0] No points provided for heatmap")
    }

    // Cleanup function
    return () => {
      if (heatmapLayer && map.hasLayer(heatmapLayer)) {
        console.log("[v0] Removing simple heatmap layer")
        map.removeLayer(heatmapLayer)
      }
    }
  }, [map, points, radius, blur, maxZoom, max, gradient, opacity])

  return null
}
