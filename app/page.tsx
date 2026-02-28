"use client"

import { useState, useEffect, useRef } from "react"
import Link from "next/link"
import Image from "next/image"

/* ─── Types ─────────────────────────────────────────── */
type AQILevel = "good" | "moderate" | "unhealthy"

interface CityData {
  name: string
  state: string
  aqi: number
  level: AQILevel
  updatedAt: string
  barPct: number
}

interface MetricItem {
  value: string
  label: string
}

interface AboutCard {
  num: string
  title: string
  desc: string
  icon: React.ReactNode
}

interface Partner {
  name: string
  desc: string
  logo: string
}

/* ─── Data ───────────────────────────────────────────── */
const CITIES: CityData[] = [
  { name: "Abuja", state: "FCT", aqi: 42, level: "good", updatedAt: "2 min ago", barPct: 35 },
  { name: "Lagos", state: "LA", aqi: 65, level: "moderate", updatedAt: "1 min ago", barPct: 54 },
  { name: "Port Harcourt", state: "RI", aqi: 58, level: "moderate", updatedAt: "3 min ago", barPct: 48 },
  { name: "Kano", state: "KN", aqi: 72, level: "moderate", updatedAt: "5 min ago", barPct: 60 },
]

const METRICS: MetricItem[] = [
  { value: "4", label: "Cities Online" },
  { value: "24/7", label: "Live Monitoring" },
  { value: "99.8%", label: "Uptime SLA" },
  { value: "<2min", label: "Data Latency" },
]

const PARTNERS: Partner[] = [
  {
    name: "NASRDA",
    desc: "National Space Research and Development Agency — leading Nigeria's space technology initiatives.",
    logo: "https://lh3.googleusercontent.com/aida-public/AB6AXuAo3pJPtUSA0kcoi36e6WIHwQldBK_jtVC4ksX1CgS-uzsSJijJmV2jF80Na45vp5nFiH9WhboD0PXRyKDhkMlzF5RY4WDBgYWjZab5Tx7agdmgtEy8pqkXOA9r-SYDrd4Hi6_QVSuNLSPKSlt_t8M6zq0aHYsxRAjuwnWH4o8hW0fFpbQm9P662Fzv_CRyzaf2JyDQap1QCmwRh-zkLsGPO3QCw4LBfngZ_1_G95AWGFJzkDjH70r0Yz2piwPEltcu8mg0gwMediA",
  },
  {
    name: "SSA Department",
    desc: "Space Science Applications — advancing satellite-based environmental monitoring systems.",
    logo: "https://lh3.googleusercontent.com/aida-public/AB6AXuB7BkgxdrFG0Ay6TZxALNkIfsQKkwCgROxNkMWdSiTcVsvXLejwZzFFrADiVjwY1wCRBMM8NZfqDNefjIZhUVPk58AQjnBX0Q_n1bVZIsV3qDPHeO9l7aaCiCeiwC_nVfbulEzvjl_8-CjzaVjgziXOcyfx-YKO84nHFxg6lGMsC-nb4qcX4E9fKWlxnNxmZ3v3DMwcFKaXNDE3qoLyN9p6cM_NGY8lGNG78y_tMmFvgq9b1RLeW1Ay7qERWm0kbU8NBjHxfBrmcOQ",
  },
  {
    name: "ECC Division",
    desc: "Environmental & Climate Change Division — specialized in atmospheric monitoring and analysis.",
    logo: "https://lh3.googleusercontent.com/aida-public/AB6AXuAbf-P2vmFvxaC4BIl0yj7XDl4DRxvr6SzbUqVWMKuIYE7CqVbsbu7HP62S2nMzxgvZQAFpVyC_m-a5pCl9cdnmKlCyTjZYsENOxbhfzCaSZByp3s-B-Ihp8j-YAdjYqWXii22jSKDRDeKoiJ4kZD27YCy07E-ClQwnrF_XUy-e1VW_fefeerqLBqr_4NpbW676_c9sSrBMrNd9r_yv3CMc5l9ZY7wTwrLqY3IbTcKwamn4YIBV71J6_pIExCx4GnRGDJC4vSxblj8",
  },
]

/* ─── AQI colour maps ────────────────────────────────── */
const aqiColors: Record<AQILevel, { bar: string; value: string; tag: string; border: string; dot: string }> = {
  good: {
    bar: "bg-emerald-400",
    value: "text-emerald-400",
    tag: "text-emerald-400 bg-emerald-400/10",
    border: "border-l-emerald-400",
    dot: "bg-emerald-400",
  },
  moderate: {
    bar: "bg-amber-400",
    value: "text-amber-400",
    tag: "text-amber-400 bg-amber-400/10",
    border: "border-l-amber-400",
    dot: "bg-amber-400",
  },
  unhealthy: {
    bar: "bg-red-500",
    value: "text-red-500",
    tag: "text-red-500 bg-red-500/10",
    border: "border-l-red-500",
    dot: "bg-red-500",
  },
}

const aqiLabel: Record<AQILevel, string> = {
  good: "Good",
  moderate: "Moderate",
  unhealthy: "Unhealthy",
}

