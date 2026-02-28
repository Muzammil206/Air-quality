// app/api/chat/route.ts
import { GoogleGenerativeAI } from "@google/generative-ai"

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY ?? "")

// Fetch live air quality directly from OpenWeather (no self-referencing localhost)
async function fetchAirQuality(lat: number, lon: number) {
  const apiKey = process.env.OPENWEATHER_API_KEY
  if (!apiKey) {
    console.error("[fetchAirQuality] Missing OPENWEATHER_API_KEY")
    return null
  }

  try {
    const res = await fetch(
      `http://api.openweathermap.org/data/2.5/air_pollution?lat=${lat}&lon=${lon}&appid=${apiKey}`
    )
    if (!res.ok) {
      console.error("[fetchAirQuality] OpenWeather error:", res.status)
      return null
    }

    const data = await res.json()
    const item = data?.list?.[0]
    if (!item) return null

    return {
      air_quality_index: item.main.aqi,
      components: item.components, // co, no, no2, o3, so2, pm2_5, pm10, nh3
    }
  } catch (err) {
    console.error("[fetchAirQuality] Fetch failed:", err)
    return null
  }
}

// Known locations — keeps the model grounded with real coordinates
const KNOWN_LOCATIONS: Record<string, { lat: number; lon: number; city: string }> = {
  // Abuja
  "maitama":         { lat: 9.0817,  lon: 7.4864,  city: "Abuja" },
  "garki":           { lat: 9.0417,  lon: 7.4731,  city: "Abuja" },
  "wuse":            { lat: 9.0579,  lon: 7.4951,  city: "Abuja" },
  "asokoro":         { lat: 9.0333,  lon: 7.5167,  city: "Abuja" },
  "gwarinpa":        { lat: 9.1167,  lon: 7.4167,  city: "Abuja" },
  "kubwa":           { lat: 9.1500,  lon: 7.3500,  city: "Abuja" },
  "gwagwalada":      { lat: 8.9433,  lon: 7.0897,  city: "Abuja" },
  "abuja":           { lat: 9.0579,  lon: 7.4951,  city: "Abuja" },
  // Lagos
  "victoria island": { lat: 6.4281,  lon: 3.4219,  city: "Lagos" },
  "lekki":           { lat: 6.4698,  lon: 3.5852,  city: "Lagos" },
  "ikeja":           { lat: 6.6018,  lon: 3.3515,  city: "Lagos" },
  "surulere":        { lat: 6.5054,  lon: 3.3562,  city: "Lagos" },
  "yaba":            { lat: 6.5144,  lon: 3.3739,  city: "Lagos" },
  "lagos":           { lat: 6.5244,  lon: 3.3792,  city: "Lagos" },
  // Port Harcourt
  "gra":             { lat: 4.8156,  lon: 7.0498,  city: "Port Harcourt" },
  "old gra":         { lat: 4.8198,  lon: 7.0412,  city: "Port Harcourt" },
  "port harcourt":   { lat: 4.8156,  lon: 7.0498,  city: "Port Harcourt" },
  "ph":              { lat: 4.8156,  lon: 7.0498,  city: "Port Harcourt" },
}

// OpenWeather returns AQI 1–5; convert to US EPA AQI scale for consistency
function owmAqiToEpaAqi(owmAqi: number): number {
  switch (owmAqi) {
    case 1: return 25    // Good
    case 2: return 75    // Moderate
    case 3: return 125   // Unhealthy for Sensitive Groups
    case 4: return 175   // Unhealthy
    case 5: return 250   // Very Unhealthy
    default: return 0
  }
}

function aqiLabel(aqi: number): string {
  if (aqi <= 50)  return "Good"
  if (aqi <= 100) return "Moderate"
  if (aqi <= 150) return "Unhealthy for Sensitive Groups"
  if (aqi <= 200) return "Unhealthy"
  if (aqi <= 300) return "Very Unhealthy"
  return "Hazardous"
}

// Extract location mentions from user message
function extractLocations(text: string): string[] {
  const lower = text.toLowerCase()
  return Object.keys(KNOWN_LOCATIONS).filter((loc) => lower.includes(loc))
}

