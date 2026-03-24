"use client";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import SASCard from "@/components/ui/SASCard";
import { getUserStats, getCountryLeaderboard } from "@/lib/botApi";
import type { UserCountry } from "@/lib/types";
import { Globe, Trophy, Plane, MapPin } from "lucide-react";

export default function CountryLeaderboard({ userId, isDemo }: { userId: string; isDemo?: boolean }) {
  const [userStats, setUserStats] = useState<{
    miles: { total_miles: number; total_flights: number };
    countries: UserCountry[];
  } | null>(null);
  const [leaderboard, setLeaderboard] = useState<
    { user_name: string; total_miles: number; countries_count: number }[]
  >([]);
  const [fetchError, setFetchError] = useState<string | null>(null);

  useEffect(() => {
    if (isDemo) {
      setUserStats({
        miles: { total_miles: 84500, total_flights: 42 },
        countries: [
          { country_code: "DE", country_name: "Deutschland", unlocked_at: "" },
          { country_code: "US", country_name: "USA", unlocked_at: "" },
          { country_code: "JP", country_name: "Japan", unlocked_at: "" },
          { country_code: "GB", country_name: "Großbritannien", unlocked_at: "" },
        ]
      });
      setLeaderboard([
        { user_name: "ShiftbloomFan", total_miles: 125000, countries_count: 15 },
        { user_name: "DemoPassenger", total_miles: 84500, countries_count: 4 },
        { user_name: "FrequentFlyer", total_miles: 52000, countries_count: 8 },
        { user_name: "TwitchLurker", total_miles: 34000, countries_count: 3 },
      ]);
      return;
    }

    (async () => {
      try {
        const [stats, board] = await Promise.all([getUserStats(userId), getCountryLeaderboard()]);
        setUserStats(stats as typeof userStats);
        setLeaderboard(board as typeof leaderboard);
        setFetchError(null);
      } catch (err) {
        setFetchError(err instanceof Error ? err.message : "Statistiken konnten nicht geladen werden");
      }
    })();
  }, [userId, isDemo]);

  return (
    <div className="space-y-6">
      {fetchError && (
        <SASCard variant="glass">
          <p className="text-center text-sm text-red-400">{fetchError}</p>
        </SASCard>
      )}
      {/* Stats */}
      {userStats && (
        <SASCard variant="glass">
          <h3 className="text-xs font-bold tracking-[0.15em] text-foreground/40 uppercase mb-5 text-center">Deine Statistiken</h3>
          <div className="grid grid-cols-3 gap-6">
            {[
              { icon: <Plane size={22} className="text-gold-400" />, value: userStats.miles.total_flights, label: "Flüge" },
              { icon: <MapPin size={22} className="text-aviation-blue" />, value: userStats.miles.total_miles.toLocaleString(), label: "Meilen" },
              { icon: <Globe size={22} className="text-mm-success" />, value: userStats.countries.length, label: "Länder" },
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
                  className="text-3xl font-extrabold text-foreground"
                >
                  {stat.value}
                </motion.p>
                <p className="text-[10px] text-foreground/40 mt-1 tracking-wider uppercase">{stat.label}</p>
              </motion.div>
            ))}
          </div>
        </SASCard>
      )}

      {/* Countries unlocked */}
      {userStats && userStats.countries.length > 0 && (
        <SASCard variant="glass">
          <h3 className="text-xs font-bold tracking-[0.15em] text-foreground/40 uppercase mb-4">Freigeschaltete Länder</h3>
          <div className="flex flex-wrap gap-2">
            {userStats.countries.map((country, i) => (
              <motion.div
                key={country.country_code}
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: i * 0.04, type: "spring", stiffness: 300 }}
                className="bg-gradient-to-r from-aviation-blue/10 to-aviation-blue/5 text-aviation-blue px-3 py-1.5 rounded-full text-xs font-medium flex items-center gap-1.5 border border-aviation-blue/15"
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
        <div className="px-5 py-3.5 border-b border-white/[0.06] flex items-center gap-2">
          <Trophy size={15} className="text-gold-400" />
          <span className="text-sm font-bold">Country Leaderboard</span>
        </div>

        <div className="divide-y divide-white/[0.04]">
          {leaderboard.map((entry, i) => (
            <motion.div
              key={entry.user_name}
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: i * 0.05 }}
              className="flex items-center justify-between px-5 py-3 hover:bg-white/[0.03] transition-colors"
            >
              <div className="flex items-center gap-3">
                <div className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-black ${
                  i === 0 ? "bg-gradient-to-br from-gold-400 to-gold-500 text-navy-950 shadow-md glow-gold" :
                  i === 1 ? "bg-gradient-to-br from-white/20 to-white/10 text-foreground" :
                  i === 2 ? "bg-gradient-to-br from-amber-600 to-amber-700 text-white" :
                  "bg-white/[0.06] text-foreground/50"
                }`}>
                  {i + 1}
                </div>
                <span className="text-sm font-semibold text-foreground/80">{entry.user_name}</span>
              </div>
              <div className="flex items-center gap-4 text-xs text-foreground/40">
                <span className="flex items-center gap-1"><Globe size={11} /> {entry.countries_count}</span>
                <span className="flex items-center gap-1"><MapPin size={11} /> {entry.total_miles.toLocaleString()}</span>
              </div>
            </motion.div>
          ))}
          {leaderboard.length === 0 && (
            <div className="px-5 py-12 text-center text-foreground/40 text-sm">Noch keine Daten</div>
          )}
        </div>
      </SASCard>
    </div>
  );
}
