"use client";

import { useState, useRef, useEffect } from "react";
import { motion } from "framer-motion";
import type { BoardingPassData } from "@/lib/types";
import { CalendarDays, DoorOpen, Plane, ScanLine, Ticket } from "lucide-react";

export default function BoardingPass({ data }: { data: BoardingPassData }) {
  const cardRef = useRef<HTMLDivElement>(null);
  const [tilt, setTilt] = useState({ x: 0, y: 0 });
  const [isFlipped, setIsFlipped] = useState(true);
  const [canTilt, setCanTilt] = useState(false);

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!cardRef.current || !canTilt) return;
    const rect = cardRef.current.getBoundingClientRect();
    const x = (e.clientX - rect.left) / rect.width - 0.5;
    const y = (e.clientY - rect.top) / rect.height - 0.5;
    setTilt({ x: y * -8, y: x * 8 });
  };

  const handleMouseLeave = () => setTilt({ x: 0, y: 0 });

  useEffect(() => {
    const timer = setTimeout(() => setIsFlipped(false), 400);
    const media = window.matchMedia("(pointer: fine)");
    const update = () => setCanTilt(media.matches);
    update();
    media.addEventListener("change", update);

    return () => {
      clearTimeout(timer);
      media.removeEventListener("change", update);
    };
  }, []);

  return (
    <div className="flex justify-center items-center min-h-full py-2 sm:py-4" style={{ perspective: 1200 }}>
      <motion.div
        ref={cardRef}
        onMouseMove={handleMouseMove}
        onMouseLeave={handleMouseLeave}
        initial={{ rotateY: 180, opacity: 0, scale: 0.9 }}
        animate={{
          rotateY: isFlipped ? 180 : 0,
          opacity: 1,
          scale: 1,
          rotateX: tilt.x,
        }}
        transition={{ duration: 0.9, ease: [0.16, 1, 0.3, 1] }}
        style={{
          transformStyle: "preserve-3d",
          transform: canTilt ? `perspective(1200px) rotateX(${tilt.x}deg) rotateY(${tilt.y}deg)` : undefined,
        }}
        className="relative w-full my-auto"
      >
        <div
          className="overflow-hidden rounded-[2rem] border border-white/8 bg-[linear-gradient(180deg,rgba(10,15,29,0.98),rgba(6,10,20,0.98))] shadow-[0_28px_90px_rgba(5,11,25,0.3)]"
          style={{ backfaceVisibility: "hidden" }}
        >
          <div className="h-1.5 holographic" />

          <div className="relative overflow-hidden bg-gradient-to-br from-navy-900 via-navy-800 to-[#102d63] px-5 py-4 text-white sm:px-7 sm:py-5">
            <div className="absolute inset-0 shimmer opacity-20" />
            <div className="relative z-10 flex flex-wrap items-center justify-between gap-4">
              <div className="flex items-center gap-3">
                <div className="flex h-11 w-11 items-center justify-center rounded-2xl border border-white/10 bg-white/6 backdrop-blur-md">
                  <Plane size={18} className="text-sas-gold" />
                </div>
                <div>
                  <span className="block text-xs font-bold tracking-[0.28em] text-white/88">SCANDINAVIAN</span>
                  <span className="block text-[10px] tracking-[0.24em] text-white/40">AIRLINES EXPERIENCE</span>
                </div>
              </div>
              <div className="rounded-full border border-sas-gold/22 bg-sas-gold/10 px-4 py-1.5 text-[10px] font-semibold tracking-[0.28em] text-sas-gold uppercase">
                Boarding Pass
              </div>
            </div>
          </div>

          <div className="grid gap-0 lg:grid-cols-[1.08fr_0.92fr]">
            <div className="px-5 pb-5 pt-4 sm:px-7 sm:pb-6 sm:pt-5">
              <Label>PASSENGER NAME</Label>
              <p className="mt-1 text-lg font-black tracking-[0.08em] text-sas-midnight sm:text-xl">{data.passenger_name}</p>

              <div className="mt-4 sm:mt-5 rounded-[1.8rem] bg-sas-gray-50 px-4 py-4">
                <div className="flex items-center justify-between gap-3">
                  <div>
                    <Label>FROM</Label>
                    <p className="mt-0.5 text-3xl font-black tracking-[-0.04em] text-sas-midnight sm:text-4xl">{data.dep_code}</p>
                    <p className="mt-1 max-w-28 text-[10px] text-sas-gray-500 sm:max-w-32 truncate">{data.departure}</p>
                  </div>

                  <div className="flex flex-1 items-center justify-center px-1">
                    <div className="flex w-full items-center gap-1">
                      <div className="h-px flex-1 bg-gradient-to-r from-sas-gray-200 to-sas-gray-300" />
                      <div className="h-px w-1 sm:w-2 bg-sas-gray-300" />
                      <div className="h-px w-1 sm:w-2 bg-transparent" />
                      <div className="h-px w-1 sm:w-2 bg-sas-gray-300" />
                      <motion.div animate={{ x: [0, 8, 0] }} transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }} className="mx-1">
                        <Plane size={14} className="rotate-90 text-sas-gold" />
                      </motion.div>
                      <div className="h-px w-1 sm:w-2 bg-sas-gray-300" />
                      <div className="h-px w-1 sm:w-2 bg-transparent" />
                      <div className="h-px w-1 sm:w-2 bg-sas-gray-300" />
                      <div className="h-px flex-1 bg-gradient-to-r from-sas-gray-300 to-sas-gray-200" />
                    </div>
                  </div>

                  <div className="text-right">
                    <Label>TO</Label>
                    <p className="mt-0.5 text-3xl font-black tracking-[-0.04em] text-sas-midnight sm:text-4xl">{data.arr_code}</p>
                    <p className="mt-1 max-w-28 text-[10px] text-sas-gray-500 sm:max-w-32 truncate">{data.arrival}</p>
                  </div>
                </div>
              </div>

              <div className="mt-4 sm:mt-5 grid gap-2 sm:grid-cols-2">
                <DetailCard icon={<Ticket size={14} />} label="FLIGHT" value={data.flight_number} />
                <DetailCard icon={<CalendarDays size={14} />} label="DATE" value={data.date} />
                <DetailCard icon={<DoorOpen size={14} />} label="GATE" value={data.gate} />
                <DetailCard icon={<ScanLine size={14} />} label="BOARDING" value={data.boarding_time} />
              </div>
            </div>

            <div className="flex flex-col border-t border-white/8 bg-[linear-gradient(180deg,rgba(11,16,32,0.92),rgba(8,12,24,0.98))] lg:border-l lg:border-t-0">
              <div className="flex-1 px-5 py-4 sm:px-7 sm:py-5">
                <Label>SEAT ASSIGNMENT</Label>
                <div className="mt-2 rounded-[1.8rem] bg-gradient-to-br from-navy-900 via-navy-800 to-sas-navy p-4 text-white">
                  <p className="text-xs font-semibold tracking-[0.24em] text-white/48 uppercase">Your Seat</p>
                  <p className="mt-1 sm:mt-2 text-4xl sm:text-5xl font-black leading-none text-glow-gold gold-shimmer">{data.seat}</p>
                  <div className="mt-3 sm:mt-4 flex items-end justify-between gap-3">
                    <div>
                      <p className="text-[9px] font-semibold tracking-[0.24em] text-white/42 uppercase">Class</p>
                      <p className="mt-0.5 text-xs font-semibold">Economy</p>
                    </div>
                    <div className="text-right">
                      <p className="text-[9px] font-semibold tracking-[0.24em] text-white/42 uppercase">Aircraft</p>
                      <p className="mt-0.5 text-xs font-semibold">{data.aircraft}</p>
                    </div>
                  </div>
                </div>

                <div className="mt-4 rounded-[1.5rem] border border-white/8 bg-white/4 p-3 sm:p-4">
                  <Label className="text-sas-gray-500">TRAVEL NOTES</Label>
                  <p className="mt-1 sm:mt-1.5 text-xs leading-5 sm:leading-6 text-sas-gray-500">
                    Tippe im Dashboard auf den Sitzplan, um den Platz zu wechseln. Auf Touch-Geräten bleibt die Karte
                    statisch und klar lesbar, auf Desktop reagiert sie mit subtiler Tiefe auf Pointer-Bewegungen.
                  </p>
                </div>
              </div>
              <div className="tear-line" />

              <div className="relative px-5 py-4 sm:px-7 sm:py-5">
                <div className="relative text-center">
                  <p
                    className="text-4xl leading-none text-sas-midnight sm:text-5xl lg:text-6xl"
                    style={{ fontFamily: "'Libre Barcode 128', cursive" }}
                  >
                    {data.flight_number}{data.seat}{data.passenger_name.slice(0, 8)}
                  </p>
                  <motion.div
                    className="absolute left-0 right-0 h-0.5 bg-gradient-to-r from-transparent via-sas-green to-transparent"
                    initial={{ top: 0, opacity: 0 }}
                    animate={{ top: "100%", opacity: [0, 1, 1, 0] }}
                    transition={{ duration: 2, delay: 1.3, ease: "linear" }}
                  />
                  <p className="mt-2 text-[9px] tracking-[0.3em] text-sas-gray-400">
                    {data.flight_number} &middot; {data.dep_code}&ndash;{data.arr_code} &middot; SEAT {data.seat}
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </motion.div>
    </div>
  );
}

function Label({ children, className = "" }: { children: React.ReactNode; className?: string }) {
  return (
    <p className={`text-[8px] sm:text-[9px] font-semibold tracking-[0.2em] text-sas-gray-400 uppercase ${className}`}>
      {children}
    </p>
  );
}

function DetailCard({
  icon,
  label,
  value,
}: {
  icon: React.ReactNode;
  label: string;
  value: string;
}) {
  return (
    <div className="rounded-[1.2rem] border border-white/8 bg-white/4 px-3 py-3 shadow-[0_16px_34px_rgba(5,11,25,0.12)]">
      <div className="flex items-center gap-1.5 text-sas-blue">
        {icon}
        <Label>{label}</Label>
      </div>
      <p className="mt-1.5 text-xs sm:text-sm font-bold text-sas-midnight">{value}</p>
    </div>
  );
}
