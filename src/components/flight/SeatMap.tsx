"use client";

import { useState, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import SASCard from "@/components/ui/SASCard";
import SASButton from "@/components/ui/SASButton";
import { parseSeatConfig, getSeatLetters, formatSeatId, cn } from "@/lib/utils";
import type { Flight, Participant } from "@/lib/types";
import { Check, UserRound } from "lucide-react";

interface SeatMapProps {
  flight: Flight;
  participants: Participant[];
  currentUser: Participant;
  onSeatChange: (newSeat: string) => void;
}

export default function SeatMap({ flight, participants, currentUser, onSeatChange }: SeatMapProps) {
  const [selectedSeat, setSelectedSeat] = useState<string | null>(null);
  const [hoveredSeat, setHoveredSeat] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);

  const layout = useMemo(() => parseSeatConfig(flight.seat_config || "3-3"), [flight.seat_config]);
  const letters = useMemo(() => getSeatLetters(layout), [layout]);
  const seatsPerRow = letters.length;
  const totalRows = Math.ceil(flight.aircraft_total_seats / seatsPerRow);

  const occupancyMap = useMemo(() => {
    const map = new Map<string, Participant>();
    for (const p of participants) {
      if (p.seat) map.set(p.seat, p);
    }
    return map;
  }, [participants]);

  const handleSeatClick = (seatId: string) => {
    const occupant = occupancyMap.get(seatId);
    if (occupant?.user_id === currentUser.user_id) return;
    if (occupant) return;
    if (selectedSeat === seatId) {
      confirmSeatChange();
      return;
    }
    setSelectedSeat(seatId);
  };

  const aislePositions: number[] = [];
  let cumulative = 0;
  for (let i = 0; i < layout.length - 1; i++) {
    cumulative += layout[i];
    aislePositions.push(cumulative);
  }

  const occupiedCount = participants.filter(p => p.seat).length;

  const confirmSeatChange = async () => {
    if (!selectedSeat) return;
    setSaving(true);
    try {
      await onSeatChange(selectedSeat);
      setSelectedSeat(null);
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="space-y-5">
      <SASCard variant="glass" className="overflow-hidden">
        <div className="text-center mb-5">
          <h3 className="text-lg font-bold text-sas-midnight">{flight.aircraft_name || "Aircraft"}</h3>
          <p className="text-xs text-sas-gray-400 mt-1">Tippe auf einen freien Sitz und bestätige die Umbuchung direkt oben.</p>
        </div>

        <div className="mb-6 flex flex-wrap justify-center gap-3 text-xs">
          <LegendItem className="bg-gradient-to-b from-sas-gold to-sas-gold-dim" label="Dein Sitz" />
          <LegendItem className="bg-gradient-to-b from-sas-gray-300 to-sas-gray-400" label="Besetzt" />
          <LegendItem className="bg-gradient-to-b from-sas-blue/15 to-sas-blue/25 border border-sas-blue/20" label="Frei" />
          <LegendItem className="bg-gradient-to-b from-sas-cyan/60 to-sas-cyan/80 glow-cyan" label="Ausgewählt" />
        </div>

        <AnimatePresence>
          {selectedSeat && (
            <motion.div
              initial={{ opacity: 0, y: -16 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -12 }}
              className="sticky top-2 z-20 mb-4 px-2"
            >
              <div className="night-panel mx-auto flex max-w-sm flex-col gap-4 rounded-[1.75rem] px-4 py-4 text-white sm:max-w-lg sm:flex-row sm:items-center sm:justify-between">
                <div className="flex items-center gap-3">
                  <span className="inline-flex rounded-full bg-white/10 p-2 text-sas-cyan">
                    <UserRound size={16} />
                  </span>
                  <div>
                    <p className="text-xs uppercase tracking-[0.22em] text-white/42">Selected Seat</p>
                    <p className="text-lg font-black">{selectedSeat}</p>
                  </div>
                </div>
                <div className="flex gap-2">
                  <SASButton variant="ghost" onClick={() => setSelectedSeat(null)} className="!text-white/70 hover:!bg-white/8">
                    Verwerfen
                  </SASButton>
                  <SASButton variant="gold" onClick={confirmSeatChange} loading={saving}>
                    <Check size={15} />
                    Sitz übernehmen
                  </SASButton>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        <div className="relative mx-auto max-w-3xl overflow-x-auto pb-4">
          <div className="relative mx-auto w-max px-8 sm:px-12 pt-4">
            
            {/* Simple Implied Wings */}
            <div className="absolute top-[35%] left-0 right-0 flex justify-between pointer-events-none z-0 opacity-80">
              <div className="w-12 sm:w-16 h-32 sm:h-48 bg-gradient-to-r from-sas-gray-200 to-sas-gray-50 border border-sas-gray-300 rounded-bl-[4rem] rounded-tl-md shadow-sm" style={{ transform: "skewY(22deg) translateY(-10px)" }} />
              <div className="w-12 sm:w-16 h-32 sm:h-48 bg-gradient-to-l from-sas-gray-200 to-sas-gray-50 border border-sas-gray-300 rounded-br-[4rem] rounded-tr-md shadow-sm" style={{ transform: "skewY(-22deg) translateY(-10px)" }} />
            </div>

            <div className="relative mx-auto w-48 sm:w-56 z-10">
            <svg viewBox="0 0 200 90" className="w-full">
              <path d="M 20 90 Q 20 8, 100 0 Q 180 8, 180 90" fill="#eef0f4" stroke="#dde1e8" strokeWidth="1.5" />
              <line x1="60" y1="52" x2="140" y2="52" stroke="#dde1e8" strokeWidth="1" />
              <circle cx="78" cy="38" r="3.5" fill="#c0c7d4" />
              <circle cx="100" cy="33" r="3.5" fill="#c0c7d4" />
              <circle cx="122" cy="38" r="3.5" fill="#c0c7d4" />
              <rect x="70" y="58" width="24" height="14" rx="3" fill="#dde1e8" />
              <rect x="106" y="58" width="24" height="14" rx="3" fill="#dde1e8" />
              <text x="100" y="82" textAnchor="middle" className="fill-sas-gray-400 font-semibold" style={{ fontSize: 9 }}>COCKPIT</text>
            </svg>
            </div>

            <div className="relative z-10 mx-auto overflow-hidden rounded-[1.5rem] border border-white/8 bg-gradient-to-b from-sas-gray-50 to-sas-gray-100 shadow-sm">
              <div className="absolute left-0.5 top-0 bottom-0 flex w-1.5 flex-col items-center justify-start gap-3 pt-10">
              {Array.from({ length: Math.min(totalRows, 30) }, (_, i) => (
                <div key={`wl${i}`} className="w-1 h-2 rounded-full bg-sas-blue/10 border border-sas-blue/15" />
              ))}
            </div>
            <div className="absolute right-0.5 top-0 bottom-0 flex w-1.5 flex-col items-center justify-start gap-3 pt-10">
              {Array.from({ length: Math.min(totalRows, 30) }, (_, i) => (
                <div key={`wr${i}`} className="w-1 h-2 rounded-full bg-sas-blue/10 border border-sas-blue/15" />
              ))}
            </div>

            <div className="px-1.5 py-4 sm:px-2.5 sm:py-5">
              <div className="sticky top-0 z-10 mb-3 flex items-center justify-center gap-0 rounded-xl bg-[rgba(10,15,29,0.88)] py-2 backdrop-blur-sm">
                <div className="w-5 sm:w-6" />
                {letters.map((letter, i) => (
                  <div key={letter} className="flex items-center">
                    <div className="w-8 text-center text-[9px] font-bold text-sas-gray-400 sm:w-9 sm:text-[10px]">{letter}</div>
                    {aislePositions.includes(i + 1) && <div className="w-4 sm:w-6" />}
                  </div>
                ))}
              </div>

              <div className="flex justify-center mb-2">
                <span className="rounded bg-red-400/12 px-2 py-0.5 text-[8px] font-bold tracking-widest text-sas-red">EXIT</span>
              </div>

              {Array.from({ length: totalRows }, (_, rowIdx) => {
                const rowNum = rowIdx + 1;
                const isExitRow = rowNum === Math.ceil(totalRows / 2);

                return (
                  <div key={rowNum}>
                    {isExitRow && (
                      <div className="flex justify-center my-2">
                        <span className="rounded bg-red-400/12 px-2 py-0.5 text-[8px] font-bold tracking-widest text-sas-red">EXIT</span>
                      </div>
                    )}
                    <div className="flex items-center justify-center gap-0 mb-1">
                      <div className="w-5 text-right pr-1 text-[8px] font-semibold text-sas-gray-300 sm:w-6 sm:pr-1.5 sm:text-[9px]">{rowNum}</div>
                      {letters.map((letter, letterIdx) => {
                        const seatId = formatSeatId(rowNum, letter);
                        const occupant = occupancyMap.get(seatId);
                        const isOwn = occupant?.user_id === currentUser.user_id;
                        const isOccupied = !!occupant;
                        const isSelected = selectedSeat === seatId;
                        const isHovered = hoveredSeat === seatId;

                        return (
                          <div key={seatId} className="flex items-center">
                            <motion.button
                              whileHover={!isOccupied ? { scale: 1.12 } : {}}
                              whileTap={!isOccupied ? { scale: 0.92 } : {}}
                              onClick={() => handleSeatClick(seatId)}
                              onMouseEnter={() => setHoveredSeat(seatId)}
                              onMouseLeave={() => setHoveredSeat(null)}
                              className={cn(
                                "relative h-7 w-8 rounded-t-xl border text-[9px] font-bold transition-all duration-200 cursor-pointer sm:h-9 sm:w-11 sm:text-[10px]",
                                isOwn && "bg-gradient-to-b from-sas-gold to-sas-gold-dim text-white border-sas-gold glow-gold",
                                !isOwn && isOccupied && "bg-gradient-to-b from-sas-gray-200 to-sas-gray-300 text-sas-gray-500 border-sas-gray-300 cursor-not-allowed",
                                !isOccupied && !isSelected && "bg-gradient-to-b from-sas-gray-100 to-sas-blue/10 text-sas-blue border-sas-blue/20 hover:border-sas-cyan/50 hover:shadow-md hover:shadow-sas-cyan/20",
                                isSelected && "bg-gradient-to-b from-sas-cyan/70 to-sas-cyan text-white border-sas-cyan glow-cyan",
                              )}
                              disabled={isOccupied && !isOwn}
                            >
                              {isOwn ? "★" : seatId}

                              {/* Pulse ring on own seat */}
                              {isOwn && (
                                <motion.div
                                  className="absolute inset-0 rounded-t-xl border-2 border-sas-gold"
                                  animate={{ scale: [1, 1.4, 1.4], opacity: [0.6, 0, 0] }}
                                  transition={{ duration: 2, repeat: Infinity }}
                                />
                              )}

                              {/* Tooltip */}
                              <AnimatePresence>
                                {isHovered && (isOccupied || isSelected) && (
                                  <motion.div
                                    initial={{ opacity: 0, y: 4, scale: 0.9 }}
                                    animate={{ opacity: 1, y: 0, scale: 1 }}
                                    exit={{ opacity: 0, y: 4, scale: 0.9 }}
                                    className="absolute -top-9 left-1/2 z-20 -translate-x-1/2 whitespace-nowrap rounded-md bg-navy-800 px-2 py-1 text-[8px] text-white shadow-lg"
                                  >
                                    {isSelected ? "Nochmal klicken ✓" : isOwn ? "Dein Sitz" : occupant?.user_name}
                                    <div className="absolute left-1/2 top-full h-0 w-0 -translate-x-1/2 border-l-4 border-r-4 border-t-4 border-transparent border-t-navy-800" />
                                  </motion.div>
                                )}
                              </AnimatePresence>
                            </motion.button>
                            {aislePositions.includes(letterIdx + 1) && (
                              <div className="w-4 flex items-center justify-center sm:w-6">
                                {rowIdx % 4 === 0 && <div className="w-px h-4 bg-sas-gray-200" />}
                              </div>
                            )}
                          </div>
                        );
                      })}
                    </div>
                  </div>
                );
              })}
            </div>

            <div className="mx-auto w-24 z-10 relative">
              <svg viewBox="0 0 120 40" className="w-full">
                <path d="M 10 0 Q 10 35, 60 40 Q 110 35, 110 0" fill="#eef0f4" stroke="#dde1e8" strokeWidth="1.5" />
              </svg>
            </div>
          </div>
        </div>
      </div>

        <div className="mt-4 text-center">
          <div className="inline-flex items-center gap-3 rounded-full bg-sas-gray-50 px-4 py-2">
            <span className="text-xs font-semibold text-sas-midnight">{occupiedCount}</span>
            <div className="w-20 h-1.5 bg-sas-gray-200 rounded-full overflow-hidden">
              <motion.div
                className="h-full bg-gradient-to-r from-sas-blue to-sas-cyan rounded-full"
                initial={{ width: 0 }}
                animate={{ width: `${Math.min(100, (occupiedCount / flight.aircraft_total_seats) * 100)}%` }}
                transition={{ duration: 0.8, ease: "easeOut" }}
              />
            </div>
            <span className="text-xs text-sas-gray-400">{flight.aircraft_total_seats}</span>
          </div>
        </div>

      </SASCard>
    </div>
  );
}

function LegendItem({ className, label }: { className: string; label: string }) {
  return (
    <div className="flex items-center gap-1.5 rounded-full border border-white/8 bg-white/5 px-3 py-1.5">
      <div className={`w-5 h-4 rounded-t-md ${className}`} />
      <span className="text-sas-gray-500">{label}</span>
    </div>
  );
}