/* ─── Icons ──────────────────────────────────────────── */
function IconUsers() {
  return (
    <svg viewBox="0 0 24 24" className="w-5 h-5 stroke-[#38e8c8]" fill="none" strokeWidth={1.5} strokeLinecap="round" strokeLinejoin="round">
      <path d="M17 21v-2a4 4 0 00-4-4H5a4 4 0 00-4 4v2M9 11a4 4 0 100-8 4 4 0 000 8zM23 21v-2a4 4 0 00-3-3.87M16 3.13a4 4 0 010 7.75" />
    </svg>
  )
}
function IconPin() {
  return (
    <svg viewBox="0 0 24 24" className="w-5 h-5 stroke-[#38e8c8]" fill="none" strokeWidth={1.5} strokeLinecap="round" strokeLinejoin="round">
      <path d="M21 10c0 7-9 13-9 13S3 17 3 10a9 9 0 0118 0z" /><circle cx="12" cy="10" r="3" />
    </svg>
  )
}
function IconActivity() {
  return (
    <svg viewBox="0 0 24 24" className="w-5 h-5 stroke-[#38e8c8]" fill="none" strokeWidth={1.5} strokeLinecap="round" strokeLinejoin="round">
      <polyline points="22 12 18 12 15 21 9 3 6 12 2 12" />
    </svg>
  )
}
function IconHeart() {
  return (
    <svg viewBox="0 0 24 24" className="w-5 h-5 stroke-[#38e8c8]" fill="none" strokeWidth={1.5} strokeLinecap="round" strokeLinejoin="round">
      <path d="M22 12h-4l-3 9L9 3l-3 9H2" />
    </svg>
  )
}

const ABOUT_CARDS: AboutCard[] = [
  { num: "01 /", title: "Who We Are", desc: "Scientists, analysts, and environmental experts committed to improving Nigeria's air quality monitoring ecosystem.", icon: <IconUsers /> },
  { num: "02 /", title: "Cities Covered", desc: "Actively monitoring Abuja, Lagos, Port Harcourt, and Kano with nationwide expansion underway.", icon: <IconPin /> },
  { num: "03 /", title: "What We Provide", desc: "Real-time AQI data, historical trend analysis, predictive modelling, and health-impact assessments.", icon: <IconActivity /> },
  { num: "04 /", title: "Why It Matters", desc: "Clean air is fundamental to public health. Our data drives evidence-based environmental policy and civic awareness.", icon: <IconHeart /> },
]

/* ─── Small reusable components ──────────────────────── */
function SectionLabel({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex items-center gap-3 mb-5">
      <span className="block w-6 h-px bg-[#38e8c8]" />
      <span className="font-mono text-[0.65rem] tracking-[0.25em] uppercase text-[#38e8c8]">{children}</span>
    </div>
  )
}

function useReveal() {
  const ref = useRef<HTMLDivElement>(null)
  const [visible, setVisible] = useState(false)
  useEffect(() => {
    const el = ref.current
    if (!el) return
    const obs = new IntersectionObserver(
      ([entry]) => { if (entry.isIntersecting) setVisible(true) },
      { threshold: 0.1, rootMargin: "0px 0px -40px 0px" }
    )
    obs.observe(el)
    return () => obs.disconnect()
  }, [])
  return { ref, visible }
}

function Reveal({ children, delay = 0, className = "" }: { children: React.ReactNode; delay?: number; className?: string }) {
  const { ref, visible } = useReveal()
  return (
    <div
      ref={ref}
      className={`transition-all duration-700 ease-out ${visible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-8"} ${className}`}
      style={{ transitionDelay: `${delay}ms` }}
    >
      {children}
    </div>
  )
}

/* ─── AQI Card ───────────────────────────────────────── */
function AQICard({ city, barsVisible }: { city: CityData; barsVisible: boolean }) {
  const c = aqiColors[city.level]
  return (
    <div
      className={`
        group flex items-center gap-5 bg-[#111d2e] border border-[rgba(96,224,200,0.12)]
        border-l-4 ${c.border} rounded-xl px-6 py-5
        transition-all duration-300 hover:translate-x-1 hover:border-[rgba(56,232,200,0.3)]
        hover:bg-[rgba(17,29,46,0.9)] cursor-default
      `}
    >
      {/* City */}
      <div className="flex-none w-28">
        <p className="font-display font-bold text-white text-[1rem] leading-tight">{city.name}</p>
        <p className="font-mono text-[0.6rem] tracking-[0.15em] uppercase text-[rgba(200,216,239,0.45)] mt-0.5">
          {city.state} · {city.updatedAt}
        </p>
      </div>

      {/* Bar */}
      <div className="flex-1 flex flex-col gap-1.5">
        <div className="h-[3px] rounded-full bg-white/[0.07] overflow-hidden">
          <div
            className={`h-full rounded-full ${c.bar} transition-all duration-[1500ms] ease-out`}
            style={{ width: barsVisible ? `${city.barPct}%` : "0%" }}
          />
        </div>
        <span className={`font-mono text-[0.55rem] tracking-[0.15em] uppercase px-2 py-0.5 rounded self-start ${c.tag}`}>
          {aqiLabel[city.level]}
        </span>
      </div>

      {/* Value */}
      <div className={`font-display font-extrabold text-[1.8rem] leading-none tracking-tight w-14 text-right ${c.value}`}>
        {city.aqi}
      </div>
    </div>
  )
}

