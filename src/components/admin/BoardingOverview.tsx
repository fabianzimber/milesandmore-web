"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import SASCard from "@/components/ui/SASCard";
import { getParticipants } from "@/lib/botApi";
import type { Flight, Participant } from "@/lib/types";
import { Users, Armchair } from "lucide-react";

function getInitials(name: string) {
  return name.slice(0, 2).toUpperCase();
}

function getAvatarColor(name: string) {
  const colors = [
    "from-blue-400 to-blue-600", "from-purple-400 to-purple-600",
    "from-emerald-400 to-emerald-600", "from-amber-400 to-amber-600",
    "from-rose-400 to-rose-600", "from-cyan-400 to-cyan-600",
    "from-indigo-400 to-indigo-600", "from-teal-400 to-teal-600",
  ];
  let hash = 0;
  for (let i = 0; i < name.length; i++) hash = name.charCodeAt(i) + ((hash << 5) - hash);
  return colors[Math.abs(hash) % colors.length];
}

export default function BoardingOverview({ flight }: { flight: Flight }) {
  const [participants, setParticipants] = useState<Participant[]>([]);

  useEffect(() => {
    const fetch = async () => {
      try { setParticipants((await getParticipants(flight.id)) as Participant[]); } catch {}
    };
    fetch();
    const interval = setInterval(fetch, 5000);
    return () => clearInterval(interval);
  }, [flight.id]);

  const pct = Math.min(100, (participants.length / flight.aircraft_total_seats) * 100);

  return (
    <SASCard variant="glass" padding="none">
      {/* Header */}
      <div className="px-5 py-3.5 border-b border-white/20 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Users size={15} className="text-sas-blue" />
          <span className="text-sm font-semibold text-sas-midnight">Passagiere</span>
        </div>
        <div className="flex items-center gap-3 text-xs">
          <span className="font-bold text-sas-midnight">{participants.length}</span>
          <div className="w-24 h-2 bg-sas-gray-100 rounded-full overflow-hidden">
            <motion.div
              className="h-full rounded-full bg-gradient-to-r from-sas-blue via-sas-blue-light to-sas-cyan relative overflow-hidden"
              initial={{ width: 0 }}
              animate={{ width: `${pct}%` }}
              transition={{ duration: 0.6, ease: "easeOut" }}
            >
              <div className="absolute inset-0 shimmer" />
            </motion.div>
          </div>
          <span className="text-sas-gray-400">{flight.aircraft_total_seats}</span>
        </div>
      </div>

      {/* Passenger List */}
      <div className="max-h-64 overflow-y-auto sm:max-h-96">
        <AnimatePresence>
          {participants.map((p, i) => (
            <motion.div
              key={p.user_id}
              initial={{ opacity: 0, x: 30 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: i * 0.04, type: "spring", stiffness: 300, damping: 25 }}
              className="flex items-center justify-between px-5 py-2.5 border-b border-sas-gray-100/50 transition-colors hover:bg-white/4"
            >
              <div className="flex items-center gap-3">
                {/* Avatar */}
                <div className={`w-7 h-7 rounded-full bg-gradient-to-br ${getAvatarColor(p.user_name)} flex items-center justify-center shadow-sm`}>
                  <span className="text-[9px] font-bold text-white">{getInitials(p.user_name)}</span>
                </div>
                <span className="text-sm font-medium text-sas-gray-800 truncate max-w-[120px] sm:max-w-none">{p.user_name}</span>
              </div>

              {p.seat ? (
                <span className="rounded-md bg-gradient-to-r from-navy-800 to-sas-navy px-2.5 py-1 text-[11px] font-mono font-bold text-white shadow-sm">
                  {p.seat}
                </span>
              ) : (
                <span className="text-[11px] text-sas-gray-400 flex items-center gap-1">
                  <Armchair size={11} />
                  <span className="hidden sm:inline">Zuweisung...</span>
                </span>
              )}
            </motion.div>
          ))}
        </AnimatePresence>

        {participants.length === 0 && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="px-5 py-14 text-center"
          >
            <motion.div animate={{ y: [0, -5, 0] }} transition={{ duration: 3, repeat: Infinity }}>
              <Users size={36} className="mx-auto text-sas-gray-300" />
            </motion.div>
            <p className="text-sm text-sas-gray-400 mt-3">Warte auf Passagiere...</p>
          </motion.div>
        )}
      </div>
    </SASCard>
  );
}
