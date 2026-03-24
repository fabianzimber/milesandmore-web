"use client";

import { useMemo } from "react";
import { motion } from "framer-motion";
import SASCard from "@/components/ui/SASCard";
import { formatAltitude, formatSpeed } from "@/lib/utils";
import type { Flight, PositionUpdate } from "@/lib/types";
import { Mountain, Gauge, Compass, Navigation, MapPin, Plane, Route } from "lucide-react";
import dynamic from "next/dynamic";

const FlightMap = dynamic(() => import("./FlightMap"), { ssr: false });

interface FlightTrackerProps {
  flight: Flight;
  position: PositionUpdate | null;
}

export default function FlightTracker({ flight, position }: FlightTrackerProps) {

  const currentPos = useMemo(() => {
    if (position && position.lat !== 0) return { lat: position.lat, lon: position.lon };
    if (flight.current_lat && flight.current_lat !== 0) return { lat: flight.current_lat, lon: flight.current_lon || 0 };
    return null;
  }, [position, flight.current_lat, flight.current_lon]);

  const currentData = position || {
    alt: flight.current_alt || 0, speed: flight.current_speed || 0,
    heading: flight.current_heading || 0, lat: 0, lon: 0,
  };

  const telemetry = [
    { icon: <Mountain size={13} />, label: "ALT", value: formatAltitude(currentData.alt), accent: "text-aviation-blue" },
    { icon: <Gauge size={13} />, label: "GS", value: formatSpeed(currentData.speed), accent: "text-gold-400" },
    { icon: <Compass size={13} />, label: "HDG", value: `${currentData.heading}°`, accent: "text-aviation-blue" },
    { icon: <Navigation size={13} />, label: "POS", value: `${(currentPos?.lat || 0).toFixed(1)}°`, accent: "text-mm-success" },
  ];

  return (
    <div className="space-y-5">
      <div className="night-panel relative overflow-hidden rounded-[2rem] border border-white/[0.08]">
        <div className="h-[42svh] min-h-[300px] bg-navy-950 sm:h-[420px] relative">
          <FlightMap lat={currentPos?.lat} lon={currentPos?.lon} />
          {!currentPos && (
            <div className="absolute inset-0 z-[1000] flex items-center justify-center bg-navy-950/60 backdrop-blur-[2px]">
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="text-center"
              >
                <motion.div animate={{ y: [0, -6, 0] }} transition={{ duration: 3, repeat: Infinity }}>
                  <MapPin size={44} className="mx-auto text-aviation-blue/40" />
                </motion.div>
                <p className="mt-3 text-sm font-medium text-foreground/70">Warte auf Positionsdaten...</p>
                <p className="mt-1 text-xs text-foreground/40">Verbinde SimLink um Live-Tracking zu aktivieren</p>
              </motion.div>
            </div>
          )}
        </div>

        {currentData.alt > 0 && (
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            className="absolute right-4 top-4 z-[1000] hidden min-w-56 rounded-[1.35rem] surface-glass px-4 py-3 md:block"
          >
            <div className="grid grid-cols-2 gap-3">
              {telemetry.map((item) => (
                <TelemetryItem key={item.label} icon={item.icon} label={item.label} value={item.value} accent={item.accent} />
              ))}
            </div>
          </motion.div>
        )}
      </div>

      {currentData.alt > 0 && (
        <SASCard variant="dark" className="md:hidden">
          <div className="grid grid-cols-2 gap-4">
            {telemetry.map((item) => (
              <TelemetryItem key={item.label} icon={item.icon} label={item.label} value={item.value} accent={item.accent} />
            ))}
          </div>
        </SASCard>
      )}

      <SASCard variant="glass">
        <div className="flex flex-col gap-6 lg:flex-row lg:items-center lg:justify-between">
          <div className="text-center min-w-20">
            <p className="text-3xl font-extrabold tracking-tight">{flight.icao_from}</p>
            <p className="text-[10px] text-foreground/30 mt-0.5 truncate">{flight.dep_name}</p>
          </div>

          <div className="flex-1 px-1 sm:px-6">
            <div className="relative h-2 rounded-full bg-white/[0.08] overflow-visible">
              <div className="absolute inset-y-0 left-0 rounded-full bg-gradient-to-r from-aviation-blue/20 via-aviation-blue/10 to-transparent" style={{ width: "50%" }} />
              <motion.div
                className="absolute top-1/2 -translate-y-1/2 z-10"
                animate={{ rotate: currentData.heading || 90 }}
                style={{ left: "50%" }}
              >
                <div className="flex h-8 w-8 -translate-x-1/2 items-center justify-center rounded-full bg-gradient-to-br from-navy-900 to-navy-950 shadow-lg shadow-navy-950/50 border border-white/[0.08]">
                  <Plane size={12} className="text-gold-400 rotate-90" />
                </div>
              </motion.div>
            </div>
            <div className="mt-4 flex flex-wrap items-center justify-center gap-4 text-[11px] font-medium tracking-[0.18em] text-foreground/30 uppercase">
              <span className="inline-flex items-center gap-1.5">
                <Route size={12} />
                {flight.distance_nm ? `${flight.distance_nm.toLocaleString()} NM` : "Route aktiv"}
              </span>
              {flight.aircraft_name && <span>{flight.aircraft_name}</span>}
            </div>
          </div>

          <div className="text-center min-w-20">
            <p className="text-3xl font-extrabold tracking-tight">{flight.icao_to}</p>
            <p className="text-[10px] text-foreground/30 mt-0.5 truncate">{flight.arr_name}</p>
          </div>
        </div>
      </SASCard>
    </div>
  );
}

function TelemetryItem({
  icon,
  label,
  value,
  accent,
}: {
  icon: React.ReactNode;
  label: string;
  value: string;
  accent: string;
}) {
  return (
    <div className="flex items-center gap-2">
      <span className={accent}>{icon}</span>
      <div>
        <p className="text-[8px] text-foreground/30 tracking-wider">{label}</p>
        <p className="text-xs font-bold font-mono">{value}</p>
      </div>
    </div>
  );
}