/* ─── Main Page ──────────────────────────────────────── */
export default function AQMPLanding() {
  const [scrolled, setScrolled] = useState(false)
  const [mobileOpen, setMobileOpen] = useState(false)
  const [barsVisible, setBarsVisible] = useState(false)
  const dataRef = useRef<HTMLElement>(null)

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 40)
    window.addEventListener("scroll", handleScroll, { passive: true })
    return () => window.removeEventListener("scroll", handleScroll)
  }, [])

  // Trigger AQI bars when data section enters view
  useEffect(() => {
    const el = dataRef.current
    if (!el) return
    const obs = new IntersectionObserver(
      ([entry]) => { if (entry.isIntersecting) setBarsVisible(true) },
      { threshold: 0.3 }
    )
    obs.observe(el)
    return () => obs.disconnect()
  }, [])

  return (
    <>
      {/* ── Global styles via <style> tag ── */}
      <style jsx global>{`
        @import url('https://fonts.googleapis.com/css2?family=Syne:wght@400;600;700;800&family=DM+Mono:wght@300;400;500&family=DM+Sans:ital,wght@0,300;0,400;0,500;1,300&display=swap');

        :root {
          --ink: #0a0f1a;
          --deep: #0d1625;
          --panel: #111d2e;
          --teal: #38e8c8;
          --teal-dim: rgba(56,232,200,0.18);
          --teal-glow: rgba(56,232,200,0.08);
          --border: rgba(96,224,200,0.12);
          --text: #c8d8ef;
          --muted: rgba(200,216,239,0.45);
          --white: #eef4ff;
        }

        html { scroll-behavior: smooth; }
        body { background: var(--ink); color: var(--text); font-family: 'DM Sans', sans-serif; font-weight: 300; overflow-x: hidden; }

        .font-display { font-family: 'Syne', sans-serif !important; }
        .font-mono-custom { font-family: 'DM Mono', monospace !important; }

        /* Noise overlay */
        body::before {
          content: '';
          position: fixed;
          inset: 0;
          background-image: url("data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noise'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noise)' opacity='0.03'/%3E%3C/svg%3E");
          pointer-events: none;
          z-index: 9999;
          opacity: 0.35;
        }

        /* Grid animation */
        @keyframes gridDrift { to { transform: translateY(60px); } }
        @keyframes orbit { to { transform: rotate(360deg); } }
        @keyframes orbitReverse { to { transform: rotate(-360deg); } }
        @keyframes blink { 0%,100%{opacity:1} 50%{opacity:0.3} }
        @keyframes floatUp {
          0% { opacity: 0; transform: translateY(0) scale(0); }
          10% { opacity: 0.7; }
          90% { opacity: 0.3; }
          100% { opacity: 0; transform: translateY(-200px) scale(1.5); }
        }
        @keyframes heroFade { from { opacity:0; transform:translateY(24px); } to { opacity:1; transform:translateY(0); } }

        .hero-grid {
          position: absolute; inset: 0;
          background-image:
            linear-gradient(rgba(56,232,200,0.04) 1px, transparent 1px),
            linear-gradient(90deg, rgba(56,232,200,0.04) 1px, transparent 1px);
          background-size: 60px 60px;
          mask-image: radial-gradient(ellipse 80% 80% at 50% 50%, black 30%, transparent 100%);
          pointer-events: none;
          animation: gridDrift 20s linear infinite;
        }

        .ring { position: absolute; border-radius: 50%; border: 1px solid; top: 50%; left: 50%; pointer-events: none; }
        .ring-1 { width:500px;height:500px;margin:-250px 0 0 -250px;border-color:rgba(56,232,200,0.07);animation:orbit 30s linear infinite; }
        .ring-2 { width:750px;height:750px;margin:-375px 0 0 -375px;border-color:rgba(26,143,255,0.05);animation:orbitReverse 50s linear infinite; }
        .ring-3 { width:1100px;height:1100px;margin:-550px 0 0 -550px;border-color:rgba(56,232,200,0.025);animation:orbit 80s linear infinite; }

        .hero-badge { animation: heroFade 0.8s ease both; }
        .hero-h1 { animation: heroFade 0.8s 0.2s ease both; }
        .hero-sub { animation: heroFade 0.8s 0.4s ease both; }
        .hero-actions { animation: heroFade 0.8s 0.6s ease both; }
        .hero-metrics { animation: heroFade 0.8s 0.8s ease both; }

        .badge-dot { animation: blink 1.5s ease infinite; }
        .status-dot { animation: blink 1.5s ease infinite; }

        ::-webkit-scrollbar { width: 3px; }
        ::-webkit-scrollbar-track { background: var(--ink); }
        ::-webkit-scrollbar-thumb { background: rgba(56,232,200,0.2); border-radius: 2px; }
      `}</style>

      <div className="min-h-screen flex flex-col" style={{ background: "var(--ink)", color: "var(--text)" }}>

        {/* ── NAV ── */}
        <nav
          className={`fixed top-0 inset-x-0 z-50 transition-all duration-400 ${
            scrolled
              ? "py-3 border-b"
              : "py-5"
          }`}
          style={{
            background: scrolled ? "rgba(10,15,26,0.97)" : "linear-gradient(to bottom,rgba(10,15,26,0.95),transparent)",
            backdropFilter: "blur(16px)",
            borderColor: "var(--border)",
          }}
        >
          <div className="max-w-[1240px] mx-auto px-6 lg:px-10 flex items-center justify-between">

            {/* Logo */}
            <Link href="/" className="flex items-center gap-3.5 no-underline">
              <div
                className="w-9 h-9 rounded-[8px] grid place-items-center border transition-all"
                style={{
                  border: "1.5px solid var(--teal)",
                  background: "var(--teal-glow)",
                  boxShadow: "0 0 16px var(--teal-dim)",
                }}
              >
                <svg viewBox="0 0 24 24" className="w-4 h-4" fill="none" stroke="var(--teal)" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                  <circle cx="12" cy="12" r="3" />
                  <path d="M12 2v4M12 18v4M2 12h4M18 12h4" />
                  <path d="M5.6 5.6l2.8 2.8M15.6 15.6l2.8 2.8M5.6 18.4l2.8-2.8M15.6 8.4l2.8-2.8" />
                </svg>
              </div>
              <div>
                <div className="font-display font-extrabold text-lg tracking-tight text-[var(--white)] leading-none">Air Sense</div>
                <div className="font-mono-custom text-[0.55rem] tracking-[0.2em] uppercase text-[var(--teal)] mt-0.5">Nigeria</div>
              </div>
            </Link>

            {/* Desktop links */}
            <ul className="hidden lg:flex items-center gap-10 list-none">
              {["#about", "#data", "#partners", "#contact"].map((href, i) => (
                <li key={href}>
                  <a
                    href={href}
                    className="font-mono-custom text-[0.7rem] tracking-[0.15em] uppercase transition-colors duration-200 relative group"
                    style={{ color: "var(--muted)" }}
                    onMouseEnter={e => (e.currentTarget.style.color = "var(--teal)")}
                    onMouseLeave={e => (e.currentTarget.style.color = "var(--muted)")}
                  >
                    {["Platform", "Live Data", "Partners", "Contact"][i]}
                    <span className="absolute -bottom-1 left-0 h-px bg-[var(--teal)] w-0 group-hover:w-full transition-all duration-300" />
                  </a>
                </li>
              ))}
            </ul>

            {/* Desktop auth */}
            <div className="hidden lg:flex items-center gap-3">
              <Link
                href="/login"
                className="font-mono-custom text-[0.7rem] tracking-[0.12em] uppercase px-5 py-2.5 rounded-md border transition-all duration-200 no-underline"
                style={{ color: "var(--muted)", border: "1px solid transparent" }}
                onMouseEnter={e => { (e.currentTarget as HTMLElement).style.color = "var(--teal)"; (e.currentTarget as HTMLElement).style.borderColor = "var(--border)"; (e.currentTarget as HTMLElement).style.background = "var(--teal-glow)" }}
                onMouseLeave={e => { (e.currentTarget as HTMLElement).style.color = "var(--muted)"; (e.currentTarget as HTMLElement).style.borderColor = "transparent"; (e.currentTarget as HTMLElement).style.background = "transparent" }}
              >
                Sign In
              </Link>
              <Link
                href="/register"
                className="font-mono-custom text-[0.7rem] tracking-[0.12em] uppercase px-5 py-2.5 rounded-md font-medium no-underline transition-all duration-200 hover:-translate-y-px"
                style={{ background: "var(--teal)", color: "var(--ink)", boxShadow: "0 0 20px rgba(56,232,200,0.25)" }}
                onMouseEnter={e => { (e.currentTarget as HTMLElement).style.background = "#5cf0d8"; (e.currentTarget as HTMLElement).style.boxShadow = "0 0 32px rgba(56,232,200,0.45)" }}
                onMouseLeave={e => { (e.currentTarget as HTMLElement).style.background = "var(--teal)"; (e.currentTarget as HTMLElement).style.boxShadow = "0 0 20px rgba(56,232,200,0.25)" }}
              >
                Get Access →
              </Link>
            </div>

            {/* Hamburger */}
            <button
              className="lg:hidden border rounded-md p-2 transition-all duration-200"
              style={{ border: "1px solid var(--border)", color: "var(--muted)", background: "transparent" }}
              onClick={() => setMobileOpen(v => !v)}
              aria-label="Menu"
            >
              <svg viewBox="0 0 24 24" className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
                {mobileOpen
                  ? <path d="M6 18L18 6M6 6l12 12" />
                  : <path d="M3 6h18M3 12h18M3 18h18" />
                }
              </svg>
            </button>
          </div>

          {/* Mobile menu */}
          {mobileOpen && (
            <div
              className="lg:hidden fixed inset-0 top-[72px] flex flex-col items-center justify-center gap-8 z-40 border-t"
              style={{ background: "rgba(10,15,26,0.98)", backdropFilter: "blur(20px)", borderColor: "var(--border)" }}
            >
              {["#about", "#data", "#partners", "#contact"].map((href, i) => (
                <a
                  key={href} href={href}
                  className="font-display font-bold text-3xl tracking-tight transition-colors duration-200 no-underline"
                  style={{ color: "var(--muted)" }}
                  onClick={() => setMobileOpen(false)}
                  onMouseEnter={e => (e.currentTarget.style.color = "var(--teal)")}
                  onMouseLeave={e => (e.currentTarget.style.color = "var(--muted)")}
                >
                  {["Platform", "Live Data", "Partners", "Contact"][i]}
                </a>
              ))}
              <div className="w-px h-8" style={{ background: "var(--border)" }} />
              <Link href="/login" className="font-mono-custom text-sm tracking-widest uppercase no-underline" style={{ color: "var(--muted)" }} onClick={() => setMobileOpen(false)}>Sign In</Link>
              <Link href="/register" className="font-mono-custom text-sm tracking-widest uppercase px-8 py-3 rounded-lg font-medium no-underline" style={{ background: "var(--teal)", color: "var(--ink)" }} onClick={() => setMobileOpen(false)}>Get Access →</Link>
            </div>
          )}
        </nav>

        <main className="flex-grow">

          {/* ── HERO ── */}
          <section className="relative min-h-screen flex flex-col items-center justify-center text-center px-6 lg:px-10 pt-28 pb-20 overflow-hidden">
            <div className="hero-grid" />
            {/* Atmospheric glow */}
            <div
              className="absolute top-[30%] left-1/2 -translate-x-1/2 -translate-y-1/2 w-[900px] h-[600px] pointer-events-none"
              style={{ background: "radial-gradient(ellipse, rgba(56,232,200,0.06) 0%, rgba(26,143,255,0.04) 40%, transparent 70%)" }}
            />
            {/* Rings */}
            <div className="ring ring-1" />
            <div className="ring ring-2" />
            <div className="ring ring-3" />

            {/* Badge */}
            <div
              className="hero-badge inline-flex items-center gap-2 rounded-full px-4 py-1.5 mb-8 border"
              style={{ background: "rgba(56,232,200,0.08)", borderColor: "rgba(56,232,200,0.2)" }}
            >
              <span className="badge-dot w-1.5 h-1.5 rounded-full bg-[var(--teal)]" />
              <span className="font-mono-custom text-[0.65rem] tracking-[0.2em] uppercase text-[var(--teal)]">
                Live · Monitoring 4 Nigerian Cities
              </span>
            </div>

            {/* Headline */}
            <h1
              className="hero-h1 font-display font-extrabold leading-[0.95] tracking-tight max-w-4xl text-[var(--white)]"
              style={{ fontSize: "clamp(3rem,8vw,7rem)" }}
            >
              Breathe{" "}
              <em
                className="not-italic"
                style={{ color: "transparent", WebkitTextStroke: "1px var(--teal)", filter: "drop-shadow(0 0 12px rgba(56,232,200,0.4))" }}
              >
                Smarter
              </em>
              <br />
              with Real-Time
              <br />
              Air Data
            </h1>

            <p className="hero-sub mt-7 max-w-lg text-[var(--muted)] leading-relaxed font-light" style={{ fontSize: "1.05rem" }}>
              Environmental intelligence for Nigeria's major cities — powered by NASRDA's Space Science Applications and ECC Division.
            </p>

            {/* CTA */}
            <div className="hero-actions mt-12 flex flex-col sm:flex-row items-center gap-4">
              <Link
                href="/dashboard"
                className="font-mono-custom text-[0.8rem] tracking-[0.12em] uppercase px-9 py-4 rounded-lg font-medium no-underline transition-all duration-200 hover:-translate-y-px"
                style={{ background: "var(--teal)", color: "var(--ink)", boxShadow: "0 0 20px rgba(56,232,200,0.25)" }}
              >
                Open Dashboard →
              </Link>
              <a
                href="#data"
                className="font-mono-custom text-[0.8rem] tracking-[0.12em] uppercase px-9 py-4 rounded-lg border transition-all duration-200 no-underline"
                style={{ border: "1px solid var(--border)", color: "var(--muted)" }}
                onMouseEnter={e => { (e.currentTarget).style.color = "var(--teal)"; (e.currentTarget).style.borderColor = "rgba(56,232,200,0.3)"; (e.currentTarget).style.background = "var(--teal-glow)" }}
                onMouseLeave={e => { (e.currentTarget).style.color = "var(--muted)"; (e.currentTarget).style.borderColor = "var(--border)"; (e.currentTarget).style.background = "transparent" }}
              >
                View Live Data
              </a>
            </div>

            {/* Metrics bar */}
            <div
              className="hero-metrics mt-20 flex flex-col sm:flex-row border rounded-2xl overflow-hidden relative z-10 w-full max-w-3xl"
              style={{ background: "rgba(17,29,46,0.6)", backdropFilter: "blur(20px)", border: "1px solid var(--border)" }}
            >
              {METRICS.map((m, i) => (
                <div
                  key={i}
                  className="flex-1 py-7 px-8 text-center border-b sm:border-b-0 sm:border-r last:border-0"
                  style={{ borderColor: "var(--border)" }}
                >
                  <div className="font-display font-extrabold text-[2.2rem] leading-none tracking-tight text-[var(--teal)]">{m.value}</div>
                  <div className="font-mono-custom text-[0.6rem] tracking-[0.2em] uppercase text-[var(--muted)] mt-2">{m.label}</div>
                </div>
              ))}
            </div>
          </section>

          {/* ── ABOUT ── */}
          <section
            id="about"
            className="relative py-24 lg:py-32"
            style={{ background: "var(--deep)" }}
          >
            {/* Top divider */}
            <div
              className="absolute top-0 inset-x-0 h-px"
              style={{ background: "linear-gradient(90deg, transparent 0%, rgba(56,232,200,0.25) 50%, transparent 100%)" }}
            />
            <div className="max-w-[1240px] mx-auto px-6 lg:px-10">
              <SectionLabel>About the Platform</SectionLabel>
              <Reveal>
                <h2 className="font-display font-extrabold leading-[1.05] tracking-tight text-[var(--white)] max-w-xl" style={{ fontSize: "clamp(2.2rem,5vw,3.8rem)" }}>
                  Environmental Intelligence,<br />Built for Nigeria
                </h2>
              </Reveal>
              <Reveal delay={100}>
                <p className="mt-5 max-w-md font-light leading-[1.75] text-[var(--muted)]">
                  Cutting-edge atmospheric monitoring combining satellite data with ground sensors — delivering actionable insights to scientists, policymakers, and citizens.
                </p>
              </Reveal>

              {/* Cards grid */}
              <div
                className="mt-16 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 rounded-2xl overflow-hidden"
                style={{ border: "1px solid var(--border)", gap: "1px", background: "var(--border)" }}
              >
                {ABOUT_CARDS.map((card, i) => (
                  <Reveal key={i} delay={i * 80}>
                    <div
                      className="group p-8 lg:p-10 h-full relative overflow-hidden transition-colors duration-300"
                      style={{ background: "var(--panel)" }}
                      onMouseEnter={e => (e.currentTarget as HTMLElement).style.background = "rgba(17,29,46,0.95)"}
                      onMouseLeave={e => (e.currentTarget as HTMLElement).style.background = "var(--panel)"}
                    >
                      {/* Hover glow */}
                      <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-400 pointer-events-none"
                        style={{ background: "radial-gradient(ellipse 60% 40% at 50% 0%, rgba(56,232,200,0.06), transparent)" }} />

                      <div
                        className="w-12 h-12 rounded-[10px] grid place-items-center mb-6 border transition-all duration-300 group-hover:shadow-[0_0_20px_rgba(56,232,200,0.15)]"
                        style={{ border: "1px solid var(--border)", background: "var(--teal-glow)" }}
                      >
                        {card.icon}
                      </div>
                      <div className="font-mono-custom text-[0.6rem] tracking-[0.2em] mb-3" style={{ color: "rgba(56,232,200,0.3)" }}>{card.num}</div>
                      <div className="font-display font-bold text-[1.1rem] text-[var(--white)] mb-3">{card.title}</div>
                      <div className="text-[0.85rem] leading-[1.7] font-light text-[var(--muted)]">{card.desc}</div>
                    </div>
                  </Reveal>
                ))}
              </div>
            </div>
          </section>

          {/* ── LIVE DATA ── */}
          <section
            id="data"
            ref={dataRef}
            className="py-24 lg:py-32"
            style={{ background: "var(--ink)" }}
          >
            <div className="max-w-[1240px] mx-auto px-6 lg:px-10">
              <SectionLabel>Live Data Preview</SectionLabel>
              <Reveal>
                <h2 className="font-display font-extrabold leading-[1.05] tracking-tight text-[var(--white)] max-w-lg" style={{ fontSize: "clamp(2.2rem,5vw,3.8rem)" }}>
                  Air Quality,<br />Right Now
                </h2>
              </Reveal>
              <Reveal delay={100}>
                <p className="mt-5 max-w-md font-light leading-[1.75] text-[var(--muted)]">
                  Real-time AQI readings from monitoring stations across Nigeria's major cities. Updated every 60 seconds.
                </p>
              </Reveal>

              <div className="mt-16 grid grid-cols-1 lg:grid-cols-2 gap-10 items-start">
                {/* Map */}
                <Reveal>
                  <div
                    className="rounded-2xl overflow-hidden relative"
                    style={{ border: "1px solid var(--border)", background: "var(--panel)" }}
                  >
                    <img
                      src="https://lh3.googleusercontent.com/aida-public/AB6AXuBZhlroX0w48Fi1Azdbv_YAZC1ZlEPQHagnyhqO7HzDtTll0AXyMcR1kKGnfcSk-0hruT7-N56neXje1SLMlZK4qWiJ36wE-HOi7DhRct33PLyj1rhoEHQ3vs8_yDqoBXd9mcDO9uQnuriHLOrmAbPkBTvsPYG6Bq-_9xcLSA8p2CLB3hOhZp2F5nJfxXuaYf14TYXv8JiF6fnNYj8Qw-OCWX6caPScqlRVU5Re4XXPNACxPE-jGz2z7VRH-kvFh7UDm1CSdwN00nc"
                      alt="Nigeria monitoring network"
                      className="w-full object-cover"
                      style={{ height: 420, filter: "saturate(0.7) brightness(0.8) hue-rotate(190deg)", mixBlendMode: "luminosity" }}
                    />
                    <div className="absolute inset-0" style={{ background: "linear-gradient(to bottom, transparent 60%, var(--panel) 100%)" }} />
                    <div className="absolute bottom-5 left-5 font-mono-custom text-[0.6rem] tracking-[0.2em] uppercase text-[var(--teal)]">
                      Monitoring Network — Nigeria
                    </div>
                    <div
                      className="absolute top-4 right-4 flex items-center gap-1.5 rounded-full px-3 py-1.5 border font-mono-custom text-[0.6rem] tracking-[0.12em] uppercase text-emerald-400"
                      style={{ background: "rgba(10,15,26,0.8)", border: "1px solid var(--border)" }}
                    >
                      <span className="status-dot w-1.5 h-1.5 rounded-full bg-emerald-400" />
                      Live
                    </div>
                  </div>
                </Reveal>

                {/* AQI cards */}
                <Reveal delay={150} className="flex flex-col gap-3">
                  {CITIES.map(city => (
                    <AQICard key={city.name} city={city} barsVisible={barsVisible} />
                  ))}
                  <Link
                    href="/dashboard"
                    className="mt-2 font-mono-custom text-[0.75rem] tracking-[0.12em] uppercase py-4 rounded-xl text-center font-medium no-underline transition-all duration-200 hover:-translate-y-px"
                    style={{ background: "var(--teal)", color: "var(--ink)", boxShadow: "0 0 20px rgba(56,232,200,0.2)" }}
                  >
                    View Full Dashboard →
                  </Link>
                </Reveal>
              </div>
            </div>
          </section>

          {/* ── PARTNERS ── */}
          <section
            id="partners"
            className="relative py-24 lg:py-32"
            style={{ background: "var(--deep)" }}
          >
            <div
              className="absolute top-0 inset-x-0 h-px"
              style={{ background: "linear-gradient(90deg, transparent 0%, rgba(26,143,255,0.5) 50%, transparent 100%)" }}
            />
            <div className="max-w-[1240px] mx-auto px-6 lg:px-10">
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-10 lg:gap-16 items-end">
                <div>
                  <SectionLabel>Institutional Partners</SectionLabel>
                  <Reveal>
                    <h2 className="font-display font-extrabold leading-[1.05] tracking-tight text-[var(--white)]" style={{ fontSize: "clamp(2.2rem,5vw,3.8rem)" }}>
                      Backed by Nigeria's<br />Leading Agencies
                    </h2>
                  </Reveal>
                </div>
                <div>
                  <Reveal delay={100}>
                    <p className="font-light leading-[1.75] text-[var(--muted)]">
                      Proudly supported by Nigeria's premier space research and environmental monitoring institutions.
                    </p>
                    <div className="mt-6 flex flex-wrap gap-2">
                      {["Research Partnership", "Data Collaboration", "Tech Transfer"].map(tag => (
                        <span
                          key={tag}
                          className="font-mono-custom text-[0.65rem] tracking-[0.12em] uppercase border rounded-full px-4 py-1.5 cursor-default transition-all duration-200"
                          style={{ border: "1px solid var(--border)", color: "var(--muted)" }}
                        >
                          {tag}
                        </span>
                      ))}
                    </div>
                  </Reveal>
                </div>
              </div>

              <div className="mt-16 grid grid-cols-1 sm:grid-cols-3 gap-4">
                {PARTNERS.map((p, i) => (
                  <Reveal key={i} delay={i * 80}>
                    <div
                      className="group border rounded-2xl px-7 py-9 text-center relative overflow-hidden transition-all duration-300 hover:-translate-y-1 cursor-default"
                      style={{ background: "var(--panel)", border: "1px solid var(--border)" }}
                      onMouseEnter={e => (e.currentTarget as HTMLElement).style.borderColor = "rgba(56,232,200,0.25)"}
                      onMouseLeave={e => (e.currentTarget as HTMLElement).style.borderColor = "var(--border)"}
                    >
                      <div
                        className="absolute bottom-0 inset-x-0 h-20 opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none"
                        style={{ background: "linear-gradient(to top, rgba(56,232,200,0.04), transparent)" }}
                      />
                      <img
                        src={p.logo}
                        alt={p.name}
                        className="h-16 object-contain mx-auto mb-5 transition-all duration-300 group-hover:grayscale-[0.2]"
                        style={{ filter: "grayscale(1) brightness(1.3)" }}
                      />
                      <div className="font-display font-bold text-[var(--white)] text-[1rem] mb-2">{p.name}</div>
                      <div className="text-[0.8rem] leading-[1.65] font-light text-[var(--muted)]">{p.desc}</div>
                    </div>
                  </Reveal>
                ))}
              </div>
            </div>
          </section>

        </main>

        {/* ── FOOTER ── */}
        <footer
          id="contact"
          style={{ background: "var(--ink)", borderTop: "1px solid var(--border)" }}
        >
          <div className="max-w-[1240px] mx-auto px-6 lg:px-10 py-10 flex flex-col sm:flex-row items-center justify-between gap-6">
            <p className="font-mono-custom text-[0.65rem] tracking-[0.12em] uppercase" style={{ color: "rgba(200,216,239,0.25)" }}>
              © 2025 AQMP · Powered by NASRDA (SSA · ECC)
            </p>
            <div className="flex gap-7">
              {["Dashboard", "About", "Data Policy", "Contact"].map(label => (
                <a
                  key={label} href="#"
                  className="font-mono-custom text-[0.65rem] tracking-[0.12em] uppercase no-underline transition-colors duration-200"
                  style={{ color: "var(--muted)" }}
                  onMouseEnter={e => (e.currentTarget.style.color = "var(--teal)")}
                  onMouseLeave={e => (e.currentTarget.style.color = "var(--muted)")}
                >
                  {label}
                </a>
              ))}
            </div>
            <div className="flex gap-3">
              {/* Facebook */}
              <a href="#" aria-label="Facebook"
                className="w-9 h-9 grid place-items-center rounded-lg border transition-all duration-200"
                style={{ border: "1px solid var(--border)", color: "var(--muted)" }}
                onMouseEnter={e => { (e.currentTarget as HTMLElement).style.color = "var(--teal)"; (e.currentTarget as HTMLElement).style.borderColor = "rgba(56,232,200,0.3)"; (e.currentTarget as HTMLElement).style.background = "var(--teal-glow)" }}
                onMouseLeave={e => { (e.currentTarget as HTMLElement).style.color = "var(--muted)"; (e.currentTarget as HTMLElement).style.borderColor = "var(--border)"; (e.currentTarget as HTMLElement).style.background = "transparent" }}
              >
                <svg className="w-3.5 h-3.5 fill-current" viewBox="0 0 24 24"><path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" /></svg>
              </a>
              {/* Twitter */}
              <a href="#" aria-label="Twitter"
                className="w-9 h-9 grid place-items-center rounded-lg border transition-all duration-200"
                style={{ border: "1px solid var(--border)", color: "var(--muted)" }}
                onMouseEnter={e => { (e.currentTarget as HTMLElement).style.color = "var(--teal)"; (e.currentTarget as HTMLElement).style.borderColor = "rgba(56,232,200,0.3)"; (e.currentTarget as HTMLElement).style.background = "var(--teal-glow)" }}
                onMouseLeave={e => { (e.currentTarget as HTMLElement).style.color = "var(--muted)"; (e.currentTarget as HTMLElement).style.borderColor = "var(--border)"; (e.currentTarget as HTMLElement).style.background = "transparent" }}
              >
                <svg className="w-3.5 h-3.5 fill-current" viewBox="0 0 24 24"><path d="M23.953 4.57a10 10 0 01-2.825.775 4.958 4.958 0 002.163-2.723c-.951.555-2.005.959-3.127 1.184a4.92 4.92 0 00-8.384 4.482C7.69 8.095 4.067 6.13 1.64 3.162a4.822 4.822 0 00-.666 2.475c0 1.71.87 3.213 2.188 4.096a4.904 4.904 0 01-2.228-.616v.06a4.923 4.923 0 003.946 4.827 4.996 4.996 0 01-2.212.085 4.936 4.936 0 004.604 3.417 9.867 9.867 0 01-6.102 2.105c-.39 0-.779-.023-1.17-.067a13.995 13.995 0 007.557 2.209c9.053 0 13.998-7.496 13.998-13.985 0-.21 0-.42-.015-.63A9.935 9.935 0 0024 4.59z" /></svg>
              </a>
              {/* Email */}
              <a href="#" aria-label="Email"
                className="w-9 h-9 grid place-items-center rounded-lg border transition-all duration-200"
                style={{ border: "1px solid var(--border)", color: "var(--muted)" }}
                onMouseEnter={e => { (e.currentTarget as HTMLElement).style.color = "var(--teal)"; (e.currentTarget as HTMLElement).style.borderColor = "rgba(56,232,200,0.3)"; (e.currentTarget as HTMLElement).style.background = "var(--teal-glow)" }}
                onMouseLeave={e => { (e.currentTarget as HTMLElement).style.color = "var(--muted)"; (e.currentTarget as HTMLElement).style.borderColor = "var(--border)"; (e.currentTarget as HTMLElement).style.background = "transparent" }}
              >
                <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M3 8l7.89 4.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" /></svg>
              </a>
            </div>
          </div>
        </footer>

      </div>
    </>
  )
}