// app/api/insights/route.ts
import { GoogleGenerativeAI } from "@google/generative-ai"

const genAI = new GoogleGenerativeAI(process.env.GOOGLE_GENERATIVE_AI_API_KEY ?? process.env.GEMINI_API_KEY ?? "")

// ─── Types ────────────────────────────────────────────────────────────────────

export interface InsightRequest {
  location: string
  gasType: string
  aqi: number
  components: {
    pm2_5?: number
    pm10?: number
    no2?: number
    o3?: number
    so2?: number
    co?: number
    nh3?: number
    no?: number
  }
  timestamp?: number
  /** Optional: "web" | "mobile" — affects response verbosity */
  platform?: "web" | "mobile"
}

export interface InsightItem {
  title: string
  description: string
  severity: "low" | "medium" | "high"
}

export interface HealthRecommendation {
  actions: string[]
  precautions: string[]
}

export interface InsightsResponse {
  main: InsightItem & { timestamp: number }
  pollutants: InsightItem
  gases: InsightItem
  recommendations: HealthRecommendation
  generatedAt: number
}

// ─── AQI helpers ──────────────────────────────────────────────────────────────

function aqiLabel(aqi: number): string {
  if (aqi <= 50)  return "Good"
  if (aqi <= 100) return "Moderate"
  if (aqi <= 150) return "Unhealthy for Sensitive Groups"
  if (aqi <= 200) return "Unhealthy"
  if (aqi <= 300) return "Very Unhealthy"
  return "Hazardous"
}

function aqiSeverity(aqi: number): "low" | "medium" | "high" {
  if (aqi <= 100) return "low"
  if (aqi <= 150) return "medium"
  return "high"
}

// ─── Prompt builder ───────────────────────────────────────────────────────────

function buildPrompt(data: InsightRequest, isMobile: boolean): string {
  const { location, gasType, aqi, components: c } = data
  const label = aqiLabel(aqi)

  const brevityNote = isMobile
    ? "Keep all descriptions under 20 words. Be very concise."
    : "Keep descriptions clear and informative, 1–2 sentences each."

  return `You are AirSense AI, an air quality expert for Nigeria. Analyze this data and respond ONLY with a JSON object — no markdown, no explanation, no code fences.

Location: ${location}
Primary pollutant focus: ${gasType.toUpperCase()}
AQI: ${aqi} (${label})
PM2.5: ${c.pm2_5 ?? "N/A"} μg/m³
PM10: ${c.pm10 ?? "N/A"} μg/m³
NO₂: ${c.no2 ?? "N/A"} μg/m³
O₃: ${c.o3 ?? "N/A"} μg/m³
SO₂: ${c.so2 ?? "N/A"} μg/m³
CO: ${c.co ?? "N/A"} μg/m³

${brevityNote}

Respond with exactly this JSON shape:
{
  "main": {
    "title": "string — overall air quality headline",
    "description": "string — summary of current conditions",
    "severity": "low" | "medium" | "high"
  },
  "pollutants": {
    "title": "string — particulate matter headline",
    "description": "string — PM2.5 and PM10 analysis vs WHO guidelines (PM2.5 >15 μg/m³ is above guideline)",
    "severity": "low" | "medium" | "high"
  },
  "gases": {
    "title": "string — gas pollutants headline",
    "description": "string — analysis of CO, NO₂, and the primary focus gas",
    "severity": "low" | "medium" | "high"
  },
  "recommendations": {
    "actions": ["string", "string", "string"],
    "precautions": ["string", "string", "string"]
  }
}`
}

// ─── Route handler ────────────────────────────────────────────────────────────

export async function POST(req: Request) {
  try {
    const body: InsightRequest = await req.json()

    const { location, gasType, aqi, components, timestamp, platform = "web" } = body

    // Validate required fields
    if (!location || !gasType || aqi === undefined || !components) {
      return Response.json(
        { error: "Missing required fields: location, gasType, aqi, components" },
        { status: 400 }
      )
    }

    const isMobile = platform === "mobile"

    const model = genAI.getGenerativeModel({
      model: "gemini-2.5-flash", 
      systemInstruction: {
        role: "system",
        parts: [{ text: "You are an air quality expert. Always respond with valid JSON only. Never include markdown or code fences." }],
      },
    })

    const prompt = buildPrompt(body, isMobile)
    const result = await model.generateContent(prompt)
    const raw = result.response.text().trim()

    // Strip any accidental markdown fences
    const cleaned = raw.replace(/^```json\s*/i, "").replace(/^```\s*/i, "").replace(/```$/i, "").trim()

    let parsed
    try {
      parsed = JSON.parse(cleaned)
    } catch {
      console.error("[insights] Failed to parse Gemini response:", raw)
      return Response.json(
        { error: "AI returned malformed JSON", raw },
        { status: 502 }
      )
    }

    // Attach metadata
    const response: InsightsResponse = {
      main:            { ...parsed.main,       timestamp: timestamp ?? Date.now() },
      pollutants:      parsed.pollutants,
      gases:           parsed.gases,
      recommendations: parsed.recommendations,
      generatedAt:     Date.now(),
    }

    // Override severity from real AQI in case model is inconsistent
    response.main.severity = aqiSeverity(aqi)

    return Response.json(response)
  } catch (err) {
    console.error("[insights/route]", err)
    return Response.json({ error: "Internal server error" }, { status: 500 })
  }
}