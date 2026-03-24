"use client";

import { useEffect } from "react";
import { MapContainer, TileLayer, Marker, useMap } from "react-leaflet";

interface FlightMapProps {
  lat?: number;
  lon?: number;
}

function MapUpdater({ lat, lon, isActive }: { lat: number; lon: number; isActive: boolean }) {
  const map = useMap();
  useEffect(() => {
    map.flyTo([lat, lon], isActive ? 7 : 4, { duration: 1.5 });
  }, [lat, lon, isActive, map]);
  return null;
}

export default function FlightMap({ lat, lon }: FlightMapProps) {
  useEffect(() => {
    const link = document.createElement("link");
    link.rel = "stylesheet";
    link.href = "https://unpkg.com/leaflet@1.9.4/dist/leaflet.css";
    document.head.appendChild(link);
    return () => {
      document.head.removeChild(link);
    };
  }, []);

  const isActive = lat !== undefined && lon !== undefined && (lat !== 0 || lon !== 0);
  const centerLat = isActive ? lat : 50.1109; // Default Frankfurt region
  const centerLon = isActive ? lon : 8.6821;

  return (
    <MapContainer
      center={[centerLat, centerLon]}
      zoom={isActive ? 7 : 4}
      className="h-full w-full z-0"
      scrollWheelZoom={true}
    >
      <TileLayer
        attribution='&copy; <a href="https://carto.com/">CARTO</a>'
        url="https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png"
      />
      {isActive && <Marker position={[lat, lon]} />}
      <MapUpdater lat={centerLat} lon={centerLon} isActive={isActive} />
    </MapContainer>
  );
}
