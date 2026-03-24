"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import {
  ChevronRight,
  Globe,
  MapPin,
  Medal,
  Plane,
  RefreshCw,
  Trophy,
  Users,
} from "lucide-react";
import TextReveal from "@/components/effects/TextReveal";
import MotionSection from "@/components/layout/MotionSection";
import PageShell from "@/components/layout/PageShell";
import ResponsiveTabRail, { type TabRailItem } from "@/components/layout/ResponsiveTabRail";
import { getCountryLeaderboard, getMilesLeaderboard } from "@/lib/botApi";
import type { UserMiles } from "@/lib/types";
import { cn } from "@/lib/utils";
import type { CountryEntry } from "@/app/leaderboard/page";

interface Props {
  initialMilesBoard: UserMiles[];
  initialCountryBoard: CountryEntry[];
}

const TABS: TabRailItem<string>[] = [
  { id: "miles", label: "Miles", icon: <MapPin size={14} /> },
  { id: "countries", label: "Länder", icon: <Globe size={14} /> },
] as const;

function MedalBadge({ rank }: { rank: number }) {
  const palette =
    rank === 1
      ? "from-gold-300 via-gold-400 to-gold-500 text-navy-950"
      : rank === 2
        ? "from-sas-gray-600 via-sas-gray-700 to-sas-gray-800 text-navy-950"
        : rank === 3
          ? "from-[#8f5d34] via-[#ad7849] to-[#d6a16f] text-navy-950"
          : "from-sas-gray-200 via-sas-gray-300 to-sas-gray-400 text-foreground";

  return (
    <div
      className={`inline-flex h-10 w-10 items-center justify-center rounded-full bg-gradient-to-br ${palette} text-sm font-black shadow-[0_20px_40px_rgba(0,0,0,0.24)]`}
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
    if (!silent) {
      setLoading(true);
    }

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

  const totalMiles = useMemo(
    () => milesBoard.reduce((sum, entry) => sum + entry.total_miles, 0),
    [milesBoard],
  );
  const totalFlights = useMemo(
    () => milesBoard.reduce((sum, entry) => sum + entry.total_flights, 0),
    [milesBoard],
  );
  const topCountries = useMemo(
    () => Math.max(...countryBoard.map((entry) => entry.countries_count), 0),
    [countryBoard],
  );
  const featuredEntries = activeTab === "miles" ? milesBoard.slice(0, 3) : countryBoard.slice(0, 3);

  return (
    <PageShell tone="night">
      <div className="relative pb-24 pt-28 text-white sm:pt-32">
        <header className="page-frame">
          <div className="grid gap-12 lg:grid-cols-[minmax(0,1fr)_24rem] lg:items-end lg:gap-16">
            <div>
              <span className="eyebrow">Global Ranking Surface</span>
              <div className="mt-5">
                <TextReveal
                  text="LEADERBOARD"
                  as="h1"
                  className="display-heading text-glow-white"
                />
                <TextReveal
                  text="Aviation"
                  as="p"
                  className="display-heading display-accent mt-1 text-gold-300"
                  delay={0.1}
                />
              </div>
              <p className="mt-6 max-w-2xl text-sm leading-7 text-white/56 sm:text-base sm:leading-8">
                Alle Meilen, Länder und Vielreisenden bleiben identisch. Neu ist nur die Bühne: dunkler, präziser
                und klarer im Scan.
              </p>
            </div>

            <div className="surface-gold-accent px-7 py-7">
              <p className="mono-label !gap-2 !text-[0.62rem] !tracking-[0.2em] !text-sas-gray-500 before:hidden">
                Overview
              </p>
              <div className="mt-6 grid grid-cols-3 gap-5">
                <StatTile label="Piloten" value={milesBoard.length.toLocaleString("de-DE")} icon={<Users size={15} />} />
                <StatTile label="Meilen" value={formatCompact(totalMiles)} icon={<MapPin size={15} />} />
                <StatTile label="Flüge" value={totalFlights.toLocaleString("de-DE")} icon={<Plane size={15} />} />
              </div>
            </div>
          </div>
        </header>

        <main className="page-frame space-y-16">
          <MotionSection className="flex justify-center">
            <ResponsiveTabRail
              items={TABS}
              active={activeTab}
              onChange={setActiveTab}
              tone="dark"
              className="w-full max-w-md"
            />
          </MotionSection>

          <MotionSection className="grid gap-6 lg:grid-cols-3">
            {featuredEntries.map((entry, index) => {
              const isMiles = activeTab === "miles";

              return (
                <article key={`${entry.user_name}-${index}`} className="surface-gold-accent min-h-[18.5rem] px-7 py-7">
                  <div className="flex items-start justify-between gap-4">
                    <MedalBadge rank={index + 1} />
                    <span className="inline-flex items-center gap-2 text-[0.68rem] font-semibold uppercase tracking-[0.18em] text-white/52">
                      <Medal size={13} className="text-gold-300" />
                      Rank {index + 1}
                    </span>
                  </div>
                  <p className="mt-9 text-2xl font-black tracking-[-0.04em] text-foreground sm:text-3xl">
                    {entry.user_name}
                  </p>
                  <p className="mt-3 text-sm leading-7 text-white/54">
                    {isMiles
                      ? `${(entry as UserMiles).total_flights} Flüge`
                      : `${(entry as CountryEntry).total_miles.toLocaleString("de-DE")} Gesamtmeilen`}
                  </p>
                  <div className="mt-10 flex items-end justify-between gap-4">
                    <span className="text-4xl font-black tracking-[-0.06em] text-gold-300">
                      {isMiles
                        ? (entry as UserMiles).total_miles.toLocaleString("de-DE")
                        : (entry as CountryEntry).countries_count.toLocaleString("de-DE")}
                    </span>
                    <span className="text-[0.72rem] uppercase tracking-[0.18em] text-white/48">
                      {isMiles ? "Miles" : "Länder"}
                    </span>
                  </div>
                </article>
              );
            })}
          </MotionSection>

          <div className="grid gap-8 lg:grid-cols-[minmax(0,1fr)_22rem]">
            <MotionSection className="surface-glass overflow-hidden p-0" delay={0.04}>
              <div className="flex items-center justify-between border-b border-white/8 px-6 py-5 sm:px-8">
                <div className="flex items-center gap-3">
                  {activeTab === "miles" ? (
                    <Trophy size={16} className="text-gold-300" />
                  ) : (
                    <Globe size={16} className="text-sas-blue" />
                  )}
                  <h2 className="text-base font-black tracking-tight text-foreground sm:text-lg">
                    {activeTab === "miles" ? "Miles Ranking" : "Country Ranking"}
                  </h2>
                </div>
                <div className="flex items-center gap-3">
                  <span className="hidden text-[0.65rem] uppercase tracking-[0.18em] text-white/38 sm:block">
                    {lastUpdated.toLocaleTimeString("de-DE", { hour: "2-digit", minute: "2-digit" })} Uhr
                  </span>
                  <button
                    type="button"
                    onClick={() => refresh()}
                    disabled={loading}
                    className="inline-flex items-center gap-2 rounded-full border border-white/8 bg-white/6 px-3 py-2 text-[0.65rem] font-semibold uppercase tracking-[0.18em] text-white/72 transition hover:text-foreground disabled:opacity-50"
                  >
                    <RefreshCw size={12} className={loading ? "animate-spin" : ""} />
                    Refresh
                  </button>
                </div>
              </div>

              <AnimatePresence mode="wait">
                <motion.div
                  key={activeTab}
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -8 }}
                  transition={{ duration: 0.28, ease: [0.22, 1, 0.36, 1] }}
                  className="divide-y divide-white/6"
                >
                  {activeTab === "miles"
                    ? milesBoard.map((entry, index) => (
                        <Row
                          key={entry.user_name}
                          rank={index + 1}
                          name={entry.user_name}
                          sublabel={`${entry.total_flights} Flüge`}
                          value={entry.total_miles.toLocaleString("de-DE")}
                          suffix="mi"
                          icon={<MapPin size={14} className="text-gold-300" />}
                        />
                      ))
                    : countryBoard.map((entry, index) => (
                        <Row
                          key={entry.user_name}
                          rank={index + 1}
                          name={entry.user_name}
                          sublabel={`${entry.total_miles.toLocaleString("de-DE")} Meilen gesamt`}
                          value={entry.countries_count.toLocaleString("de-DE")}
                          suffix={entry.countries_count === 1 ? "Land" : "Länder"}
                          icon={<Globe size={14} className="text-sas-blue" />}
                        />
                      ))}
                  {(activeTab === "miles" ? milesBoard.length : countryBoard.length) === 0 ? (
                    <div className="px-6 py-14 text-center text-sm text-white/42">Noch keine Daten verfügbar.</div>
                  ) : null}
                </motion.div>
              </AnimatePresence>
            </MotionSection>

            <div className="space-y-8">
              <MotionSection className="surface-glass px-6 py-7 sm:px-7" delay={0.08}>
                <span className="eyebrow">Signal Notes</span>
                <div className="mt-6 space-y-4">
                  <InfoRow label="Top Explorer" value={countryBoard[0]?.user_name ?? "—"} />
                  <InfoRow label="Rekord-Länder" value={String(topCountries || "—")} />
                  <InfoRow label="Gesamt-Meilen" value={formatCompact(totalMiles)} />
                </div>
              </MotionSection>

              <MotionSection className="surface-glass px-6 py-7 sm:px-7" delay={0.12}>
                <span className="eyebrow">Quick Commands</span>
                <div className="mt-6 space-y-4">
                  {[
                    "&joinflight",
                    "&miles",
                    "&countries",
                    "&topmiles",
                  ].map((command) => (
                    <div
                      key={command}
                      className="flex items-center justify-between border-b border-white/8 pb-3 last:border-b-0 last:pb-0"
                    >
                      <code className="text-sm font-semibold text-foreground">{command}</code>
                      <a
                        href="/commands"
                        className="inline-flex items-center gap-1 text-[0.65rem] font-semibold uppercase tracking-[0.18em] text-gold-300 transition-colors hover:text-foreground"
                      >
                        Atlas
                        <ChevronRight size={12} />
                      </a>
                    </div>
                  ))}
                </div>
              </MotionSection>
            </div>
          </div>
        </main>
      </div>
    </PageShell>
  );
}

