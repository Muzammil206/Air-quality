"use client"

import type React from "react"
import { useChat } from "@ai-sdk/react"
import { DefaultChatTransport } from "ai"
import { Bot, Send, Paperclip, Download, ArrowLeft } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card } from "@/components/ui/card"
import Link from "next/link"
import { useState, useEffect, useRef } from "react"
import { Line, LineChart, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts"

function AirQualityChart({ data, title, pollutant }: { data: any; title: string; pollutant: string }) {
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
    <Card className="p-3 sm:p-4 mt-2">
      <div className="space-y-2">
        <h3 className="font-semibold text-sm sm:text-base">{title}</h3>
        <p className="text-xs sm:text-sm text-muted-foreground">Last 30 Days</p>

        <div className="h-[160px] sm:h-[200px] w-full">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={chartData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis
                dataKey="day"
                tick={{ fontSize: 10 }}
                interval="preserveStartEnd"
              />
              <YAxis tick={{ fontSize: 10 }} width={32} />
              <Tooltip contentStyle={{ fontSize: 12 }} />
              <Line type="monotone" dataKey="value" stroke="hsl(var(--primary))" strokeWidth={2} dot={false} />
            </LineChart>
          </ResponsiveContainer>
        </div>

        <Button
          variant="outline"
          size="sm"
          onClick={handleDownload}
          className="w-full bg-cyan-500 hover:bg-cyan-600 text-white border-cyan-500 hover:border-cyan-600 text-xs sm:text-sm"
        >
          <Download className="w-3.5 h-3.5 sm:w-4 sm:h-4 mr-2" />
          Download CSV
        </Button>
      </div>
    </Card>
  )
}

export function ChatPage() {
  const [inputValue, setInputValue] = useState("")
  const messagesEndRef = useRef<HTMLDivElement>(null)

  const { messages, sendMessage, status, error } = useChat({
    transport: new DefaultChatTransport({ api: "/api/chat" }),
  })

  const isInProgress = String(status) === "in_progress"

  // Auto-scroll to bottom on new messages
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" })
  }, [messages, isInProgress])

  useEffect(() => {
    if (error) console.error("[v0] Chat error:", error)
  }, [status, error])

  const suggestedPrompts = [
    "Show me methane levels in Abuja",
    "Compare Lagos vs Port Harcourt air quality",
    "Download July 2024 report",
  ]

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (inputValue.trim() && !isInProgress) {
      sendMessage({ text: inputValue })
      setInputValue("")
    }
  }

  const handleSuggestedPrompt = (prompt: string) => {
    if (!isInProgress) sendMessage({ text: prompt })
  }

  const shouldShowVisualization = (text: string) => {
    const keywords = ["levels", "show me", "data", "methane", "pm2.5", "pm10", "co2", "quality"]
    return keywords.some((keyword) => text.toLowerCase().includes(keyword))
  }

  return (
    // h-[100dvh] accounts for mobile browser chrome (address bar)
    // pb-20 md:pb-0 reserves space for the mobile bottom nav
    <div className="flex flex-col h-[100dvh] bg-background pb-20 md:pb-0">

      {/* ── Header ── */}
      <header className="border-b bg-card flex-shrink-0">
        <div className="flex items-center justify-between h-14 sm:h-16 px-3 sm:px-6 max-w-4xl mx-auto w-full">
          {/* Back arrow on mobile, full title on sm+ */}
          <div className="flex items-center gap-2 sm:gap-4 min-w-0">
            <Link href="/" className="md:hidden shrink-0">
              <Button variant="ghost" size="icon" className="h-8 w-8">
                <ArrowLeft className="w-4 h-4" />
              </Button>
            </Link>
            <Link href="/" className="hidden sm:block text-base sm:text-xl font-bold truncate">
              Environmental Mapping Platform
            </Link>
            <span className="sm:hidden text-sm font-semibold text-cyan-500">Air Sense AI</span>
          </div>

          {/* Nav links — hidden on mobile (covered by bottom nav) */}
          <nav className="hidden md:flex gap-2 shrink-0">
            <Link href="/">
              <Button variant="ghost" size="sm">Map</Button>
            </Link>
            <Link href="/calendar">
              <Button variant="ghost" size="sm">Calendar</Button>
            </Link>
            <Link href="/chat">
              <Button size="sm" className="bg-cyan-500 hover:bg-cyan-600 text-white border-cyan-500">
                AI Assistant
              </Button>
            </Link>
          </nav>
        </div>
      </header>

      {/* ── Chat messages ── */}
      <div className="flex-1 overflow-y-auto">
        <div className="px-3 sm:px-4 py-4 sm:py-6 max-w-4xl mx-auto w-full">

          {error && (
            <div className="mb-4 p-3 sm:p-4 bg-red-100 border border-red-400 text-red-700 rounded text-sm">
              <p className="font-semibold">Error:</p>
              <p>{error.message}</p>
            </div>
          )}

          {messages.length === 0 ? (
            // Empty state — centered, scales on mobile
            <div className="flex flex-col items-center justify-center min-h-[40vh] gap-3 sm:gap-4 text-center px-4">
              <Bot className="w-12 h-12 sm:w-16 sm:h-16 text-cyan-500" />
              <h2 className="text-lg sm:text-2xl font-bold text-cyan-500 leading-snug">
                Hello! How can I assist you with air quality data today?
              </h2>
              <p className="text-xs sm:text-sm text-muted-foreground max-w-sm">
                Ask me about air quality levels, compare locations, or download reports.
              </p>
            </div>
          ) : (
            <div className="flex flex-col gap-4 sm:gap-6">
              {messages.map((message) => (
                <div
                  key={message.id}
                  className={`flex gap-2 sm:gap-3 ${message.role === "user" ? "justify-end" : "justify-start"}`}
                >
                  {message.role === "assistant" && (
                    <div className="shrink-0 flex items-start pt-1">
                      <div className="flex items-center justify-center w-7 h-7 sm:w-8 sm:h-8 rounded-full bg-cyan-500">
                        <Bot className="w-4 h-4 sm:w-5 sm:h-5 text-white" />
                      </div>
                    </div>
                  )}

                  {/* Message bubble — max 85% on mobile, 80% on desktop */}
                  <div className={`max-w-[85%] sm:max-w-[80%] ${message.role === "user" ? "" : "w-full"}`}>
                    <div
                      className={`rounded-2xl px-3 sm:px-4 py-2 sm:py-3 text-sm sm:text-base ${
                        message.role === "user"
                          ? "bg-cyan-500 text-white"
                          : "bg-muted"
                      }`}
                    >
                      {message.parts.map((part, index) => {
                        if (part.type === "text") {
                          return (
                            <div key={index} className="whitespace-pre-wrap leading-relaxed">
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

              {/* Typing indicator */}
              {isInProgress && (
                <div className="flex gap-2 sm:gap-3 justify-start">
                  <div className="shrink-0 flex items-start pt-1">
                    <div className="flex items-center justify-center w-7 h-7 sm:w-8 sm:h-8 rounded-full bg-cyan-500">
                      <Bot className="w-4 h-4 sm:w-5 sm:h-5 text-white" />
                    </div>
                  </div>
                  <div className="rounded-2xl px-4 py-3 bg-muted">
                    <div className="flex gap-1 items-center h-4">
                      <div className="w-2 h-2 bg-foreground/40 rounded-full animate-bounce" />
                      <div className="w-2 h-2 bg-foreground/40 rounded-full animate-bounce [animation-delay:0.2s]" />
                      <div className="w-2 h-2 bg-foreground/40 rounded-full animate-bounce [animation-delay:0.4s]" />
                    </div>
                  </div>
                </div>
              )}

              {/* Scroll anchor */}
              <div ref={messagesEndRef} />
            </div>
          )}
        </div>
      </div>

      {/* ── Suggested prompts (empty state only) ── */}
      {messages.length === 0 && (
        <div className="flex-shrink-0 px-3 sm:px-4 pb-3 max-w-4xl mx-auto w-full">
          <div className="flex flex-wrap gap-2">
            {suggestedPrompts.map((prompt, index) => (
              <Button
                key={index}
                variant="outline"
                size="sm"
                onClick={() => handleSuggestedPrompt(prompt)}
                disabled={isInProgress}
                className="bg-cyan-500 hover:bg-cyan-600 text-white border-cyan-500 hover:border-cyan-600 text-xs sm:text-sm h-8 sm:h-9"
              >
                {prompt}
              </Button>
            ))}
          </div>
        </div>
      )}

      {/* ── Input bar ── */}
      <div className="flex-shrink-0 border-t bg-card">
        <div className="px-3 sm:px-4 py-3 sm:py-4 max-w-4xl mx-auto w-full">
          <form onSubmit={handleSubmit} className="flex items-center gap-1.5 sm:gap-2">
            <Button
              type="button"
              variant="ghost"
              size="icon"
              disabled={isInProgress}
              className="shrink-0 h-9 w-9 sm:h-10 sm:w-10"
            >
              <Paperclip className="w-4 h-4 sm:w-5 sm:h-5" />
            </Button>

            <Input
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
              placeholder="Type your message..."
              disabled={isInProgress}
              className="flex-1 h-9 sm:h-10 text-sm"
              // On mobile, prevent zoom-in on focus (font-size ≥ 16px)
              style={{ fontSize: "16px" }}
            />

            <Button
              type="submit"
              size="icon"
              disabled={isInProgress || !inputValue.trim()}
              className="shrink-0 h-9 w-9 sm:h-10 sm:w-10 bg-cyan-500 hover:bg-cyan-600 text-white border-cyan-500 hover:border-cyan-600"
            >
              <Send className="w-4 h-4 sm:w-5 sm:h-5" />
            </Button>
          </form>
        </div>
      </div>
    </div>
  )
}