// Build live air quality context block to inject into system prompt
async function buildAQIContext(userMessage: string): Promise<string> {
  const mentions = extractLocations(userMessage)
  if (mentions.length === 0) return ""

  const results = await Promise.all(
    mentions.slice(0, 3).map(async (loc) => {
      const coords = KNOWN_LOCATIONS[loc]
      const data = await fetchAirQuality(coords.lat, coords.lon)
      if (!data) return `${coords.city} (${loc}): data unavailable`

      const c = data.components ?? {}
      const epaAqi = owmAqiToEpaAqi(data.air_quality_index ?? 0)

      return `${coords.city} (${loc}):
  EPA AQI: ${epaAqi} — ${aqiLabel(epaAqi)}
  PM2.5: ${c.pm2_5?.toFixed(1) ?? "—"} μg/m³
  PM10:  ${c.pm10?.toFixed(1)  ?? "—"} μg/m³
  NO₂:   ${c.no2?.toFixed(2)  ?? "—"} μg/m³
  O₃:    ${c.o3?.toFixed(2)   ?? "—"} μg/m³
  SO₂:   ${c.so2?.toFixed(2)  ?? "—"} μg/m³
  CO:    ${c.co?.toFixed(1)   ?? "—"} μg/m³`
    })
  )

  return `\n\n## Live Air Quality Data (fetched right now)\n${results.join("\n\n")}`
}

export async function POST(req: Request) {
  try {
    const { messages } = await req.json()
    if (!Array.isArray(messages) || messages.length === 0) {
      return new Response("Bad request", { status: 400 })
    }

    // Get the latest user message to decide what AQI data to fetch
    const lastUserMsg = [...messages].reverse().find((m) => m.role === "user")
    const liveContext = lastUserMsg
      ? await buildAQIContext(lastUserMsg.content ?? "")
      : ""

    const systemPrompt = `You are AirSense AI, an expert environmental data assistant for a Nigerian air quality monitoring platform.

You have deep knowledge of:
- US EPA AQI scale (0–500) and what each band means for health
- Nigerian geography: Abuja, Lagos, Port Harcourt, and their districts
- Seasonal patterns: Harmattan (Nov–Mar) brings Saharan dust, dramatically raising PM2.5 in northern cities
- Pollutants: PM2.5, PM10, NO₂, O₃, SO₂, CO, NH₃ — their sources, health effects, and WHO guidelines
- WHO PM2.5 guideline: 15 μg/m³ (24-hr), PM10: 45 μg/m³

When answering:
- Be concise and data-driven. Lead with numbers.
- If the user asks about a specific location, use the live data provided below.
- If comparing cities, highlight the key difference factor (usually PM2.5 during Harmattan).
- For health advice, be practical: masks, indoor air, sensitive groups (children, elderly, asthma).
- Format responses clearly — use short paragraphs or bullet points for recommendations.
- Do NOT invent AQI numbers. Only cite values from the live data block below.
- If no live data is available for a location, say so and give general seasonal context instead.${liveContext}`

    // FIX 1: systemInstruction must be an object with parts array, not a plain string
   const model = genAI.getGenerativeModel({
  model: "gemini-2.5-flash", 
  systemInstruction: {
    role: "system",
    parts: [{ text: systemPrompt }],
  },
})

    // Gemini uses "model" / "user" roles — map "assistant" → "model"
    // History excludes the last message, which is sent via sendMessageStream
    const geminiHistory = messages.slice(0, -1).map((m: { role: string; content: string }) => ({
      role: m.role === "assistant" ? "model" : "user",
      parts: [{ text: m.content }],
    }))

    const chat = model.startChat({ history: geminiHistory })

    const lastMessage = messages[messages.length - 1].content
    const result = await chat.sendMessageStream(lastMessage)

    // FIX 3: encoder defined outside start() so it's not recreated per chunk
    const encoder = new TextEncoder()
    const readable = new ReadableStream({
      async start(controller) {
        try {
          for await (const chunk of result.stream) {
            const text = chunk.text()
            if (text) {
              controller.enqueue(
                encoder.encode(`data: ${JSON.stringify({ text })}\n\n`)
              )
            }
          }
          controller.enqueue(encoder.encode("data: [DONE]\n\n"))
        } catch (err) {
          console.error("[chat/stream error]", err)
          controller.error(err)
        } finally {
          controller.close()
        }
      },
    })

    return new Response(readable, {
      headers: {
        "Content-Type":  "text/event-stream",
        "Cache-Control": "no-cache",
        Connection:      "keep-alive",
      },
    })
  } catch (err) {
    console.error("[chat/route]", err)
    return new Response(
      JSON.stringify({ error: "Internal server error" }),
      { status: 500, headers: { "Content-Type": "application/json" } }
    )
  }
}