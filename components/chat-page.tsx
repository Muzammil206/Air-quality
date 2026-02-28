"use client"

import type React from "react"
import { Bot, Send, Wind, RotateCcw, Leaf, AlertTriangle, Activity, ChevronRight } from "lucide-react"
import { useState, useEffect, useRef, useCallback } from "react"

// ─── Types ────────────────────────────────────────────────────────────────────
interface Message {
  id:      string
  role:    "user" | "assistant"
  content: string
}

// ─── Suggested prompts ────────────────────────────────────────────────────────
const SUGGESTIONS = [
  { icon: "Activity",      label: "Abuja air quality right now",        prompt: "What is the current air quality in Abuja?" },
  { icon: "Wind",          label: "Lagos vs Port Harcourt comparison",  prompt: "Compare air quality in Lagos vs Port Harcourt" },
  { icon: "AlertTriangle", label: "Harmattan health advice",            prompt: "What health precautions should I take during Harmattan season in Abuja?" },
  { icon: "Leaf",          label: "PM2.5 safe levels explained",        prompt: "What are safe PM2.5 levels and how do Abuja levels compare to WHO guidelines?" },
]

// ─── Markdown-lite renderer ───────────────────────────────────────────────────
function renderInline(text: string): React.ReactNode[] {
  const parts = text.split(/(\*\*[^*]+\*\*)/)
  return parts.map((part, i) =>
    part.startsWith("**") && part.endsWith("**")
      ? <strong key={i} className="font-semibold text-gray-900">{part.slice(2, -2)}</strong>
      : <span key={i}>{part}</span>
  )
}

