import { StreamingTextResponse, Message } from 'ai'
import { GoogleGenerativeAI } from '@google/generative-ai'

const genAI = new GoogleGenerativeAI(process.env.GOOGLE_GENERATIVE_AI_API_KEY || '')
const model = genAI.getGenerativeModel({ model: 'gemini-pro' })

export async function POST(req: Request) {
  console.log("[v0] Chat API route called")

  try {
    const { messages } = await req.json()
    console.log("[v0] Received messages:", messages.length)

    // Convert messages to Gemini format
    const prompt = messages.map((m: Message) => ({
      role: m.role === 'user' ? 'user' : 'model',
      parts: [{ text: m.content }]
    }))

    const chat = model.startChat({
      history: prompt.slice(0, -1),
      generationConfig: {
        maxOutputTokens: 1000,
      },
    })

    const result = await chat.sendMessageStream(prompt[prompt.length - 1].parts[0].text)
    
    // Convert the response to a ReadableStream
    const stream = new ReadableStream({
      async start(controller) {
        const encoder = new TextEncoder()
        for await (const chunk of result.stream) {
          const text = chunk.text()
          controller.enqueue(encoder.encode(text))
        }
        controller.close()
      },
    })

    return new StreamingTextResponse(stream)
  } catch (error: any) {
    console.error("[v0] Error in chat route:", error)
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' }
    })
  }
      model: "google/gemini-1.5-flash",
      prompt,
      abortSignal: req.signal,
      system: `You are an AI assistant for an environmental mapping platform that helps users understand air quality data. 
    
You have access to air quality data from various monitoring stations across different locations. The data includes measurements for:
- PM2.5 (Particulate Matter 2.5 micrometers)
- PM10 (Particulate Matter 10 micrometers)
- CO2 (Carbon Dioxide in ppm)
- CO (Carbon Monoxide in ppm)
- HCHO (Formaldehyde in mg/m³)
- CH4 (Methane)
- Temperature and Humidity

When users ask about air quality:
1. Provide clear, concise explanations about the data
2. Explain what the measurements mean for health and environment
3. Compare values to standard air quality guidelines when relevant
4. Suggest visualizations or reports when appropriate

Be helpful, informative, and focus on making air quality data accessible and understandable.`,
      tools: {
        getAirQualityData: tool({
          description: "Get air quality data for a specific location and pollutant",
          inputSchema: z.object({
            location: z.string().describe("The location to get data for"),
            pollutant: z.string().describe("The pollutant type (PM2.5, PM10, CO2, CO, HCHO, CH4)"),
            timeRange: z.string().optional().describe('Time range for the data (e.g., "last 30 days")'),
          }),
          execute: async ({ location, pollutant, timeRange }) => {
            console.log("[v0] Tool called with:", { location, pollutant, timeRange })
            const mockData = {
              location,
              pollutant,
              timeRange: timeRange || "last 30 days",
              averageValue: Math.random() * 100,
              trend: Math.random() > 0.5 ? "increasing" : "decreasing",
              status: Math.random() > 0.5 ? "good" : "moderate",
            }
            return mockData
          },
        }),
      },
    })

    console.log("[v0] Returning stream response")
    return result.toUIMessageStreamResponse({
      onFinish: async ({ isAborted }) => {
        if (isAborted) {
          console.log("[v0] Chat request aborted")
        } else {
          console.log("[v0] Chat request completed successfully")
        }
      },
      consumeSseStream: consumeStream,
    })
  } catch (error) {
    console.error("[v0] Error in chat API:", error)
    return new Response(JSON.stringify({ error: "Failed to process chat request" }), {
      status: 500,
      headers: { "Content-Type": "application/json" },
    })
  }
}
