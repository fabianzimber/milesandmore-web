"use client";

import { useState, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Trophy,
  Globe,
  MapPin,
  Plane,
  Sparkles,
  TrendingUp,
  Users,
  Star,
  ChevronRight,
  RefreshCw,
} from "lucide-react";
import PageShell from "@/components/layout/PageShell";
import MotionSection from "@/components/layout/MotionSection";
import GlowDivider from "@/components/layout/GlowDivider";
import ResponsiveTabRail, { type TabRailItem } from "@/components/layout/ResponsiveTabRail";
import { getMilesLeaderboard, getCountryLeaderboard } from "@/lib/botApi";
import type { UserMiles } from "@/lib/types";
import type { CountryEntry } from "@/app/leaderboard/page";

interface Props {
  initialMilesBoard: UserMiles[];
  initialCountryBoard: CountryEntry[];
}

const MEDAL_STYLES = [
  "bg-gradient-to-br from-yellow-400 to-amber-500 text-white shadow-md",
  "bg-gradient-to-br from-mm-gray-300 to-mm-gray-400 text-white",
  "bg-gradient-to-br from-amber-600 to-amber-700 text-white",
];

const TABS: TabRailItem<string>[] = [
  { id: "miles", label: "Miles", icon: <MapPin size={14} /> },
  { id: "countries", label: "Länder", icon: <Globe size={14} /> },
];

