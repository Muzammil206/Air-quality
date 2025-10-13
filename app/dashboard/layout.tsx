
import type React from "react"
import type { Metadata } from "next"
import { GeistSans } from "geist/font/sans"
import { GeistMono } from "geist/font/mono"
import { Analytics } from "@vercel/analytics/next"
import { ThemeProvider } from "@/components/theme-provider"
import { Suspense } from "react"
import { SidebarNavigation } from "@/components/sidebar-navigation"


export const metadata: Metadata = {
  title: "AirSense - Abuja Air Quality Dashboard",
  description: "Real-time air quality monitoring for Abuja, Nigeria",
  keywords: ["Air Quality", "Abuja ", "Nigeria", "narda"],
  authors: [{ name: "ismail muzammil" }],
  creator: "Ismail muzammil",
  publisher: "ismail muzammil",
  themeColor: "#4ade80",
  icons: {
    icon: "/favicon.ico",
    shortcut: "/favicon-16x16.png",
    apple: "/apple-touch-icon.png",
  },
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <style>{`
html {
  font-family: ${GeistSans.style.fontFamily};
  --font-sans: ${GeistSans.variable};
  --font-mono: ${GeistMono.variable};
}
        `}</style>
      </head>
      <body className="flex h-screen overflow-hidden">
        <Suspense fallback={null}>
          <ThemeProvider attribute="class" defaultTheme="system" enableSystem disableTransitionOnChange>
            <div className="flex w-full">
              <SidebarNavigation />
              <main className="flex-1 overflow-y-auto">
                {children}
              </main>
            </div>
          </ThemeProvider>
        </Suspense>
        <Analytics />
      </body>
    </html>
  )
}