function renderContent(text: string): React.ReactNode {
  const lines = text.split("\n")
  const nodes: React.ReactNode[] = []
  let k = 0

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i]
    if (line.match(/^#{1,3}\s/)) {
      nodes.push(
        <p key={k++} className="font-semibold text-[#00A7B3] text-sm mt-3 mb-0.5">
          {renderInline(line.replace(/^#{1,3}\s/, ""))}
        </p>
      )
    } else if (line.match(/^[-•*]\s/)) {
      nodes.push(
        <div key={k++} className="flex gap-2 my-0.5">
          <span className="text-[#00A7B3] mt-0.5 shrink-0 text-xs">•</span>
          <span className="text-sm leading-relaxed text-gray-700">{renderInline(line.replace(/^[-•*]\s/, ""))}</span>
        </div>
      )
    } else if (line.trim() === "") {
      if (i > 0 && lines[i-1].trim() !== "") nodes.push(<div key={k++} className="h-1.5" />)
    } else {
      nodes.push(
        <p key={k++} className="text-sm leading-relaxed text-gray-700">{renderInline(line)}</p>
      )
    }
  }
  return <>{nodes}</>
}

// ─── Message bubble ───────────────────────────────────────────────────────────
function MessageBubble({ message }: { message: Message }) {
  if (message.role === "user") {
    return (
      <div className="flex justify-end">
        <div
          className="max-w-[80%] px-4 py-2.5 rounded-2xl rounded-tr-sm text-sm text-white leading-relaxed"
          style={{ background: "linear-gradient(135deg,#00A7B3,#00879e)" }}
        >
          {message.content}
        </div>
      </div>
    )
  }

  return (
    <div className="flex gap-3">
      <div
        className="w-8 h-8 rounded-xl flex items-center justify-center shrink-0 mt-0.5 shadow-sm"
        style={{ background: "linear-gradient(135deg,#00A7B3,#00879e)" }}
      >
        <Bot className="w-4 h-4 text-white" />
      </div>
      <div className="flex-1 min-w-0 bg-white rounded-2xl rounded-tl-sm border border-gray-100 px-4 py-3 shadow-sm">
        {renderContent(message.content)}
      </div>
    </div>
  )
}

// ─── Typing indicator ─────────────────────────────────────────────────────────
function TypingIndicator() {
  return (
    <div className="flex gap-3">
      <div
        className="w-8 h-8 rounded-xl flex items-center justify-center shrink-0 shadow-sm"
        style={{ background: "linear-gradient(135deg,#00A7B3,#00879e)" }}
      >
        <Bot className="w-4 h-4 text-white" />
      </div>
      <div className="bg-white rounded-2xl rounded-tl-sm border border-gray-100 px-4 py-3 shadow-sm">
        <div className="flex gap-1.5 items-center h-5">
          {[0,1,2].map((i) => (
            <div
              key={i}
              className="w-2 h-2 rounded-full bg-[#00A7B3] animate-bounce"
              style={{ animationDelay: `${i * 0.18}s` }}
            />
          ))}
        </div>
      </div>
    </div>
  )
}

// ─── Icon map ─────────────────────────────────────────────────────────────────
const ICON_MAP: Record<string, React.FC<{ className?: string }>> = {
  Activity, Wind, AlertTriangle, Leaf,
}

// ─── Empty state ──────────────────────────────────────────────────────────────
function EmptyState({ onSuggest }: { onSuggest: (p: string) => void }) {
  return (
    <div className="flex flex-col items-center justify-center flex-1 px-4 py-8 gap-6">
      <div className="relative">
        <div
          className="w-16 h-16 rounded-2xl flex items-center justify-center shadow-lg"
          style={{ background: "linear-gradient(135deg,#00A7B3,#00879e)" }}
        >
          <Wind className="w-8 h-8 text-white" />
        </div>
        <div className="absolute -bottom-1 -right-1 w-5 h-5 rounded-full bg-green-500 flex items-center justify-center shadow">
          <span className="text-[9px] font-black text-white">AI</span>
        </div>
      </div>

      <div className="text-center max-w-xs">
        <h2 className="text-xl font-bold text-gray-900 mb-1">AirSense AI</h2>
        <p className="text-sm text-gray-500 leading-relaxed">
          Ask me anything about real-time air quality across Nigeria — Abuja, Lagos, Port Harcourt and more.
        </p>
      </div>

      <div className="w-full max-w-sm space-y-2">
        {SUGGESTIONS.map(({ icon, label, prompt }) => {
          const Icon = ICON_MAP[icon] ?? Activity
          return (
            <button
              key={label}
              onClick={() => onSuggest(prompt)}
              className="w-full flex items-center gap-3 px-4 py-3 rounded-xl border border-gray-200 bg-white hover:border-[#00A7B3] hover:bg-[#00A7B3]/5 transition-all text-left group"
            >
              <div className="w-7 h-7 rounded-lg flex items-center justify-center shrink-0" style={{ backgroundColor: "rgba(0,167,179,0.1)" }}>
                <Icon className="w-3.5 h-3.5 text-[#00A7B3]" />
              </div>
              <span className="text-sm text-gray-700 flex-1">{label}</span>
              <ChevronRight className="w-4 h-4 text-gray-300 group-hover:text-[#00A7B3] transition-colors" />
            </button>
          )
        })}
      </div>
    </div>
  )
}

// ─── Main ChatPage component ──────────────────────────────────────────────────
export function ChatPage() {
  const [messages,  setMessages]  = useState<Message[]>([])
  const [input,     setInput]     = useState("")
  const [streaming, setStreaming] = useState(false)
  const [error,     setError]     = useState<string | null>(null)

  const bottomRef = useRef<HTMLDivElement>(null)
  const inputRef  = useRef<HTMLInputElement>(null)
  const abortRef  = useRef<AbortController | null>(null)

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" })
  }, [messages, streaming])

  const sendMessage = useCallback(async (text: string) => {
    if (!text.trim() || streaming) return
    setError(null)

    const userMsg: Message    = { id: crypto.randomUUID(), role: "user",      content: text }
    const assistantId         = crypto.randomUUID()
    const assistantMsg: Message = { id: assistantId,      role: "assistant",  content: "" }

    setMessages((prev) => [...prev, userMsg, assistantMsg])
    setInput("")
    setStreaming(true)

    // Send full conversation history to the API
    const history = [...messages, userMsg].map((m) => ({ role: m.role, content: m.content }))

    try {
      abortRef.current = new AbortController()

      const res = await fetch("/api/chat", {
        method:  "POST",
        headers: { "Content-Type": "application/json" },
        body:    JSON.stringify({ messages: history }),
        signal:  abortRef.current.signal,
      })

      if (!res.ok) throw new Error(`Server error ${res.status}`)
      if (!res.body) throw new Error("No response stream")

      const reader  = res.body.getReader()
      const decoder = new TextDecoder()
      let   buf     = ""

      while (true) {
        const { done, value } = await reader.read()
        if (done) break

        buf += decoder.decode(value, { stream: true })
        const lines = buf.split("\n")
        buf = lines.pop() ?? ""

        for (const line of lines) {
          if (!line.startsWith("data: ")) continue
          const payload = line.slice(6).trim()
          if (payload === "[DONE]") break
          try {
            const { text: chunk } = JSON.parse(payload)
            setMessages((prev) =>
              prev.map((m) => m.id === assistantId ? { ...m, content: m.content + chunk } : m)
            )
          } catch { /* skip malformed SSE chunk */ }
        }
      }
    } catch (err: any) {
      if (err.name === "AbortError") return
      setError("Something went wrong. Please try again.")
      setMessages((prev) => prev.filter((m) => m.id !== assistantId))
    } finally {
      setStreaming(false)
      abortRef.current = null
      setTimeout(() => inputRef.current?.focus(), 50)
    }
  }, [messages, streaming])

  const handleClear = () => {
    abortRef.current?.abort()
    setMessages([])
    setStreaming(false)
    setError(null)
    setTimeout(() => inputRef.current?.focus(), 50)
  }

  const isEmpty = messages.length === 0
  const isTyping = streaming && messages.at(-1)?.content === ""

  return (
    <div className="flex flex-col h-[100dvh] bg-gray-50 pb-20 md:pb-0">

      {/* ── Header ── */}
      <header className="flex-shrink-0 bg-white border-b border-gray-100 shadow-sm z-10">
        <div className="max-w-2xl mx-auto flex items-center justify-between h-14 px-4">
          <div className="flex items-center gap-2.5">
            <div
              className="w-7 h-7 rounded-lg flex items-center justify-center"
              style={{ background: "linear-gradient(135deg,#00A7B3,#00879e)" }}
            >
              <Wind className="w-3.5 h-3.5 text-white" />
            </div>
            <div className="leading-none">
              <span className="font-bold text-gray-900 text-sm block">AirSense AI</span>
              <span className="text-[10px] text-[#00A7B3] font-medium">Air Quality Assistant</span>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-green-50 border border-green-200">
              <div className="w-1.5 h-1.5 rounded-full bg-green-500 animate-pulse" />
              <span className="text-[10px] font-semibold text-green-700">LIVE DATA</span>
            </div>
            {!isEmpty && (
              <button
                onClick={handleClear}
                title="Clear conversation"
                className="p-1.5 rounded-lg text-gray-400 hover:text-gray-600 hover:bg-gray-100 transition-colors"
              >
                <RotateCcw className="w-4 h-4" />
              </button>
            )}
          </div>
        </div>
      </header>

      {/* ── Messages ── */}
      <div className="flex-1 overflow-y-auto">
        <div className="max-w-2xl mx-auto px-4 py-4 flex flex-col min-h-full">
          {isEmpty ? (
            <EmptyState onSuggest={sendMessage} />
          ) : (
            <div className="space-y-4 pb-2">
              {messages.map((msg) =>
                msg.content || msg.role === "user"
                  ? <MessageBubble key={msg.id} message={msg} />
                  : null
              )}
              {isTyping && <TypingIndicator />}
              {error && (
                <div className="flex justify-center">
                  <div className="flex items-center gap-2 px-3 py-2 rounded-xl bg-red-50 border border-red-200 text-sm text-red-600">
                    <AlertTriangle className="w-4 h-4 shrink-0" />
                    {error}
                  </div>
                </div>
              )}
              <div ref={bottomRef} />
            </div>
          )}
        </div>
      </div>

      {/* ── Input ── */}
      <div className="flex-shrink-0 bg-white border-t border-gray-100 shadow-[0_-4px_20px_rgba(0,0,0,0.04)]">
        <div className="max-w-2xl mx-auto px-4 py-3">
          <div className="flex items-center gap-2">
            <div className="flex-1 flex items-center bg-gray-50 border border-gray-200 rounded-2xl px-4 py-2.5 gap-2 focus-within:border-[#00A7B3] focus-within:ring-1 focus-within:ring-[#00A7B3]/20 transition-all">
              <input
                ref={inputRef}
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter" && !e.shiftKey) {
                    e.preventDefault()
                    sendMessage(input)
                  }
                }}
                placeholder="Ask about air quality in any Nigerian city…"
                disabled={streaming}
                className="flex-1 bg-transparent border-none outline-none text-sm text-gray-800 placeholder-gray-400 disabled:opacity-50"
                style={{ fontSize: "16px" }}
                autoComplete="off"
              />
            </div>

            <button
              onClick={() => sendMessage(input)}
              disabled={!input.trim() || streaming}
              className="w-10 h-10 rounded-2xl flex items-center justify-center shrink-0 transition-all disabled:opacity-40 disabled:cursor-not-allowed active:scale-95"
              style={{ background: "linear-gradient(135deg,#00A7B3,#00879e)" }}
            >
              <Send className="w-4 h-4 text-white" />
            </button>
          </div>

          <p className="text-center text-[10px] text-gray-400 mt-2">
            Powered by data collected from the field & satellite data 
          </p>
        </div>
      </div>
    </div>
  )
}