function RankBadge({ rank }: { rank: number }) {
  const style =
    rank <= 3 ? MEDAL_STYLES[rank - 1] : "bg-mm-gray-100 text-mm-gray-500";
  return (
    <div
      className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-black shrink-0 ${style}`}
    >
      {rank}
    </div>
  );
}

export default function LeaderboardPageClient({
  initialMilesBoard,
  initialCountryBoard,
}: Props) {
  const [activeTab, setActiveTab] = useState("miles");
  const [milesBoard, setMilesBoard] = useState(initialMilesBoard);
  const [countryBoard, setCountryBoard] = useState(initialCountryBoard);
  const [loading, setLoading] = useState(false);
  const [lastUpdated, setLastUpdated] = useState<Date>(new Date());

  const refresh = useCallback(async (silent = false) => {
    if (!silent) setLoading(true);
    try {
      const [miles, countries] = await Promise.all([
        getMilesLeaderboard() as Promise<UserMiles[]>,
        getCountryLeaderboard() as Promise<CountryEntry[]>,
      ]);
      setMilesBoard(miles);
      setCountryBoard(countries);
      setLastUpdated(new Date());
    } catch {
      // keep stale data on error
    } finally {
      setLoading(false);
    }
  }, []);

  // Poll every 60 seconds
  useEffect(() => {
    const id = setInterval(() => refresh(true), 60_000);
    return () => clearInterval(id);
  }, [refresh]);

  const totalMiles = milesBoard.reduce((s, e) => s + e.total_miles, 0);
  const totalFlights = milesBoard.reduce((s, e) => s + e.total_flights, 0);
  const topCountries = Math.max(...(countryBoard.map((e) => e.countries_count) ?? [0]), 0);

  return (
    <PageShell tone="night">
      <div className="relative flex flex-col min-h-[100dvh] pb-24 text-white">
        {/* ── Hero ── */}
        <header className="relative shrink-0 overflow-hidden pb-8 pt-6 sm:pb-12 sm:pt-8 lg:pb-16 lg:pt-12">
          <div className="absolute inset-0 bg-mesh-dark opacity-90" />
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_15%_30%,rgba(123,92,181,0.22),transparent_30%),radial-gradient(circle_at_85%_10%,rgba(99,65,163,0.18),transparent_25%)]" />

          <div className="page-frame relative">
            <motion.div
              initial={{ opacity: 0, y: 18 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.7 }}
            >
              <p className="eyebrow">Global Rankings</p>

              <div className="mt-4 sm:mt-6 lg:mt-8 grid gap-6 lg:gap-10 lg:grid-cols-[1.15fr_0.85fr] lg:items-end">
                <div>
                  <h1 className="max-w-3xl text-4xl font-black tracking-[-0.05em] text-glow-white sm:text-5xl lg:text-6xl leading-tight">
                    Wer fliegt am<br />
                    weitesten?
                  </h1>
                  <p className="mt-4 sm:mt-5 max-w-2xl text-sm leading-7 sm:text-base sm:leading-8 text-white/60">
                    Sammle Meilen auf jedem Flug, erkunde neue Länder und kletter im globalen Ranking nach oben.
                    Die Bestenliste wird automatisch aktualisiert.
                  </p>
                </div>

                {/* Stats overview panel */}
                <div className="night-panel rounded-[2rem] p-5 sm:p-6 lg:p-8 lg:mb-36">
                  <p className="metric-kicker !text-white/40">Leaderboard Overview</p>
                  <div className="mt-4 sm:mt-5 grid grid-cols-3 gap-3 sm:gap-4">
                    {[
                      { label: "Piloten", value: milesBoard.length, icon: <Users size={14} className="text-mm-purple-400" /> },
                      { label: "Meilen", value: totalMiles >= 1000 ? `${(totalMiles / 1000).toFixed(0)}k` : totalMiles, icon: <MapPin size={14} className="text-mm-purple-400" /> },
                      { label: "Flüge", value: totalFlights, icon: <Plane size={14} className="text-mm-purple-400" /> },
                    ].map((stat) => (
                      <div key={stat.label}>
                        <div className="flex items-center gap-1 mb-1">{stat.icon}<p className="text-[10px] text-white/40 uppercase tracking-wider">{stat.label}</p></div>
                        <p className="text-2xl sm:text-3xl lg:text-4xl font-black text-white tabular-nums">{stat.value || "—"}</p>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </motion.div>
          </div>
        </header>

        {/* ── Main content ── */}
        <main className="page-frame relative z-10 pb-6 sm:pb-8 text-sas-midnight">

          {/* Tab rail */}
          <MotionSection
            as="div"
            className="z-30 mb-4 sm:mb-6 lg:mb-8 rounded-[1.75rem] bg-white/10 p-2 sm:p-3 backdrop-blur-xl shrink-0 -mt-8 sm:-mt-10 lg:-mt-14 max-w-xs mx-auto w-full"
          >
            <ResponsiveTabRail
              items={TABS}
              active={activeTab}
              onChange={setActiveTab}
              tone="dark"
            />
          </MotionSection>

          <div className="relative px-1 pb-4 sm:pb-6 lg:pb-8 lg:px-4 space-y-6 sm:space-y-8 lg:space-y-10">

            {/* ── Leaderboard card ── */}
            <MotionSection className="control-panel rounded-[2rem] overflow-hidden" delay={0.06}>
              {/* Card header */}
              <div className="px-5 sm:px-7 lg:px-8 py-4 sm:py-5 flex items-center justify-between border-b border-sas-gray-200/80">
                <div className="flex items-center gap-2.5">
                  {activeTab === "miles" ? (
                    <TrendingUp size={18} className="text-sas-blue" />
                  ) : (
                    <Globe size={18} className="text-sas-blue" />
                  )}
                  <h2 className="text-base sm:text-lg font-black tracking-tight text-sas-midnight">
                    {activeTab === "miles" ? "Miles Ranking" : "Country Ranking"}
                  </h2>
                </div>
                <div className="flex items-center gap-3">
                  <span className="text-[10px] text-sas-gray-400 hidden sm:block">
                    {lastUpdated.toLocaleTimeString("de-DE", { hour: "2-digit", minute: "2-digit" })} Uhr
                  </span>
                  <button
                    onClick={() => refresh()}
                    disabled={loading}
                    className="inline-flex items-center gap-1.5 rounded-full bg-sas-gray-100 px-3 py-1.5 text-[10px] font-semibold uppercase tracking-wider text-sas-gray-500 hover:bg-sas-gray-200 transition disabled:opacity-50"
                  >
                    <RefreshCw size={11} className={loading ? "animate-spin" : ""} />
                    Refresh
                  </button>
                </div>
              </div>

              <AnimatePresence mode="wait">
                <motion.div
                  key={activeTab}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -8 }}
                  transition={{ duration: 0.25, ease: [0.22, 1, 0.36, 1] }}
                  className="divide-y divide-sas-gray-100/80"
                >
                  {activeTab === "miles" ? (
                    <>
                      {milesBoard.length === 0 && (
                        <EmptyState message="Noch keine Meilen gesammelt." />
                      )}
                      {milesBoard.map((entry, i) => (
                        <motion.div
                          key={entry.user_name}
                          initial={{ opacity: 0, x: -8 }}
                          animate={{ opacity: 1, x: 0 }}
                          transition={{ delay: i * 0.04 }}
                          className={`flex items-center justify-between px-5 sm:px-7 lg:px-8 py-3 sm:py-4 hover:bg-sas-gray-50/80 transition-colors ${i === 0 ? "bg-gradient-to-r from-amber-50/60 to-transparent" : ""}`}
                        >
                          <div className="flex items-center gap-3 sm:gap-4 min-w-0">
                            <RankBadge rank={i + 1} />
                            <div className="min-w-0">
                              <p className="text-sm sm:text-base font-semibold text-sas-gray-800 truncate">{entry.user_name}</p>
                              <p className="text-[11px] text-sas-gray-400">{entry.total_flights} Flüge</p>
                            </div>
                          </div>
                          <div className="flex items-center gap-1.5 shrink-0">
                            <MapPin size={13} className="text-sas-blue" />
                            <span className="text-sm sm:text-base font-black text-sas-midnight tabular-nums">
                              {entry.total_miles.toLocaleString("de-DE")}
                            </span>
                            <span className="text-[11px] text-sas-gray-400 hidden sm:block">mi</span>
                          </div>
                        </motion.div>
                      ))}
                    </>
                  ) : (
                    <>
                      {countryBoard.length === 0 && (
                        <EmptyState message="Noch keine Länder erkundet." />
                      )}
                      {countryBoard.map((entry, i) => (
                        <motion.div
                          key={entry.user_name}
                          initial={{ opacity: 0, x: -8 }}
                          animate={{ opacity: 1, x: 0 }}
                          transition={{ delay: i * 0.04 }}
                          className={`flex items-center justify-between px-5 sm:px-7 lg:px-8 py-3 sm:py-4 hover:bg-sas-gray-50/80 transition-colors ${i === 0 ? "bg-gradient-to-r from-amber-50/60 to-transparent" : ""}`}
                        >
                          <div className="flex items-center gap-3 sm:gap-4 min-w-0">
                            <RankBadge rank={i + 1} />
                            <div className="min-w-0">
                              <p className="text-sm sm:text-base font-semibold text-sas-gray-800 truncate">{entry.user_name}</p>
                              <p className="text-[11px] text-sas-gray-400">{entry.total_miles.toLocaleString("de-DE")} Meilen gesamt</p>
                            </div>
                          </div>
                          <div className="flex items-center gap-1.5 shrink-0">
                            <Globe size={13} className="text-sas-green" />
                            <span className="text-sm sm:text-base font-black text-sas-midnight tabular-nums">
                              {entry.countries_count}
                            </span>
                            <span className="text-[11px] text-sas-gray-400 hidden sm:block">
                              {entry.countries_count === 1 ? "Land" : "Länder"}
                            </span>
                          </div>
                        </motion.div>
                      ))}
                    </>
                  )}
                </motion.div>
              </AnimatePresence>
            </MotionSection>

            {/* ── How to earn miles + top explorer teaser ── */}
            <MotionSection className="grid gap-5 sm:gap-6 lg:gap-8 lg:grid-cols-[0.85fr_1.15fr]" delay={0.1}>
              {/* Night panel: earn miles explainer */}
              <div className="night-panel rounded-[2rem] p-6 sm:p-8 lg:p-10 text-white">
                <p className="eyebrow">Wie es funktioniert</p>
                <h3 className="mt-5 sm:mt-6 text-2xl sm:text-3xl font-black tracking-tight text-white">
                  Meilen sammeln ist einfach.
                </h3>
                <p className="mt-3 sm:mt-4 text-sm sm:text-base leading-7 sm:leading-8 text-white/58">
                  Schreibe <code className="px-2 py-0.5 rounded-md bg-white/10 text-white/90 text-xs font-mono">&joinflight</code> im Chat wenn ein Flug startet.
                  Jede Flugmeile landet automatisch auf deinem Konto — kein Setup nötig.
                </p>
                <div className="mt-6 sm:mt-8 space-y-3">
                  {[
                    { step: "01", text: "Flug startet im Stream" },
                    { step: "02", text: "&joinflight im Chat tippen" },
                    { step: "03", text: "Meilen werden gutgeschrieben" },
                    { step: "04", text: "Länder werden freigeschaltet" },
                  ].map((item) => (
                    <div key={item.step} className="flex items-center gap-3">
                      <span className="text-[10px] font-black tracking-widest text-mm-purple-400 shrink-0 w-6">{item.step}</span>
                      <span className="text-sm text-white/70">{item.text}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Grid: top stats cards */}
              <div className="grid gap-3 sm:gap-4 sm:grid-cols-2">
                {[
                  {
                    icon: <Trophy size={18} className="text-amber-500" />,
                    bg: "bg-amber-50",
                    title: "Top Vielflieger",
                    value: milesBoard[0]?.user_name ?? "—",
                    sub: milesBoard[0] ? `${milesBoard[0].total_miles.toLocaleString("de-DE")} Meilen` : "Noch kein Ranking",
                  },
                  {
                    icon: <Globe size={18} className="text-emerald-600" />,
                    bg: "bg-emerald-50",
                    title: "Weltenbummler",
                    value: countryBoard[0]?.user_name ?? "—",
                    sub: countryBoard[0] ? `${countryBoard[0].countries_count} Länder erkundet` : "Noch kein Ranking",
                  },
                  {
                    icon: <Sparkles size={18} className="text-sas-blue" />,
                    bg: "bg-sas-blue/6",
                    title: "Gesamt-Meilen",
                    value: totalMiles >= 1_000_000
                      ? `${(totalMiles / 1_000_000).toFixed(1)}M`
                      : totalMiles >= 1_000
                      ? `${(totalMiles / 1_000).toFixed(0)}k`
                      : String(totalMiles || "—"),
                    sub: "über alle Passagiere",
                  },
                  {
                    icon: <Star size={18} className="text-mm-purple-500" />,
                    bg: "bg-mm-purple-50",
                    title: "Rekord-Länder",
                    value: topCountries > 0 ? String(topCountries) : "—",
                    sub: "in einer Saison",
                  },
                ].map((card) => (
                  <div key={card.title} className="control-panel rounded-[1.6rem] p-5 sm:p-6">
                    <span className={`inline-flex rounded-full p-2.5 ${card.bg}`}>{card.icon}</span>
                    <p className="mt-3 text-[11px] font-semibold uppercase tracking-wider text-sas-gray-400">{card.title}</p>
                    <p className="mt-1 text-xl sm:text-2xl font-black tracking-tight text-sas-midnight truncate">{card.value}</p>
                    <p className="mt-1 text-xs text-sas-gray-400">{card.sub}</p>
                  </div>
                ))}
              </div>
            </MotionSection>

            {/* ── Commands strip ── */}
            <MotionSection delay={0.12}>
              <GlowDivider className="mb-6 sm:mb-8" />
              <div className="grid gap-3 sm:gap-4 sm:grid-cols-3 pb-6">
                {[
                  {
                    icon: <Plane size={16} />,
                    cmd: "&joinflight",
                    desc: "Aktuellen Flug beitreten und Meilen sammeln.",
                    color: "text-sas-blue",
                    bg: "bg-sas-blue/8",
                  },
                  {
                    icon: <MapPin size={16} />,
                    cmd: "&miles",
                    desc: "Eigene Meilen, Flüge und Länder auf einen Blick.",
                    color: "text-sas-gold",
                    bg: "bg-sas-gold/8",
                  },
                  {
                    icon: <Trophy size={16} />,
                    cmd: "&topmiles",
                    desc: "Leaderboard der fleißigsten Vielflieger im Stream.",
                    color: "text-sas-green",
                    bg: "bg-sas-green/8",
                  },
                ].map((item) => (
                  <div key={item.cmd} className="control-panel rounded-[1.6rem] p-5 sm:p-6 flex flex-col gap-3">
                    <span className={`inline-flex rounded-full p-2.5 ${item.bg} ${item.color}`}>{item.icon}</span>
                    <div>
                      <code className="block text-base sm:text-lg font-black text-sas-midnight">{item.cmd}</code>
                      <p className="mt-1.5 text-sm leading-6 text-sas-gray-500">{item.desc}</p>
                    </div>
                    <a
                      href="/commands"
                      className="mt-auto inline-flex items-center gap-1 text-[11px] font-semibold uppercase tracking-wider text-sas-blue hover:text-sas-midnight transition-colors"
                    >
                      Alle Commands <ChevronRight size={12} />
                    </a>
                  </div>
                ))}
              </div>
            </MotionSection>
          </div>
        </main>
      </div>
    </PageShell>
  );
}

function EmptyState({ message }: { message: string }) {
  return (
    <div className="px-5 py-14 text-center text-sas-gray-400 text-sm">{message}</div>
  );
}
