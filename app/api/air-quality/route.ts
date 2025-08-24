import type { NextRequest } from "next/server"

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url)
    const lat = searchParams.get("lat")
    const lon = searchParams.get("lon")
    const apiKey = process.env.OPENWEATHER_API_KEY

    console.log("API Request received:", { lat, lon, hasApiKey: !!apiKey })

    if (!lat || !lon) {
      return new Response(JSON.stringify({ error: "Missing lat/lon parameters" }), {
        status: 400,
        headers: { "Content-Type": "application/json" },
      })
    }

    if (!apiKey) {
      console.error("Missing OPENWEATHER_API_KEY environment variable")
      return new Response(JSON.stringify({ error: "Missing OpenWeather API key" }), {
        status: 500,
        headers: { "Content-Type": "application/json" },
      })
    }

    const url = `http://api.openweathermap.org/data/2.5/air_pollution?lat=${lat}&lon=${lon}&appid=${apiKey}`
    console.log("Fetching from URL:", url.replace(apiKey, "***API_KEY***"))

    const response = await fetch(url, {
      headers: {
        "Content-Type": "application/json",
      },
    })

    console.log("OpenWeather API response status:", response.status)

    if (!response.ok) {
      const errorText = await response.text()
      console.error("OpenWeather API error:", errorText)
      throw new Error(`API error: ${response.status} - ${errorText}`)
    }

    const data = await response.json()
    console.log("OpenWeather API response:", JSON.stringify(data, null, 2))

    if (data && data.list && data.list.length > 0) {
      const airData = data.list[0]

      const geoJsonResult = {
        type: "FeatureCollection",
        features: [
          {
            type: "Feature",
            geometry: {
              type: "Point",
              coordinates: [Number.parseFloat(lon), Number.parseFloat(lat)], // [longitude, latitude] order for GeoJSON
            },
            properties: {
              air_quality_index: airData.main.aqi,
              aqi_description: getAQIDescription(airData.main.aqi),
              components: {
                co: airData.components.co,
                no: airData.components.no,
                no2: airData.components.no2,
                o3: airData.components.o3,
                so2: airData.components.so2,
                pm2_5: airData.components.pm2_5,
                pm10: airData.components.pm10,
                nh3: airData.components.nh3,
              },
              timestamp: airData.dt,
              location: {
                lat: data.coord.lat,
                lon: data.coord.lon,
              },
            },
          },
        ],
      }

      return new Response(JSON.stringify(geoJsonResult), {
        status: 200,
        headers: { "Content-Type": "application/json" },
      })
    }

    return new Response(JSON.stringify({ error: "No air quality data found" }), {
      status: 404,
      headers: { "Content-Type": "application/json" },
    })
  } catch (error) {
    console.error("Air quality API failed:", error)
    return new Response(
      JSON.stringify({
        error: "Internal Server Error",
        details: error instanceof Error ? error.message : "Unknown error",
      }),
      {
        status: 500,
        headers: { "Content-Type": "application/json" },
      },
    )
  }
}

function getAQIDescription(aqi: number): string {
  switch (aqi) {
    case 1:
      return "Good"
    case 2:
      return "Fair"
    case 3:
      return "Moderate"
    case 4:
      return "Poor"
    case 5:
      return "Very Poor"
    default:
      return "Unknown"
  }
}
