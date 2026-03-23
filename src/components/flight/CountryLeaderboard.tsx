"use client";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import SASCard from "@/components/ui/SASCard";
import { getUserStats, getCountryLeaderboard } from "@/lib/botApi";
import type { UserCountry } from "@/lib/types";
import { Globe, Trophy, Plane, MapPin } from "lucide-react";

export default function CountryLeaderboard({ userId }: { userId: string }) {
  const [userStats, setUserStats] = useState<{
    miles: { total_miles: number; total_flights: number };
    countries: UserCountry[];
  } | null>(null);
  const [leaderboard, setLeaderboard] = useState<
    { user_name: string; total_miles: number; countries_count: number }[]
  >([]);

  useEffect(() => {
    (async () => {
      try {
        const [stats, board] = await Promise.all([getUserStats(userId), getCountryLeaderboard()]);
        setUserStats(stats as typeof userStats);
        setLeaderboard(board as typeof leaderboard);
      } catch {}
    })();
  }, [userId]);

  return (
    <div className="space-y-6">
      {/* Stats */}
      {userStats && (
        <SASCard variant="glass">
          <h3 className="text-xs font-bold tracking-[0.15em] text-sas-gray-400 uppercase mb-5 text-center">Deine Statistiken</h3>
          <div className="grid grid-cols-3 gap-6">
            {[
              { icon: <Plane size={22} className="text-sas-gold" />, value: userStats.miles.total_flights, label: "Flüge" },
              { icon: <MapPin size={22} className="text-sas-blue" />, value: userStats.miles.total_miles.toLocaleString(), label: "Meilen" },
              { icon: <Globe size={22} className="text-sas-green" />, value: userStats.countries.length, label: "Länder" },
            ].map((stat, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 + i * 0.1 }}
                className="text-center"
              >
                <div className="flex justify-center mb-2">{stat.icon}</div>
                <motion.p
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{ delay: 0.3 + i * 0.1, type: "spring", stiffness: 200 }}
                  className="text-3xl font-black text-sas-midnight"
                >
                  {stat.value}
                </motion.p>
                <p className="text-[10px] text-sas-gray-400 mt-1 tracking-wider uppercase">{stat.label}</p>
              </motion.div>
            ))}
          </div>
        </SASCard>
      )}

      {/* Countries unlocked */}
      {userStats && userStats.countries.length > 0 && (
        <SASCard variant="glass">
          <h3 className="text-xs font-bold tracking-[0.15em] text-sas-gray-400 uppercase mb-4">Freigeschaltete Länder</h3>
          <div className="flex flex-wrap gap-2">
            {userStats.countries.map((country, i) => (
              <motion.div
                key={country.country_code}
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: i * 0.04, type: "spring", stiffness: 300 }}
                className="bg-gradient-to-r from-sas-blue/10 to-sas-cyan/10 text-sas-blue px-3 py-1.5 rounded-full text-xs font-medium flex items-center gap-1.5 border border-sas-blue/10"
              >
                <Globe size={11} />
                {country.country_name || country.country_code}
              </motion.div>
            ))}
          </div>
        </SASCard>
      )}

      {/* Leaderboard */}
      <SASCard variant="glass" padding="none">
        <div className="px-5 py-3.5 border-b border-white/20 flex items-center gap-2">
          <Trophy size={15} className="text-sas-gold" />
          <span className="text-sm font-bold text-sas-midnight">Country Leaderboard</span>
        </div>

        <div className="divide-y divide-sas-gray-100/50">
          {leaderboard.map((entry, i) => (
            <motion.div
              key={entry.user_name}
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: i * 0.05 }}
              className="flex items-center justify-between px-5 py-3 hover:bg-white/40 transition-colors"
            >
              <div className="flex items-center gap-3">
                <div className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-black ${
                  i === 0 ? "bg-gradient-to-br from-sas-gold to-sas-gold-dim text-white shadow-md glow-gold" :
                  i === 1 ? "bg-gradient-to-br from-sas-gray-300 to-sas-gray-400 text-white" :
                  i === 2 ? "bg-gradient-to-br from-amber-600 to-amber-700 text-white" :
                  "bg-sas-gray-100 text-sas-gray-500"
                }`}>
                  {i + 1}
                </div>
                <span className="text-sm font-semibold text-sas-gray-800">{entry.user_name}</span>
              </div>
              <div className="flex items-center gap-4 text-xs text-sas-gray-400">
                <span className="flex items-center gap-1"><Globe size={11} /> {entry.countries_count}</span>
                <span className="flex items-center gap-1"><MapPin size={11} /> {entry.total_miles.toLocaleString()}</span>
              </div>
            </motion.div>
          ))}
          {leaderboard.length === 0 && (
            <div className="px-5 py-12 text-center text-sas-gray-400 text-sm">Noch keine Daten</div>
          )}
        </div>
      </SASCard>
    </div>
  );
}
