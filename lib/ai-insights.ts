// lib/ai-insights.ts
// Reusable client for the /api/insights endpoint.
// Works in both Next.js (web) and React Native / Expo (mobile) — just pass the correct baseUrl.

import { fr } from "date-fns/locale"
import type { InsightRequest, InsightsResponse } from "@/app/api/insights/route"

export type { InsightRequest, InsightsResponse }

interface FetchInsightsOptions {
  /**
   * Override the base URL — required for React Native / Expo since
   * relative URLs don't work outside a browser.
   * Web: leave undefined (defaults to "/api/insights")
   * Mobile: pass your deployed URL e.g. "https://your-app.vercel.app"
   */
  baseUrl?: string
  /** Abort signal for request cancellation */
  signal?: AbortSignal
}

/**
 * Fetch AI-generated insights for a given air quality reading.
 *
 * @example — Web (Next.js)
 * const data = await fetchAIInsights({ location: "Abuja", gasType: "pm2_5", aqi: 75, components: { pm2_5: 20 } })
 *
 * @example — Mobile (React Native / Expo)
 * const data = await fetchAIInsights(
 *   { location: "Lagos", gasType: "no2", aqi: 120, components: { no2: 45 }, platform: "mobile" },
 *   { baseUrl: "https://your-app.vercel.app" }
 * )
 */
export async function fetchAIInsights(
  payload: InsightRequest,
  options: FetchInsightsOptions = {}
): Promise<InsightsResponse> {
  const { baseUrl = "", signal } = options
  const url = `${baseUrl}/api/insights`

  const res = await fetch(url, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
    signal,
  })

  if (!res.ok) {
    const err = await res.json().catch(() => ({ error: "Unknown error" }))
    throw new Error(err.error ?? `Insights API error: ${res.status}`)
  }

  return res.json() as Promise<InsightsResponse>
}

// ─── Convenience helpers ──────────────────────────────────────────────────────

/**
 * Build an InsightRequest from a raw GeoJSON air quality API response.
 * Matches the shape returned by your /api/air-quality route.
 */
export function buildInsightRequest(
  location: string,
  gasType: string,
  apiResponse: {
    features: Array<{
      properties: {
        air_quality_index: number
        components: Record<string, number>
        timestamp: number
      }
    }>
  },
  platform: "web" | "mobile" = "web"
): InsightRequest {
  const props = apiResponse.features[0].properties
  return {
    location,
    gasType,
    aqi: props.air_quality_index,
    components: props.components,
    timestamp: props.timestamp,
    platform,
  }
}