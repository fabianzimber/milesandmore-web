"use client";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import type { Flight } from "@/lib/types";
import { Plane, MapPin } from "lucide-react";

const STATUS_CONFIG: Record<string, { label: string; gradient: string; dot: string }> = {
  boarding: { label: "BOARDING", gradient: "from-amber-500/10 via-amber-400/5 to-transparent", dot: "bg-amber-500" },
  in_flight: { label: "IN FLIGHT", gradient: "from-sas-blue/10 via-sas-blue/5 to-transparent", dot: "bg-sas-blue" },
  completed: { label: "LANDED", gradient: "from-green-500/10 via-green-400/5 to-transparent", dot: "bg-sas-green" },
  cancelled: { label: "CANCELLED", gradient: "from-red-500/10 via-red-400/5 to-transparent", dot: "bg-sas-red" },
  aborted: { label: "ABORTED", gradient: "from-red-500/10 via-red-400/5 to-transparent", dot: "bg-sas-red" },
};

function SplitFlapDigit({ value }: { value: string }) {
  return (
    <motion.span
      key={value}
      initial={{ rotateX: -90, opacity: 0 }}
      animate={{ rotateX: 0, opacity: 1 }}
      transition={{ duration: 0.3, ease: "easeOut" }}
      className="inline-block bg-sas-gray-900 text-white text-lg font-mono font-bold px-1.5 py-0.5 rounded mx-px shadow-inner"
      style={{ perspective: 200 }}
    >
      {value}
    </motion.span>
  );
}

function BoardingTimer({ endTime }: { endTime: number }) {
  const [remaining, setRemaining] = useState("00:00");

  useEffect(() => {
    const tick = () => {
      const diff = endTime - Date.now();
      if (diff <= 0) { setRemaining("00:00"); return; }
      const mins = Math.floor(diff / 60000);
      const secs = Math.floor((diff % 60000) / 1000);
      setRemaining(`${String(mins).padStart(2, "0")}:${String(secs).padStart(2, "0")}`);
    };
    tick();
    const interval = setInterval(tick, 1000);
    return () => clearInterval(interval);
  }, [endTime]);

  const digits = remaining.split("");

  return (
    <div className="flex items-center">
      {digits.map((d, i) => (
        d === ":" ? <span key={i} className="text-sas-gray-400 font-mono text-lg mx-0.5">:</span>
        : <SplitFlapDigit key={`${i}-${d}`} value={d} />
      ))}
    </div>
  );
}

export default function FlightStatusBar({ flight, importedFlightPlan }: { flight: Flight | null; importedFlightPlan?: Record<string, unknown> | null }) {
  if (!flight) {
    return (
      <div className="border-b border-sas-gray-200/60 py-3.5">
        <div className="page-frame-wide text-center text-sas-gray-400 text-sm">
          {importedFlightPlan
            ? "Flugplan importiert — Wechsle zum Boarding Tab"
            : "Kein aktiver Flug — Importiere einen SimBrief Flugplan"}
        </div>
      </div>
    );
  }

  const config = STATUS_CONFIG[flight.status] || STATUS_CONFIG.boarding;

  return (
    <motion.div
      initial={{ opacity: 0, height: 0 }}
      animate={{ opacity: 1, height: "auto" }}
      className={`border-b border-sas-gray-200/60 bg-gradient-to-r ${config.gradient}`}
    >
      <div className="page-frame-wide py-3">
        <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
          <div className="flex flex-wrap items-center gap-2 sm:gap-4">
            <div className="flex items-center gap-2">
              <span className="relative flex h-2.5 w-2.5">
                <span className={`absolute inset-0 rounded-full ${config.dot} animate-ping opacity-40`} />
                <span className={`relative inline-flex rounded-full h-2.5 w-2.5 ${config.dot}`} />
              </span>
              <span className="text-[11px] font-bold tracking-[0.15em] text-sas-gray-600">{config.label}</span>
            </div>

            <div className="flex items-center gap-2 text-sm">
              <Plane size={14} className="text-sas-blue" />
              <span className="font-bold text-sas-midnight">{flight.flight_number || `FL${flight.id}`}</span>
            </div>

            <div className="hidden sm:flex items-center gap-1.5 text-sm text-sas-gray-600">
              <MapPin size={12} />
              <span>{flight.dep_name || flight.icao_from}</span>
              <span className="text-sas-gray-300 mx-1">→</span>
              <span>{flight.arr_name || flight.icao_to}</span>
            </div>
          </div>

          {flight.status === "boarding" && flight.end_time > 0 && (
            <BoardingTimer endTime={flight.end_time} />
          )}

          {flight.status !== "boarding" && (
            <div className="flex items-center gap-2 text-[10px] text-sas-gray-400">
              <span>Board</span>
              <div className="w-6 h-px bg-sas-gray-200" />
              <span className={flight.status === "in_flight" ? "text-sas-midnight font-bold" : ""}>Flight</span>
              <div className="w-6 h-px bg-sas-gray-200" />
              <span className={flight.status === "completed" ? "text-sas-midnight font-bold" : ""}>Landed</span>
            </div>
          )}
        </div>
      </div>
    </motion.div>
  );
}
