"use client"

// Custom hooks for air quality data fetching

import { useState, useEffect, useCallback } from "react"
import type { AirQualityReading, AirQualityStats, AIInsight, GAS_TYPES } from "@/lib/types"
import { fetchCurrentReading, fetchLocationStats, fetchHistoricalData, fetchAIInsights } from "@/lib/air-quality-api"

export function useCurrentReading(location: string, gasType: keyof typeof GAS_TYPES) {
  const [reading, setReading] = useState<AirQualityReading | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const fetchReading = useCallback(async () => {
    try {
      setLoading(true)
      setError(null)

      const data = await fetchCurrentReading(location, gasType)
      setReading(data)
    } catch (err) {
      setError(err instanceof Error ? err.message : "Unknown error")
    } finally {
      setLoading(false)
    }
  }, [location, gasType])

  useEffect(() => {
    fetchReading()

    // Set up auto-refresh every 2 minutes
    const interval = setInterval(fetchReading, 2 * 60 * 1000)

    return () => clearInterval(interval)
  }, [fetchReading])

  return { reading, loading, error, refresh: fetchReading }
}

export function useLocationStats(location: string, gasType: keyof typeof GAS_TYPES) {
  const [stats, setStats] = useState<AirQualityStats | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const fetchStats = useCallback(async () => {
    try {
      setLoading(true)
      setError(null)

      const data = await fetchLocationStats(location, gasType)
      setStats(data)
    } catch (err) {
      setError(err instanceof Error ? err.message : "Unknown error")
    } finally {
      setLoading(false)
    }
  }, [location, gasType])

  useEffect(() => {
    fetchStats()

    // Set up auto-refresh every 5 minutes
    const interval = setInterval(fetchStats, 5 * 60 * 1000)

    return () => clearInterval(interval)
  }, [fetchStats])

  return { stats, loading, error, refresh: fetchStats }
}

export function useHistoricalData(location: string, gasType: keyof typeof GAS_TYPES, startDate: Date, endDate: Date) {
  const [data, setData] = useState<AirQualityReading[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const fetchData = useCallback(async () => {
    try {
      setLoading(true)
      setError(null)

      const readings = await fetchHistoricalData(location, gasType, startDate, endDate)
      setData(readings)
    } catch (err) {
      setError(err instanceof Error ? err.message : "Unknown error")
    } finally {
      setLoading(false)
    }
  }, [location, gasType, startDate, endDate])

  useEffect(() => {
    fetchData()
  }, [fetchData])

  return { data, loading, error, refresh: fetchData }
}




export function useAIInsights(location: string, gasType: keyof typeof GAS_TYPES) {
  const [insights, setInsights] = useState<AIInsight[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const fetchInsights = useCallback(async () => {
    try {
      setLoading(true)
      setError(null)

      const data = await fetchAIInsights(location, gasType)
      setInsights(data)
    } catch (err) {
      setError(err instanceof Error ? err.message : "Unknown error")
    } finally {
      setLoading(false)
    }
  }, [location, gasType])

  useEffect(() => {
    fetchInsights()

    // Set up auto-refresh every 10 minutes
    const interval = setInterval(fetchInsights, 10 * 60 * 1000)

    return () => clearInterval(interval)
  }, [fetchInsights])

  return { insights, loading, error, refresh: fetchInsights }
}
