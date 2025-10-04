"use server"

import type { GAS_TYPES, AirQualityReading } from "@/lib/types"
import { fetchCurrentReading } from "@/lib/air-quality-api"

interface GeoJSONAirQualityResponse {
  type: string
  features: Array<{
    type: string
    geometry: {
      type: string
      coordinates: [number, number]
    }
    properties: {
      air_quality_index: number
      aqi_description: string
      components: Record<string, number>
      timestamp: number
      location: {
        lat: number
        lon: number
      }
    }
  }>
}

export async function generateAIInsights(
  location: string,
  gasType: keyof typeof GAS_TYPES,
  apiResponse: GeoJSONAirQualityResponse,
) {
  try {
    // Validate the entire response structure
    if (!apiResponse || 
        !apiResponse.type || 
        !apiResponse.features || 
        !Array.isArray(apiResponse.features) || 
        apiResponse.features.length === 0 ||
        !apiResponse.features[0].properties ||
        !apiResponse.features[0].properties.components ||
        !apiResponse.features[0].properties.air_quality_index ||
        !apiResponse.features[0].properties.location
    ) {
      console.error('Invalid API response structure:', apiResponse)
      throw new Error("Invalid air quality data format. Missing required fields.")
    }
    
    const { properties } = apiResponse.features[0]
    const { components, air_quality_index, timestamp } = properties

    const prompt = `
      Based on the following air quality data for ${location}, provide comprehensive analysis and actionable recommendations for ${gasType} levels.

      AQI: ${air_quality_index} (${properties.aqi_description})
      Components: ${JSON.stringify(components, null, 2)}
      Location: ${location}
      Coordinates: ${properties.location.lat}, ${properties.location.lon}
      Timestamp: ${new Date(timestamp * 1000).toISOString()}

      Please structure your response as a JSON array of objects, each with: title, description, severity (low|medium|high), timestamp (ISO), and recommendations (array of strings).

      The first object should be the main summary with detailed analysis, others can be specific insights about health impacts, trends, and precautions.

      Focus on practical advice for residents and highlight any concerning patterns or positive trends.
    `

    const payload = {
      contents: [{ role: "user", parts: [{ text: prompt }] }],
    }

    const apiKey = process.env.GEMINI_API_KEY
    if (!apiKey) {
      throw new Error("Gemini API key not configured")
    }

    const apiUrl = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash-preview-05-20:generateContent?key=${apiKey}`

    const response = await fetch(apiUrl, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    })

    if (!response.ok) {
      throw new Error(`API call failed with status: ${response.status}`)
    }

    const result = await response.json()
    const text = result?.candidates?.[0]?.content?.parts?.[0]?.text

    let parsed = []
    if (text) {
      try {
        parsed = JSON.parse(text)
      } catch (e) {
        const match = text.match(/\[[\s\S]*\]/)
        if (match) parsed = JSON.parse(match[0])
      }
    }

    if (parsed && Array.isArray(parsed) && parsed.length > 0) {
      return { 
        success: true, 
        data: parsed, 
        airQualityData: {
          ...apiResponse,
          components: properties.components,
          aqi: properties.air_quality_index
        }
      }
    } else {
      throw new Error("No valid insights found in the API response.")
    }
  } catch (error: any) {
    return { success: false, error: error.message || "Failed to generate insights" }
  }
}
