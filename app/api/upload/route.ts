import { type NextRequest, NextResponse } from "next/server"
import Papa from 'papaparse'
import { cookies } from "next/headers"
import { supabase } from "@/lib/supabaseClient";

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData()
    const file = formData.get("file") as File
    const uploaderName = formData.get("uploaderName") as string

    if (!file) {
      return NextResponse.json({ error: "No file provided" }, { status: 400 })
    }

    if (!uploaderName) {
      return NextResponse.json({ error: "Uploader name is required" }, { status: 400 })
    }

    
    

    // Read file content
    const text = await file.text()

    // Parse CSV
    const parseResult = Papa.parse(text, {
      header: true,
      skipEmptyLines: true,
      dynamicTyping: true,
    })

    if (parseResult.errors.length > 0) {
      console.error("CSV parsing errors:", parseResult.errors)
      return NextResponse.json({ error: "Failed to parse CSV file", details: parseResult.errors }, { status: 400 })
    }

    const data = parseResult.data as any[]

    // Validate required columns
    const requiredColumns = ["latitude", "longitude"]
    const firstRow = data[0]
    const missingColumns = requiredColumns.filter((col) => !(col in firstRow))

    if (missingColumns.length > 0) {
      return NextResponse.json({ error: `Missing required columns: ${missingColumns.join(", ")}` }, { status: 400 })
    }

    const processedData = data.map((row) => ({
      location: row.location || uploaderName,
      longitude: Number.parseFloat(row.longitude),
      latitude: Number.parseFloat(row.latitude),
      co2_ppm: row.co2_ppm || row.CO2 || 0,
      co_ppm: row.co_ppm || row.CO || 0,
      hcho_mgm3: row.hcho_mgm3 || row.HCHO || 0,
      pm25_ugm3: row.pm25_ugm3 || row.PM2_5 || row.pm25 || 0,
      pm10_ugm3: row.pm10_ugm3 || row.PM10 || row.pm10 || 0,
      water_vapour: row.water_vapour || 0,
      temperature_c: row.temperature_c || row.temperature || 0,
      humidity_percent: row.humidity_percent || row.humidity || 0,
      source_file: row.source_file || row.source || file.name,
      STATE: row.STATE || row.state || "",
      uploader_name: uploaderName,
      
    }))

    const { data: insertedData, error } = await supabase.from("all_data").insert(processedData).select()

    if (error) {
      console.error("Supabase insert error:", error)
      return NextResponse.json(
        { error: "Failed to insert data into database", details: error.message },
        { status: 500 },
      )
    }

    return NextResponse.json({
      success: true,
      count: insertedData?.length || 0,
      message: "Data uploaded successfully thanks for contributing!",
    })
  } catch (error) {
    console.error("Upload error:", error)
    return NextResponse.json(
      { error: "Failed to process upload", details: error instanceof Error ? error.message : "Unknown error" },
      { status: 500 },
    )
  }
}
