"use client"

import type React from "react"

import { useChat } from "@ai-sdk/react"
import { DefaultChatTransport } from "ai"
import { Bot, Send, Paperclip, Download } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card } from "@/components/ui/card"
import Link from "next/link"
import { useState, useEffect } from "react"
import { Line, LineChart, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts"

function AirQualityChart({ data, title, pollutant }: { data: any; title: string; pollutant: string }) {
  // Generate mock chart data
  const chartData = Array.from({ length: 30 }, (_, i) => ({
    day: i + 1,
    value: Math.random() * 100 + 20,
  }))

  const handleDownload = () => {
    const csv = [["Day", pollutant], ...chartData.map((d) => [d.day, d.value])].map((row) => row.join(",")).join("\n")

    const blob = new Blob([csv], { type: "text/csv" })
    const url = URL.createObjectURL(blob)
    const a = document.createElement("a")
    a.href = url
    a.download = `${pollutant.toLowerCase()}_data.csv`
    a.click()
    URL.revokeObjectURL(url)
  }

  return (
    <Card className="p-4 mt-2">
      <div className="space-y-2">
        <h3 className="font-semibold">{title}</h3>
        <p className="text-sm text-muted-foreground">Last 30 Days</p>

        <div className="h-[200px] w-full">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={chartData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="day" />
              <YAxis />
              <Tooltip />
              <Line type="monotone" dataKey="value" stroke="hsl(var(--primary))" strokeWidth={2} />
            </LineChart>
          </ResponsiveContainer>
        </div>

        <Button
          variant="outline"
          size="sm"
          onClick={handleDownload}
          className="w-full bg-cyan-500 hover:bg-cyan-600 text-white border-cyan-500 hover:border-cyan-600"
        >
          <Download className="w-4 h-4 mr-2" />
          Download CSV
        </Button>
      </div>
    </Card>
  )
}

export function ChatPage() {
  const [inputValue, setInputValue] = useState("")

  const { messages, sendMessage, status, error } = useChat({
    transport: new DefaultChatTransport({ api: "/api/chat" }),
  })

  useEffect(() => {
    console.log("[v0] Chat status:", status)
    if (error) {
      console.error("[v0] Chat error:", error)
    }
  }, [status, error])

  useEffect(() => {
    console.log("[v0] Messages updated:", messages.length)
  }, [messages])

  const suggestedPrompts = [
    "Show me methane levels in Abuja",
    "Compare Lagos vs Port Harcourt air quality",
    "Download July 2024 report",
  ]

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    console.log("[v0] Submit clicked, input:", inputValue)
    if (inputValue.trim() && status !== "in_progress") {
      console.log("[v0] Sending message:", inputValue)
      sendMessage({ text: inputValue })
      setInputValue("")
    }
  }

  const handleSuggestedPrompt = (prompt: string) => {
    console.log("[v0] Suggested prompt clicked:", prompt)
    if (status !== "in_progress") {
      sendMessage({ text: prompt })
    }
  }

  const shouldShowVisualization = (text: string) => {
    const keywords = ["levels", "show me", "data", "methane", "pm2.5", "pm10", "co2", "quality"]
    return keywords.some((keyword) => text.toLowerCase().includes(keyword))
  }

  return (
    <div className="flex flex-col h-screen bg-background">
      {/* Header */}
      <header className="border-b bg-card">
        <div className="container flex items-center justify-between h-16 px-4 mx-auto">
          <div className="flex items-center gap-4">
            <Link href="/" className="text-xl font-bold">
              Environmental Mapping Platform
            </Link>
            <nav className="flex gap-2">
              <Link href="/">
                <Button variant="ghost">Map</Button>
              </Link>
              <Link href="/calendar">
                <Button variant="ghost">Calendar</Button>
              </Link>
              <Link href="/chat">
                <Button className="bg-cyan-500 hover:bg-cyan-600 text-white border-cyan-500 hover:border-cyan-600">
                  AI Assistant
                </Button>
              </Link>
            </nav>
          </div>
        </div>
      </header>

      {/* Chat Container */}
      <div className="flex flex-col flex-1 overflow-hidden">
        <div className="container flex-1 px-4 py-6 mx-auto overflow-y-auto max-w-4xl">
          {error && (
            <div className="mb-4 p-4 bg-red-100 border border-red-400 text-red-700 rounded">
              <p className="font-semibold">Error:</p>
              <p>{error.message}</p>
            </div>
          )}

          {messages.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-full gap-4">
              <Bot className="w-16 h-16 text-cyan-500" />
              <h2 className="text-2xl font-bold text-cyan-500">
                Hello! How can I assist you with air quality data today?
              </h2>
              <p className="text-muted-foreground">
                Ask me about air quality levels, compare locations, or download reports.
              </p>
            </div>
          ) : (
            <div className="flex flex-col gap-6">
              {messages.map((message, msgIndex) => (
                <div
                  key={message.id}
                  className={`flex gap-3 ${message.role === "user" ? "justify-end" : "justify-start"}`}
                >
                  {message.role === "assistant" && (
                    <div className="flex items-start">
                      <div className="flex items-center justify-center w-8 h-8 rounded-full bg-cyan-500">
                        <Bot className="w-5 h-5 text-white" />
                      </div>
                    </div>
                  )}

                  <div className={`max-w-[80%] ${message.role === "user" ? "" : "w-full"}`}>
                    <div
                      className={`rounded-2xl px-4 py-3 ${
                        message.role === "user" ? "bg-cyan-500 text-white" : "bg-muted"
                      }`}
                    >
                      {message.parts.map((part, index) => {
                        if (part.type === "text") {
                          return (
                            <div key={index} className="whitespace-pre-wrap">
                              {part.text}
                            </div>
                          )
                        }
                        return null
                      })}
                    </div>

                    {message.role === "assistant" &&
                      message.parts.some((p) => p.type === "text" && shouldShowVisualization(p.text)) && (
                        <AirQualityChart data={{}} title="Methane Levels (Abuja)" pollutant="CH4" />
                      )}
                  </div>
                </div>
              ))}

              {status === "in_progress" && (
                <div className="flex gap-3 justify-start">
                  <div className="flex items-start">
                    <div className="flex items-center justify-center w-8 h-8 rounded-full bg-cyan-500">
                      <Bot className="w-5 h-5 text-white" />
                    </div>
                  </div>
                  <div className="max-w-[80%] rounded-2xl px-4 py-3 bg-muted">
                    <div className="flex gap-1">
                      <div className="w-2 h-2 bg-foreground/40 rounded-full animate-bounce" />
                      <div className="w-2 h-2 bg-foreground/40 rounded-full animate-bounce [animation-delay:0.2s]" />
                      <div className="w-2 h-2 bg-foreground/40 rounded-full animate-bounce [animation-delay:0.4s]" />
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Suggested Prompts */}
        {messages.length === 0 && (
          <div className="container px-4 pb-4 mx-auto max-w-4xl">
            <div className="flex flex-wrap gap-2">
              {suggestedPrompts.map((prompt, index) => (
                <Button
                  key={index}
                  variant="outline"
                  onClick={() => handleSuggestedPrompt(prompt)}
                  disabled={status === "in_progress"}
                  className="bg-cyan-500 hover:bg-cyan-600 text-white border-cyan-500 hover:border-cyan-600"
                >
                  {prompt}
                </Button>
              ))}
            </div>
          </div>
        )}

        {/* Input Area */}
        <div className="border-t bg-card">
          <div className="container px-4 py-4 mx-auto max-w-4xl">
            <form onSubmit={handleSubmit} className="flex gap-2">
              <Button type="button" variant="ghost" size="icon" disabled={status === "in_progress"}>
                <Paperclip className="w-5 h-5" />
              </Button>
              <Input
                value={inputValue}
                onChange={(e) => setInputValue(e.target.value)}
                placeholder="Type your message..."
                disabled={status === "in_progress"}
                className="flex-1"
              />
              <Button
                type="submit"
                size="icon"
                disabled={status === "in_progress" || !inputValue.trim()}
                className="bg-cyan-500 hover:bg-cyan-600 text-white border-cyan-500 hover:border-cyan-600"
              >
                <Send className="w-5 h-5" />
              </Button>
            </form>
          </div>
        </div>
      </div>
    </div>
  )
}
