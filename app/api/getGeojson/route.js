// app/api/parcels/route.js
import { NextResponse } from "next/server"
import { supabase } from "@/lib/supabaseClient";


export async function GET(req) {
  const { searchParams } = new URL(req.url);
  const parcelId = searchParams.get("id");

  let query = supabase
    .from("all_data")
    .select("id, geom, location, co2_ppm, co_ppm, hcho_mgm3, pm25_ugm3, pm10_ugm3, water_vapour, temperature_c, humidity_percent, STATE");

  if (parcelId) {
    query = query.eq("id", parcelId);
  }

  const { data, error } = await query;
  if (error) return NextResponse.json({ error }, { status: 500 });

  // Convert to GeoJSON
  const geojson = {
    type: "FeatureCollection",
    features: data.map((row) => ({
      type: "Feature",
      geometry: row.geom,
      properties: { id: row.id, location: row.location, co2_ppm: row.co2_ppm, co_ppm: row.co_ppm, hcho_mgm3: row.hcho_mgm3, pm25_ugm3: row.pm25_ugm3, pm10_ugm3: row.pm10_ugm3, water_vapour: row.water_vapour, temperature_c: row.temperature_c, humidity_percent: row.humidity_percent, state: row.STATE },
    })),
  };

  return NextResponse.json(geojson);
}