function StatTile({
  label,
  value,
  icon,
}: {
  label: string;
  value: string;
  icon: React.ReactNode;
}) {
  return (
    <div className="rounded-[1.25rem] border border-white/8 bg-white/4 px-4 py-4">
      <span className="inline-flex text-gold-300">{icon}</span>
      <p className="mt-3 text-2xl font-black tracking-[-0.05em] text-foreground">{value}</p>
      <p className="mt-1 text-[0.62rem] uppercase tracking-[0.18em] text-white/42">{label}</p>
    </div>
  );
}

function Row({
  rank,
  name,
  sublabel,
  value,
  suffix,
  icon,
}: {
  rank: number;
  name: string;
  sublabel: string;
  value: string;
  suffix: string;
  icon: React.ReactNode;
}) {
  return (
    <motion.div
      initial={{ opacity: 0, x: -10 }}
      animate={{ opacity: 1, x: 0 }}
      className={cn(
        "flex items-center justify-between gap-4 px-5 py-4 transition-colors hover:bg-white/[0.03] sm:px-7",
        rank === 1 && "bg-gradient-to-r from-gold-400/10 via-transparent to-transparent",
      )}
    >
      <div className="flex min-w-0 items-center gap-4">
        <MedalBadge rank={Math.min(rank, 3)} />
        <div className="min-w-0">
          <p className="truncate text-sm font-semibold text-foreground sm:text-base">{name}</p>
          <p className="text-[0.72rem] text-white/42 sm:text-xs">{sublabel}</p>
        </div>
      </div>
      <div className="flex shrink-0 items-center gap-2">
        {icon}
        <span className="text-sm font-black text-foreground sm:text-base">{value}</span>
        <span className="hidden text-[0.65rem] uppercase tracking-[0.18em] text-white/36 sm:block">{suffix}</span>
      </div>
    </motion.div>
  );
}

function InfoRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-center justify-between gap-4 border-b border-white/8 pb-3 last:border-b-0 last:pb-0">
      <span className="text-sm text-white/44">{label}</span>
      <span className="text-sm font-semibold text-foreground">{value}</span>
    </div>
  );
}

function formatCompact(value: number) {
  if (value >= 1_000_000) {
    return `${(value / 1_000_000).toFixed(1)}M`;
  }

  if (value >= 1_000) {
    return `${(value / 1_000).toFixed(0)}k`;
  }

  return value.toLocaleString("de-DE");
}
