"use client";

import { useState, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import Image from "next/image";
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
import Navigation from "@/components/layout/Navigation";
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

const MEDAL_COLORS = [
  "bg-gradient-to-br from-gold-400 to-gold-500 text-navy-950 shadow-[0_0_20px_rgba(200,169,110,0.3)]",
  "bg-gradient-to-br from-white/30 to-white/15 text-white shadow-[0_0_16px_rgba(255,255,255,0.1)]",
  "bg-gradient-to-br from-amber-700 to-amber-800 text-white shadow-[0_0_16px_rgba(180,120,50,0.2)]",
];

const TABS: TabRailItem<string>[] = [
  { id: "miles", label: "Miles", icon: <MapPin size={14} /> },
  { id: "countries", label: "Länder", icon: <Globe size={14} /> },
];

function RankBadge({ rank }: { rank: number }) {
  const style =
    rank <= 3 ? MEDAL_COLORS[rank - 1] : "bg-white/[0.06] text-foreground/40";
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

  useEffect(() => {
    const id = setInterval(() => refresh(true), 60_000);
    return () => clearInterval(id);
  }, [refresh]);

  const totalMiles = milesBoard.reduce((s, e) => s + e.total_miles, 0);
  const totalFlights = milesBoard.reduce((s, e) => s + e.total_flights, 0);
  const topCountries = Math.max(...(countryBoard.map((e) => e.countries_count) ?? [0]), 0);

  return (
    <PageShell tone="night">
      <Navigation />
      <div className="relative flex flex-col min-h-[100dvh] pb-24 text-foreground">
        {/* Hero */}
        <header className="relative shrink-0 overflow-hidden pb-8 pt-20 sm:pb-12 sm:pt-24 lg:pb-16 lg:pt-28">
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_15%_30%,rgba(100,60,180,0.1),transparent_30%),radial-gradient(circle_at_85%_10%,rgba(74,144,217,0.08),transparent_25%)]" />

          <div className="page-frame relative">
            <motion.div
              initial={{ opacity: 0, y: 18 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.7 }}
            >
              <div className="flex items-center gap-3 mb-4 sm:mb-6">
                <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-white/10 overflow-hidden p-1">
                  <Image src="/logo.svg" alt="Miles & More Logo" width={36} height={36} className="w-full h-full object-contain" />
                </div>
                <p className="eyebrow">Global Rankings</p>
              </div>

              <div className="mt-2 sm:mt-4 lg:mt-6 grid gap-6 lg:gap-10 lg:grid-cols-[1.15fr_0.85fr] lg:items-end">
                <div>
                  <h1 className="max-w-3xl text-4xl font-extrabold tracking-[-0.04em] sm:text-5xl lg:text-6xl leading-tight">
                    Wer fliegt am<br />
                    <span className="display-accent text-gold-400">weitesten?</span>
                  </h1>
                  <p className="mt-4 sm:mt-5 max-w-2xl text-sm leading-7 sm:text-base sm:leading-8 text-foreground/50">
                    Sammle Meilen auf jedem Flug, erkunde neue Länder und kletter im globalen Ranking nach oben.
                    Die Bestenliste wird automatisch aktualisiert.
                  </p>
                </div>

                <div className="night-panel rounded-[2rem] p-5 sm:p-6 lg:p-8 lg:mb-36">
                  <p className="metric-kicker">Leaderboard Overview</p>
                  <div className="mt-4 sm:mt-5 grid grid-cols-3 gap-3 sm:gap-4">
                    {[
                      { label: "Piloten", value: milesBoard.length, icon: <Users size={14} className="text-gold-400" /> },
                      { label: "Meilen", value: totalMiles >= 1000 ? `${(totalMiles / 1000).toFixed(0)}k` : totalMiles, icon: <MapPin size={14} className="text-gold-400" /> },
                      { label: "Flüge", value: totalFlights, icon: <Plane size={14} className="text-gold-400" /> },
                    ].map((stat) => (
                      <div key={stat.label}>
                        <div className="flex items-center gap-1 mb-1">{stat.icon}<p className="text-[10px] text-foreground/30 uppercase tracking-wider">{stat.label}</p></div>
                        <p className="text-2xl sm:text-3xl lg:text-4xl font-extrabold tabular-nums">{stat.value || "—"}</p>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </motion.div>
          </div>
        </header>

        {/* Main */}
        <main className="page-frame relative z-10 pb-6 sm:pb-8">
          {/* Tab rail */}
          <MotionSection
            as="div"
            className="z-30 mb-4 sm:mb-6 lg:mb-8 rounded-[1.75rem] surface-glass p-2 sm:p-3 shrink-0 -mt-8 sm:-mt-10 lg:-mt-14 max-w-xs mx-auto w-full"
          >
            <ResponsiveTabRail
              items={TABS}
              active={activeTab}
              onChange={setActiveTab}
              tone="dark"
            />
          </MotionSection>

          <div className="relative px-1 pb-4 sm:pb-6 lg:pb-8 lg:px-4 space-y-6 sm:space-y-8 lg:space-y-10">
            {/* Leaderboard card */}
            <MotionSection className="surface-elevated rounded-[2rem] overflow-hidden" delay={0.06}>
              <div className="px-5 sm:px-7 lg:px-8 py-4 sm:py-5 flex items-center justify-between border-b border-white/[0.06]">
                <div className="flex items-center gap-2.5">
                  {activeTab === "miles" ? (
                    <TrendingUp size={18} className="text-gold-400" />
                  ) : (
                    <Globe size={18} className="text-aviation-blue" />
                  )}
                  <h2 className="text-base sm:text-lg font-extrabold tracking-tight">
                    {activeTab === "miles" ? "Miles Ranking" : "Country Ranking"}
                  </h2>
                </div>
                <div className="flex items-center gap-3">
                  <span className="text-[10px] text-foreground/30 hidden sm:block">
                    {lastUpdated.toLocaleTimeString("de-DE", { hour: "2-digit", minute: "2-digit" })} Uhr
                  </span>
                  <button
                    onClick={() => refresh()}
                    disabled={loading}
                    className="inline-flex items-center gap-1.5 rounded-full bg-white/[0.06] px-3 py-1.5 text-[10px] font-semibold uppercase tracking-wider text-foreground/40 hover:bg-white/[0.1] hover:text-foreground/60 transition disabled:opacity-50 cursor-pointer"
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
                  className="divide-y divide-white/[0.04]"
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
                          className={`flex items-center justify-between px-5 sm:px-7 lg:px-8 py-3 sm:py-4 hover:bg-white/[0.03] transition-colors ${i === 0 ? "bg-gradient-to-r from-gold-400/[0.06] to-transparent" : ""}`}
                        >
                          <div className="flex items-center gap-3 sm:gap-4 min-w-0">
                            <RankBadge rank={i + 1} />
                            <div className="min-w-0">
                              <p className="text-sm sm:text-base font-semibold truncate">{entry.user_name}</p>
                              <p className="text-[11px] text-foreground/30">{entry.total_flights} Flüge</p>
                            </div>
                          </div>
                          <div className="flex items-center gap-1.5 shrink-0">
                            <MapPin size={13} className="text-gold-400" />
                            <span className="text-sm sm:text-base font-extrabold tabular-nums">
                              {entry.total_miles.toLocaleString("de-DE")}
                            </span>
                            <span className="text-[11px] text-foreground/30 hidden sm:block">mi</span>
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
                          className={`flex items-center justify-between px-5 sm:px-7 lg:px-8 py-3 sm:py-4 hover:bg-white/[0.03] transition-colors ${i === 0 ? "bg-gradient-to-r from-gold-400/[0.06] to-transparent" : ""}`}
                        >
                          <div className="flex items-center gap-3 sm:gap-4 min-w-0">
                            <RankBadge rank={i + 1} />
                            <div className="min-w-0">
                              <p className="text-sm sm:text-base font-semibold truncate">{entry.user_name}</p>
                              <p className="text-[11px] text-foreground/30">{entry.total_miles.toLocaleString("de-DE")} Meilen gesamt</p>
                            </div>
                          </div>
                          <div className="flex items-center gap-1.5 shrink-0">
                            <Globe size={13} className="text-mm-success" />
                            <span className="text-sm sm:text-base font-extrabold tabular-nums">
                              {entry.countries_count}
                            </span>
                            <span className="text-[11px] text-foreground/30 hidden sm:block">
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

            {/* How to earn + stats */}
            <MotionSection className="grid gap-5 sm:gap-6 lg:gap-8 lg:grid-cols-[0.85fr_1.15fr]" delay={0.1}>
              <div className="night-panel rounded-[2rem] p-6 sm:p-8 lg:p-10">
                <p className="eyebrow">Wie es funktioniert</p>
                <h3 className="mt-5 sm:mt-6 text-2xl sm:text-3xl font-extrabold tracking-tight">
                  Meilen sammeln ist <span className="display-accent text-gold-400">einfach.</span>
                </h3>
                <p className="mt-3 sm:mt-4 text-sm sm:text-base leading-7 sm:leading-8 text-foreground/40">
                  Schreibe <code className="px-2 py-0.5 rounded-md bg-white/[0.06] text-gold-400 text-xs font-mono">&joinflight</code> im Chat wenn ein Flug startet.
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
                      <span className="text-[10px] font-black tracking-widest text-gold-400/40 shrink-0 w-6">{item.step}</span>
                      <span className="text-sm text-foreground/60">{item.text}</span>
                    </div>
                  ))}
                </div>
              </div>

              <div className="grid gap-3 sm:gap-4 sm:grid-cols-2">
                {[
                  {
                    icon: <Trophy size={18} className="text-gold-400" />,
                    bg: "bg-gold-400/10",
                    title: "Top Vielflieger",
                    value: milesBoard[0]?.user_name ?? "—",
                    sub: milesBoard[0] ? `${milesBoard[0].total_miles.toLocaleString("de-DE")} Meilen` : "Noch kein Ranking",
                  },
                  {
                    icon: <Globe size={18} className="text-mm-success" />,
                    bg: "bg-mm-success/10",
                    title: "Weltenbummler",
                    value: countryBoard[0]?.user_name ?? "—",
                    sub: countryBoard[0] ? `${countryBoard[0].countries_count} Länder erkundet` : "Noch kein Ranking",
                  },
                  {
                    icon: <Sparkles size={18} className="text-aviation-blue" />,
                    bg: "bg-aviation-blue/10",
                    title: "Gesamt-Meilen",
                    value: totalMiles >= 1_000_000
                      ? `${(totalMiles / 1_000_000).toFixed(1)}M`
                      : totalMiles >= 1_000
                      ? `${(totalMiles / 1_000).toFixed(0)}k`
                      : String(totalMiles || "—"),
                    sub: "über alle Passagiere",
                  },
                  {
                    icon: <Star size={18} className="text-gold-400" />,
                    bg: "bg-gold-400/10",
                    title: "Rekord-Länder",
                    value: topCountries > 0 ? String(topCountries) : "—",
                    sub: "in einer Saison",
                  },
                ].map((card) => (
                  <div key={card.title} className="surface-glass rounded-[1.6rem] p-5 sm:p-6">
                    <span className={`inline-flex rounded-full p-2.5 ${card.bg}`}>{card.icon}</span>
                    <p className="mt-3 text-[11px] font-semibold uppercase tracking-wider text-foreground/30">{card.title}</p>
                    <p className="mt-1 text-xl sm:text-2xl font-extrabold tracking-tight truncate">{card.value}</p>
                    <p className="mt-1 text-xs text-foreground/30">{card.sub}</p>
                  </div>
                ))}
              </div>
            </MotionSection>

            {/* Commands strip */}
            <MotionSection delay={0.12}>
              <GlowDivider className="mb-6 sm:mb-8" />
              <div className="grid gap-3 sm:gap-4 sm:grid-cols-3 pb-6">
                {[
                  {
                    icon: <Plane size={16} />,
                    cmd: "&joinflight",
                    desc: "Aktuellen Flug beitreten und Meilen sammeln.",
                    color: "text-aviation-blue",
                    bg: "bg-aviation-blue/10",
                  },
                  {
                    icon: <MapPin size={16} />,
                    cmd: "&miles",
                    desc: "Eigene Meilen, Flüge und Länder auf einen Blick.",
                    color: "text-gold-400",
                    bg: "bg-gold-400/10",
                  },
                  {
                    icon: <Trophy size={16} />,
                    cmd: "&topmiles",
                    desc: "Leaderboard der fleißigsten Vielflieger im Stream.",
                    color: "text-mm-success",
                    bg: "bg-mm-success/10",
                  },
                ].map((item) => (
                  <div key={item.cmd} className="surface-glass rounded-[1.6rem] p-5 sm:p-6 flex flex-col gap-3">
                    <span className={`inline-flex rounded-full p-2.5 ${item.bg} ${item.color}`}>{item.icon}</span>
                    <div>
                      <code className="block text-base sm:text-lg font-extrabold">{item.cmd}</code>
                      <p className="mt-1.5 text-sm leading-6 text-foreground/40">{item.desc}</p>
                    </div>
                    <a
                      href="/commands"
                      className="mt-auto inline-flex items-center gap-1 text-[11px] font-semibold uppercase tracking-wider text-gold-400/60 hover:text-gold-400 transition-colors"
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
    <div className="px-5 py-14 text-center text-foreground/30 text-sm">{message}</div>
  );
}
