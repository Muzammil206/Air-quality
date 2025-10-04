"use client"

import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { useState } from "react"
import Link from "next/link"
import Image from "next/image"

export default function AirQualityPlatform() {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)

  return (
    <div className="min-h-screen flex flex-col font-sans">
      {/* Custom styles for this component */}
      <style jsx>{`
        .aqmp-primary { color: #1193d4; }
        .aqmp-bg-primary { background-color: #1193d4; }
        .aqmp-bg-primary-hover:hover { background-color: #0f7fb8; }
        .aqmp-bg-light { background-color: #f6f7f8; }
        .aqmp-bg-dark { background-color: #101c22; }
        .aqmp-hero-bg {
          background-image: linear-gradient(rgba(0, 0, 0, 0.4) 0%, rgba(0, 0, 0, 0.6) 100%), 
                           url("https://lh3.googleusercontent.com/aida-public/AB6AXuDze2wg5tHrHBD9NNRmqg5oXvgYxVPs85iUAioa79QDOUeHOv9BTVtRTbS6qgt2GxSt0q5K7COUxVkNw_yig6YHGGWFzdfNOBe7_tePSyAz2bK3Drp7AfUB2FHBebrS03K_2gODZ0Jco9c07Xch8dESCJlbUoxPEai12oVIyX6oFxq_NbuW1dgl6cGy-LH0ptGl8yTtPmC1La4jWady8TDTCRAY2tPr6nXBWmOgEvroc-kLdC35iT4WWIqlRk_a-2Dc2CnEbK8oLvA");
          background-size: cover;
          background-position: center;
        }
        .material-icon {
          font-family: 'Material Symbols Outlined';
          font-weight: normal;
          font-style: normal;
          font-size: 48px;
          line-height: 1;
          letter-spacing: normal;
          text-transform: none;
          display: inline-block;
          white-space: nowrap;
          word-wrap: normal;
          direction: ltr;
          font-variation-settings: 'FILL' 0, 'wght' 300, 'GRAD' 0, 'opsz' 48;
        }
        .aqmp-nav-bg {
          background: rgba(255, 255, 255, 0.98);
          backdrop-filter: blur(20px);
          border-bottom: 1px solid rgba(17, 147, 212, 0.1);
          box-shadow: 0 4px 20px rgba(0, 0, 0, 0.08);
        }
        .aqmp-card-hover:hover {
          transform: translateY(-8px);
          box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.25);
        }
        .aqmp-gradient-text {
          background: linear-gradient(135deg, #1193d4, #0f7fb8);
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
          background-clip: text;
        }
        .aqmp-nav-link {
          position: relative;
          transition: all 0.3s ease;
        }
        .aqmp-nav-link:hover {
          color: #1193d4;
          transform: translateY(-1px);
        }
        .aqmp-nav-link::after {
          content: '';
          position: absolute;
          bottom: -4px;
          left: 0;
          width: 0;
          height: 2px;
          background: linear-gradient(135deg, #1193d4, #0f7fb8);
          transition: width 0.3s ease;
        }
        .aqmp-nav-link:hover::after {
          width: 100%;
        }
        .aqmp-mobile-menu {
          background: rgba(255, 255, 255, 0.98);
          backdrop-filter: blur(20px);
          border-top: 1px solid rgba(17, 147, 212, 0.1);
        }
        .aqmp-logo-pulse {
          animation: pulse 2s infinite;
        }
        @keyframes pulse {
          0%, 100% { transform: scale(1); }
          50% { transform: scale(1.05); }
        }
        @media (max-width: 768px) {
          .material-icon {
            font-size: 36px;
          }
        }
      `}</style>

      {/* Google Fonts and Material Icons */}
      <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;700;900&display=swap" rel="stylesheet" />
      <link href="https://fonts.googleapis.com/css2?family=Material+Symbols+Outlined" rel="stylesheet" />

      <nav className="aqmp-nav-bg fixed top-0 left-0 w-full z-50 py-3 lg:py-4">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center">
            
            <div className="flex items-center gap-2 lg:gap-3">
              <Image src="/logo2.svg" alt="Air Quality Monitoring Platform" width={50} height={50} className="object-contain" />
              <div>
                <span className="text-xl lg:text-2xl font-black text-gray-900 tracking-tight">AQMP</span>
                <p className="text-xs text-gray-600 font-medium hidden sm:block">Air Quality Monitoring</p>
              </div>
            </div>

            {/* Desktop Navigation */}
            <div className="hidden lg:flex items-center space-x-8 xl:space-x-10">
              <a href="#about" className="aqmp-nav-link text-gray-700 font-semibold text-sm tracking-wide">
                About Platform
              </a>
              <a href="#data-preview" className="aqmp-nav-link text-gray-700 font-semibold text-sm tracking-wide">
                Live Data
              </a>
              <a href="#branding" className="aqmp-nav-link text-gray-700 font-semibold text-sm tracking-wide">
                Partners
              </a>
              <a href="#contact" className="aqmp-nav-link text-gray-700 font-semibold text-sm tracking-wide">
                Contact
              </a>
            </div>

            {/* Desktop Auth Buttons */}
            <div className="hidden lg:flex items-center space-x-3 xl:space-x-4">
              <Button
                variant="ghost"
                className="text-gray-700 hover:text-blue-600 font-semibold px-4 xl:px-6 py-2 rounded-lg hover:bg-blue-50 transition-all duration-300"
              >
                <Link href="/login">
                Login
                </Link>
              </Button>
              <Button className="aqmp-bg-primary aqmp-bg-primary-hover text-white font-semibold px-6 xl:px-8 py-2.5 rounded-lg shadow-lg hover:shadow-xl transform hover:scale-105 transition-all duration-300">
                <Link href="/signup">
                Sign Up Free
                </Link>
              </Button>
            </div>

            {/* Mobile Menu Button */}
            <button
              className="lg:hidden p-2 rounded-lg hover:bg-gray-100 transition-colors"
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            >
              <svg className="w-6 h-6 text-gray-700" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                {isMobileMenuOpen ? (
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                ) : (
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                )}
              </svg>
            </button>
          </div>

          {isMobileMenuOpen && (
            <div className="lg:hidden mt-4 aqmp-mobile-menu rounded-2xl p-6 mx-2 sm:mx-4 shadow-xl">
              <div className="flex flex-col space-y-6">
                <a
                  href="#about"
                  className="text-gray-700 hover:text-blue-600 font-semibold text-lg transition-colors"
                  onClick={() => setIsMobileMenuOpen(false)}
                >
                  About Platform
                </a>
                <a
                  href="#data-preview"
                  className="text-gray-700 hover:text-blue-600 font-semibold text-lg transition-colors"
                  onClick={() => setIsMobileMenuOpen(false)}
                >
                  Live Data
                </a>
                <a
                  href="#branding"
                  className="text-gray-700 hover:text-blue-600 font-semibold text-lg transition-colors"
                  onClick={() => setIsMobileMenuOpen(false)}
                >
                  Partners
                </a>
                <a
                  href="#contact"
                  className="text-gray-700 hover:text-blue-600 font-semibold text-lg transition-colors"
                  onClick={() => setIsMobileMenuOpen(false)}
                >
                  Contact
                </a>
                <div className="pt-4 border-t border-gray-200 flex flex-col space-y-3">
                  <Button
                    variant="ghost"
                    className="text-gray-700 hover:text-blue-600 font-semibold justify-start px-0"
                  >
                    <Link href="/login">
                    Login
                    </Link>
                  </Button>
                  <Button className="aqmp-bg-primary aqmp-bg-primary-hover text-white font-semibold py-3 rounded-lg shadow-lg">
                    <Link href="/signup">
                    Sign Up Free
                    </Link>
                  </Button>
                </div>
              </div>
            </div>
          )}
        </div>
      </nav>

      <main className="flex-grow pt-16 lg:pt-20">
        <section className="aqmp-hero-bg relative min-h-screen flex items-center justify-center text-center text-white">
          <div className="absolute inset-0 bg-black/30"></div>
          <div className="relative z-10 px-4 sm:px-6 lg:px-8 max-w-6xl mx-auto">
            <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl xl:text-7xl font-black tracking-tight leading-tight">
              Air Quality Monitoring Platform
            </h1>
            <p className="mt-4 sm:mt-6 text-base sm:text-lg md:text-xl lg:text-2xl max-w-4xl mx-auto leading-relaxed">
              Providing real-time environmental insights for Nigeria's cities – Powered by NASRDA (SSA Department, ECC
              Division).
            </p>
            <Button className="mt-6 sm:mt-8 aqmp-bg-primary aqmp-bg-primary-hover text-white font-bold py-3 sm:py-4 px-6 sm:px-8 rounded-lg text-base sm:text-lg transition-all duration-300 hover:shadow-xl transform hover:scale-105">
              <Link href="/dashboard">
              Explore Dashboard
              </Link>
            </Button>
          </div>
        </section>

        <section
          className="py-16 sm:py-20 lg:py-28 bg-gradient-to-br from-gray-50 to-white dark:from-gray-900 dark:to-gray-800"
          id="about"
        >
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center">
              <h2 className="text-3xl sm:text-4xl lg:text-5xl font-black text-gray-900 dark:text-white tracking-tight">
                About the <span className="aqmp-gradient-text">Platform</span>
              </h2>
              <p className="mt-4 sm:mt-6 text-lg sm:text-xl text-gray-600 dark:text-gray-400 max-w-3xl mx-auto leading-relaxed">
                Understanding our mission and the cutting-edge technology that drives environmental monitoring across
                Nigeria.
              </p>
            </div>
            <div className="mt-12 sm:mt-16 lg:mt-20 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 lg:gap-8">
              <Card className="bg-white dark:bg-gray-800/50 rounded-2xl shadow-xl aqmp-card-hover transition-all duration-500 border-0 overflow-hidden">
                <CardContent className="p-6 lg:p-8 text-center relative">
                  <div className="absolute top-0 left-0 w-full h-1 aqmp-bg-primary"></div>
                  <span className="material-icon aqmp-primary mx-auto block mb-4">groups</span>
                  <h3 className="text-lg lg:text-xl font-bold text-gray-900 dark:text-white mb-3">Who We Are</h3>
                  <p className="text-sm lg:text-base text-gray-600 dark:text-gray-400 leading-relaxed">
                    A dedicated team of scientists, analysts, and environmental experts committed to improving air
                    quality monitoring across Nigeria.
                  </p>
                </CardContent>
              </Card>

              <Card className="bg-white dark:bg-gray-800/50 rounded-2xl shadow-xl aqmp-card-hover transition-all duration-500 border-0 overflow-hidden">
                <CardContent className="p-6 lg:p-8 text-center relative">
                  <div className="absolute top-0 left-0 w-full h-1 aqmp-bg-primary"></div>
                  <span className="material-icon aqmp-primary mx-auto block mb-4">location_city</span>
                  <h3 className="text-lg lg:text-xl font-bold text-gray-900 dark:text-white mb-3">Cities Covered</h3>
                  <p className="text-sm lg:text-base text-gray-600 dark:text-gray-400 leading-relaxed">
                    Currently monitoring Abuja, Lagos, Port Harcourt, and Kano, with ambitious plans for comprehensive
                    nationwide expansion.
                  </p>
                </CardContent>
              </Card>

              <Card className="bg-white dark:bg-gray-800/50 rounded-2xl shadow-xl aqmp-card-hover transition-all duration-500 border-0 overflow-hidden">
                <CardContent className="p-6 lg:p-8 text-center relative">
                  <div className="absolute top-0 left-0 w-full h-1 aqmp-bg-primary"></div>
                  <span className="material-icon aqmp-primary mx-auto block mb-4">analytics</span>
                  <h3 className="text-lg lg:text-xl font-bold text-gray-900 dark:text-white mb-3">What We Provide</h3>
                  <p className="text-sm lg:text-base text-gray-600 dark:text-gray-400 leading-relaxed">
                    Real-time air quality data, comprehensive historical trends, predictive analytics, and actionable
                    environmental insights.
                  </p>
                </CardContent>
              </Card>

              <Card className="bg-white dark:bg-gray-800/50 rounded-2xl shadow-xl aqmp-card-hover transition-all duration-500 border-0 overflow-hidden">
                <CardContent className="p-6 lg:p-8 text-center relative">
                  <div className="absolute top-0 left-0 w-full h-1 aqmp-bg-primary"></div>
                  <span className="material-icon aqmp-primary mx-auto block mb-4">health_and_safety</span>
                  <h3 className="text-lg lg:text-xl font-bold text-gray-900 dark:text-white mb-3">Why It Matters</h3>
                  <p className="text-sm lg:text-base text-gray-600 dark:text-gray-400 leading-relaxed">
                    Clean air is fundamental to public health, and our platform serves as a crucial tool for
                    environmental change and policy making.
                  </p>
                </CardContent>
              </Card>
            </div>
          </div>
        </section>

        <section className="py-16 sm:py-20 lg:py-28 bg-white dark:bg-gray-800/30" id="data-preview">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center">
              <h2 className="text-3xl sm:text-4xl lg:text-5xl font-black text-gray-900 dark:text-white tracking-tight">
                Live <span className="aqmp-gradient-text">Data Preview</span>
              </h2>
              <p className="mt-4 sm:mt-6 text-lg sm:text-xl text-gray-600 dark:text-gray-400 max-w-3xl mx-auto leading-relaxed">
                Real-time air quality insights from monitoring stations across Nigeria's major metropolitan areas.
              </p>
            </div>
            <div className="mt-12 sm:mt-16 lg:mt-20 grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-12 items-center">
              <div className="order-2 lg:order-1 rounded-2xl overflow-hidden shadow-2xl">
                <img
                  alt="Interactive map of Nigeria showing air quality monitoring stations"
                  className="w-full h-64 sm:h-80 lg:h-full object-cover"
                  src="https://lh3.googleusercontent.com/aida-public/AB6AXuBZhlroX0w48Fi1Azdbv_YAZC1ZlEPQHagnyhqO7HzDtTll0AXyMcR1kKGnfcSk-0hruT7-N56neXje1SLMlZK4qWiJ36wE-HOi7DhRct33PLyj1rhoEHQ3vs8_yDqoBXd9mcDO9uQnuriHLOrmAbPkBTvsPYG6Bq-_9xcLSA8p2CLB3hOhZp2F5nJfxXuaYf14TYXv8JiF6fnNYj8Qw-OCWX6caPScqlRVU5Re4XXPNACxPE-jGz2z7VRH-kvFh7UDm1CSdwN00nc"
                />
              </div>
              <div className="order-1 lg:order-2 grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6">
                <Card className="bg-gradient-to-br from-green-50 to-green-100 dark:from-green-900/20 dark:to-green-800/20 p-4 sm:p-6 rounded-2xl shadow-lg border border-green-200 dark:border-green-800/30 aqmp-card-hover transition-all duration-300">
                  <CardContent className="p-0">
                    <div className="flex items-center justify-between mb-2">
                      <p className="text-base sm:text-lg font-bold text-gray-900 dark:text-white">Abuja</p>
                      <span className="material-icon text-green-600 text-lg sm:text-xl">location_on</span>
                    </div>
                    <p className="text-3xl sm:text-4xl font-black aqmp-primary mb-3">42</p>
                    <Badge className="bg-green-500/20 text-green-700 dark:text-green-400 border-green-500/30 font-medium text-xs sm:text-sm">
                      Good Air Quality
                    </Badge>
                    <p className="text-xs text-gray-500 dark:text-gray-400 mt-2">Last updated: 2 min ago</p>
                  </CardContent>
                </Card>

                <Card className="bg-gradient-to-br from-yellow-50 to-yellow-100 dark:from-yellow-900/20 dark:to-yellow-800/20 p-4 sm:p-6 rounded-2xl shadow-lg border border-yellow-200 dark:border-yellow-800/30 aqmp-card-hover transition-all duration-300">
                  <CardContent className="p-0">
                    <div className="flex items-center justify-between mb-2">
                      <p className="text-base sm:text-lg font-bold text-gray-900 dark:text-white">Lagos</p>
                      <span className="material-icon text-yellow-600 text-lg sm:text-xl">location_on</span>
                    </div>
                    <p className="text-3xl sm:text-4xl font-black aqmp-primary mb-3">65</p>
                    <Badge className="bg-yellow-500/20 text-yellow-700 dark:text-yellow-400 border-yellow-500/30 font-medium text-xs sm:text-sm">
                      Moderate
                    </Badge>
                    <p className="text-xs text-gray-500 dark:text-gray-400 mt-2">Last updated: 1 min ago</p>
                  </CardContent>
                </Card>

                <Card className="bg-gradient-to-br from-yellow-50 to-yellow-100 dark:from-yellow-900/20 dark:to-yellow-800/20 p-4 sm:p-6 rounded-2xl shadow-lg border border-yellow-200 dark:border-yellow-800/30 aqmp-card-hover transition-all duration-300">
                  <CardContent className="p-0">
                    <div className="flex items-center justify-between mb-2">
                      <p className="text-base sm:text-lg font-bold text-gray-900 dark:text-white">Port Harcourt</p>
                      <span className="material-icon text-yellow-600 text-lg sm:text-xl">location_on</span>
                    </div>
                    <p className="text-3xl sm:text-4xl font-black aqmp-primary mb-3">58</p>
                    <Badge className="bg-yellow-500/20 text-yellow-700 dark:text-yellow-400 border-yellow-500/30 font-medium text-xs sm:text-sm">
                      Moderate
                    </Badge>
                    <p className="text-xs text-gray-500 dark:text-gray-400 mt-2">Last updated: 3 min ago</p>
                  </CardContent>
                </Card>

                <Card className="bg-gradient-to-br from-yellow-50 to-yellow-100 dark:from-yellow-900/20 dark:to-yellow-800/20 p-4 sm:p-6 rounded-2xl shadow-lg border border-yellow-200 dark:border-yellow-800/30 aqmp-card-hover transition-all duration-300">
                  <CardContent className="p-0">
                    <div className="flex items-center justify-between mb-2">
                      <p className="text-base sm:text-lg font-bold text-gray-900 dark:text-white">Kano</p>
                      <span className="material-icon text-yellow-600 text-lg sm:text-xl">location_on</span>
                    </div>
                    <p className="text-3xl sm:text-4xl font-black aqmp-primary mb-3">72</p>
                    <Badge className="bg-yellow-500/20 text-yellow-700 dark:text-yellow-400 border-yellow-500/30 font-medium text-xs sm:text-sm">
                      Moderate
                    </Badge>
                    <p className="text-xs text-gray-500 dark:text-gray-400 mt-2">Last updated: 5 min ago</p>
                  </CardContent>
                </Card>
              </div>
            </div>
          </div>
        </section>

        <section
          className="py-16 sm:py-20 lg:py-28 bg-gradient-to-br from-gray-50 to-blue-50 dark:from-gray-900 dark:to-blue-900/20"
          id="branding"
        >
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center">
              <h2 className="text-3xl sm:text-4xl lg:text-5xl font-black text-gray-900 dark:text-white tracking-tight">
                Our <span className="aqmp-gradient-text">Partners</span>
              </h2>
              <p className="mt-4 sm:mt-6 text-lg sm:text-xl text-gray-600 dark:text-gray-400 max-w-3xl mx-auto leading-relaxed">
                Proudly supported by Nigeria's leading space research agencies and environmental monitoring
                institutions.
              </p>
            </div>
            <div className="mt-12 sm:mt-16 lg:mt-20 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 lg:gap-8">
              <Card className="group bg-white dark:bg-gray-800/50 rounded-2xl shadow-xl aqmp-card-hover transition-all duration-500 border-0 overflow-hidden">
                <CardContent className="p-6 sm:p-8 lg:p-10 text-center">
                  <div className="mb-4 sm:mb-6">
                    <img
                      alt="NASRDA - National Space Research and Development Agency Logo"
                      className="h-16 sm:h-20 lg:h-24 object-contain mx-auto group-hover:scale-110 transition-transform duration-300"
                      src="https://lh3.googleusercontent.com/aida-public/AB6AXuAo3pJPtUSA0kcoi36e6WIHwQldBK_jtVC4ksX1CgS-uzsSJijJmV2jF80Na45vp5nFiH9WhboD0PXRyKDhkMlzF5RY4WDBgYWjZab5Tx7agdmgtEy8pqkXOA9r-SYDrd4Hi6_QVSuNLSPKSlt_t8M6zq0aHYsxRAjuwnWH4o8hW0fFpbQm9P662Fzv_CRyzaf2JyDQap1QCmwRh-zkLsGPO3QCw4LBfngZ_1_G95AWGFJzkDjH70r0Yz2piwPEltcu8mg0gwMediA"
                    />
                  </div>
                  <h3 className="text-lg lg:text-xl font-bold text-gray-900 dark:text-white mb-2">NASRDA</h3>
                  <p className="text-sm lg:text-base text-gray-600 dark:text-gray-400 leading-relaxed">
                    National Space Research and Development Agency - Leading Nigeria's space technology initiatives
                  </p>
                </CardContent>
              </Card>

              <Card className="group bg-white dark:bg-gray-800/50 rounded-2xl shadow-xl aqmp-card-hover transition-all duration-500 border-0 overflow-hidden">
                <CardContent className="p-6 sm:p-8 lg:p-10 text-center">
                  <div className="mb-4 sm:mb-6">
                    <img
                      alt="SSA Department - Space Science Applications Logo"
                      className="h-16 sm:h-20 lg:h-24 object-contain mx-auto group-hover:scale-110 transition-transform duration-300"
                      src="https://lh3.googleusercontent.com/aida-public/AB6AXuB7BkgxdrFG0Ay6TZxALNkIfsQKkwCgROxNkMWdSiTcVsvXLejwZzFFrADiVjwY1wCRBMM8NZfqDNefjIZhUVPk58AQjnBX0Q_n1bVZIsV3qDPHeO9l7aaCiCeiwC_nVfbulEzvjl_8-CjzaVjgziXOcyfx-YKO84nHFxg6lGMsC-nb4qcX4E9fKWlxnNxmZ3v3DMwcFKaXNDE3qoLyN9p6cM_NGY8lGNG78y_tMmFvgq9b1RLeW1Ay7qERWm0kbU8NBjHxfBrmcOQ"
                    />
                  </div>
                  <h3 className="text-lg lg:text-xl font-bold text-gray-900 dark:text-white mb-2">SSA Department</h3>
                  <p className="text-sm lg:text-base text-gray-600 dark:text-gray-400 leading-relaxed">
                    Space Science Applications Department - Advancing satellite-based environmental monitoring
                  </p>
                </CardContent>
              </Card>

              <Card className="group bg-white dark:bg-gray-800/50 rounded-2xl shadow-xl aqmp-card-hover transition-all duration-500 border-0 overflow-hidden sm:col-span-2 lg:col-span-1">
                <CardContent className="p-6 sm:p-8 lg:p-10 text-center">
                  <div className="mb-4 sm:mb-6">
                    <img
                      alt="ECC Division - Environmental and Climate Change Logo"
                      className="h-16 sm:h-20 lg:h-24 object-contain mx-auto group-hover:scale-110 transition-transform duration-300"
                      src="https://lh3.googleusercontent.com/aida-public/AB6AXuAbf-P2vmFvxaC4BIl0yj7XDl4DRxvr6SzbUqVWMKuIYE7CqVbsbu7HP62S2nMzxgvZQAFpVyC_m-a5pCl9cdnmKlCyTjZYsENOxbhfzCaSZByp3s-B-Ihp8j-YAdjYqWXii22jSKDRDeKoiJ4kZD27YCy07E-ClQwnrF_XUy-e1VW_fefeerqLBqr_4NpbW676_c9sSrBMrNd9r_yv3CMc5l9ZY7wTwrLqY3IbTcKwamn4YIBV71J6_pIExCx4GnRGDJC4vSxblj8"
                    />
                  </div>
                  <h3 className="text-lg lg:text-xl font-bold text-gray-900 dark:text-white mb-2">ECC Division</h3>
                  <p className="text-sm lg:text-base text-gray-600 dark:text-gray-400 leading-relaxed">
                    Environmental and Climate Change Division - Specialized in atmospheric monitoring and analysis
                  </p>
                </CardContent>
              </Card>
            </div>
            <div className="mt-12 sm:mt-16 text-center">
              <p className="text-base sm:text-lg text-gray-500 dark:text-gray-400">
                Collaborating with leading institutions to advance environmental monitoring across Nigeria
              </p>
              <div className="mt-6 sm:mt-8 flex flex-wrap justify-center gap-3 sm:gap-4">
                <Badge variant="outline" className="px-3 sm:px-4 py-2 text-xs sm:text-sm">
                  Research Partnership
                </Badge>
                <Badge variant="outline" className="px-3 sm:px-4 py-2 text-xs sm:text-sm">
                  Data Collaboration
                </Badge>
                <Badge variant="outline" className="px-3 sm:px-4 py-2 text-xs sm:text-sm">
                  Technology Transfer
                </Badge>
              </div>
            </div>
          </div>
        </section>
      </main>

      <footer className="bg-white dark:bg-gray-800/50 border-t border-gray-200 dark:border-gray-800" id="contact">
        <div className="max-w-7xl mx-auto py-8 sm:py-12 px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col sm:flex-row justify-between items-center space-y-6 sm:space-y-0">
            <div className="flex flex-wrap justify-center sm:justify-start gap-4 sm:gap-6">
              <a
                className="text-gray-500 hover:text-blue-500 dark:hover:text-blue-400 transition-colors text-sm sm:text-base"
                href="#"
              >
                Dashboard
              </a>
              <a
                className="text-gray-500 hover:text-blue-500 dark:hover:text-blue-400 transition-colors text-sm sm:text-base"
                href="#"
              >
                About
              </a>
              <a
                className="text-gray-500 hover:text-blue-500 dark:hover:text-blue-400 transition-colors text-sm sm:text-base"
                href="#"
              >
                Data Policy
              </a>
            </div>
            <div className="flex space-x-4 sm:space-x-6">
              <a
                className="text-gray-500 hover:text-blue-500 dark:hover:text-blue-400 transition-colors"
                href="#"
                aria-label="Facebook"
              >
                <svg className="h-5 w-5 sm:h-6 sm:w-6" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" />
                </svg>
              </a>
              <a
                className="text-gray-500 hover:text-blue-500 dark:hover:text-blue-400 transition-colors"
                href="#"
                aria-label="Twitter"
              >
                <svg className="h-5 w-5 sm:h-6 sm:w-6" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M23.953 4.57a10 10 0 01-2.825.775 4.958 4.958 0 002.163-2.723c-.951.555-2.005.959-3.127 1.184a4.92 4.92 0 00-8.384 4.482C7.69 8.095 4.067 6.13 1.64 3.162a4.822 4.822 0 00-.666 2.475c0 1.71.87 3.213 2.188 4.096a4.904 4.904 0 01-2.228-.616v.06a4.923 4.923 0 003.946 4.827 4.996 4.996 0 01-2.212.085 4.936 4.936 0 004.604 3.417 9.867 9.867 0 01-6.102 2.105c-.39 0-.779-.023-1.17-.067a13.995 13.995 0 007.557 2.209c9.053 0 13.998-7.496 13.998-13.985 0-.21 0-.42-.015-.63A9.935 9.935 0 0024 4.59z" />
                </svg>
              </a>
              <a
                className="text-gray-500 hover:text-blue-500 dark:hover:text-blue-400 transition-colors"
                href="#"
                aria-label="Email"
              >
                <svg className="h-5 w-5 sm:h-6 sm:w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M3 8l7.89 4.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"
                  />
                </svg>
              </a>
            </div>
          </div>
          <div className="mt-6 sm:mt-8 pt-6 sm:pt-8 border-t border-gray-200 dark:border-gray-700">
            <p className="text-center text-xs sm:text-sm text-gray-500 dark:text-gray-400">
              © 2025 Air Quality Monitoring Platform. Powered by NASRDA (SSA Department, ECC Division). All rights
              reserved.
            </p>
          </div>
        </div>
      </footer>
    </div>
  )
}
