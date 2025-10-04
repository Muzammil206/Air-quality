'use client'
import dynamic from "next/dynamic";

const AdminMap = dynamic(() => import("@/components/map-section"), { ssr: false });

export default function AdminMapPage() {
  return <Map />;
}

// The new version of the code uses the new map component name "map-section" instead of "allparcelMap".