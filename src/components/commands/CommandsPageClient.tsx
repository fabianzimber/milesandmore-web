"use client";

import { useDeferredValue, useMemo, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import {
  Armchair,
  ChevronRight,
  Clock,
  Compass,
  Info,
  MapPin,
  Plane,
  Shield,
  Sparkles,
  Terminal,
  Trophy,
} from "lucide-react";
import GlowDivider from "@/components/layout/GlowDivider";
import MotionSection from "@/components/layout/MotionSection";
import PageShell from "@/components/layout/PageShell";
import ResponsiveTabRail, { type TabRailItem } from "@/components/layout/ResponsiveTabRail";

interface Command {
  name: string;
  aliases?: string[];
  description: string;
  usage: string;
  permissionLevel: string;
  cooldown: { global: number; user: number; channel: number };
  category?: string;
}

const PERM_BADGES: Record<string, { label: string; bg: string }> = {
  Everyone: { label: "Alle", bg: "bg-emerald-500/10 text-emerald-600" },
  User: { label: "Alle", bg: "bg-emerald-500/10 text-emerald-600" },
  VIP: { label: "VIP", bg: "bg-blue-500/10 text-blue-600" },
  Moderator: { label: "Mod", bg: "bg-blue-500/10 text-blue-600" },
  Broadcaster: { label: "Streamer", bg: "bg-amber-500/10 text-amber-600" },
  Admin: { label: "Admin", bg: "bg-red-500/10 text-red-600" },
  Owner: { label: "Owner", bg: "bg-sas-gray-200 text-sas-gray-600" },
};

const CAT_CONFIG: Record<string, { icon: React.ReactNode; color: string; glow: string }> = {
  flight: { icon: <Plane size={14} />, color: "text-sas-blue", glow: "hover:border-sas-blue/30 hover:shadow-sas-blue/10" },
  stats: { icon: <Trophy size={14} />, color: "text-sas-gold", glow: "hover:border-sas-gold/30 hover:shadow-sas-gold/10" },
  info: { icon: <Info size={14} />, color: "text-sas-cyan", glow: "hover:border-sas-cyan/30 hover:shadow-sas-cyan/10" },
  admin: { icon: <Shield size={14} />, color: "text-sas-red", glow: "hover:border-sas-red/30 hover:shadow-sas-red/10" },
};

function categorize(command: Command): string {
  const flight = ["startflight", "joinflight", "endflight", "abortflight", "flights", "clearflights", "flight", "passengers", "seat"];
  const stats = ["miles", "countries", "leaderboard", "topmiles", "topcountries"];
  const admin = ["join", "uid", "mute", "unmute"];
  if (flight.includes(command.name)) return "flight";
  if (stats.includes(command.name)) return "stats";
  if (admin.includes(command.name)) return "admin";
  return "info";
}

export default function CommandsPageClient({ initialCommands }: { initialCommands: Command[] }) {
  const [filter, setFilter] = useState("all");
  const deferredFilter = useDeferredValue(filter);
  const commands = useMemo(
    () => initialCommands.map((command) => ({ ...command, category: categorize(command) })),
    [initialCommands],
  );
  const filtered = deferredFilter === "all" ? commands : commands.filter((command) => command.category === deferredFilter);

  const categories: TabRailItem<string>[] = [
    { id: "all", label: "Alle", icon: <Sparkles size={14} /> },
    { id: "flight", label: "Flug", icon: <Plane size={14} /> },
    { id: "stats", label: "Stats", icon: <Trophy size={14} /> },
    { id: "info", label: "Info", icon: <Info size={14} /> },
    { id: "admin", label: "Admin", icon: <Shield size={14} /> },
  ];

  return (
    <PageShell tone="night">
      <div className="relative flex flex-col min-h-[100dvh] pb-20 text-white">
        <header className="relative shrink-0 overflow-hidden pb-8 pt-6 sm:pb-12 sm:pt-8 lg:pb-14 lg:pt-10 ">
          <div className="absolute inset-0 bg-mesh-dark opacity-90" />
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_18%_20%,rgba(123,164,255,0.18),transparent_24%),radial-gradient(circle_at_88%_12%,rgba(202,169,109,0.15),transparent_18%)]" />
          <div className="page-frame relative">
            <motion.div initial={{ opacity: 0, y: 18 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.7 }}>
              <p className="eyebrow">Command Atlas</p>
              <div className="mt-4 sm:mt-6 lg:mt-8 grid gap-6 lg:gap-8 lg:grid-cols-[1.1fr_0.9fr] lg:items-end">
                <div>
                  <h1 className="max-w-3xl text-4xl font-black tracking-[-0.05em] text-glow-white sm:text-5xl lg:text-6xl">
                    Alle Miles & More-Commands in einer scanbaren Flight-Karte.
                  </h1>
                  <p className="mt-4 sm:mt-5 lg:mt-6 max-w-2xl text-sm leading-6 sm:text-base sm:leading-7 lg:text-lg lg:leading-8 text-white/60 line-clamp-2 sm:line-clamp-none">
                    Statt einer Command-Liste wie aus einem Adminpanel zeigt diese Seite, welche Aktionen im Chat
                    sofort Wirkung haben, wie oft sie begrenzt sind und für wen sie gedacht sind.
                  </p>
                </div>

                <div className="night-panel rounded-[2rem] p-5 sm:p-6 lg:p-8 lg:mb-40">
                  <p className="metric-kicker !text-white/40">Atlas Overview</p>
                  <div className="mt-4 sm:mt-5 lg:mt-6 grid grid-cols-2 gap-4">
                    <div>
                      <p className="text-sm text-white/46">Commands</p>
                      <p className="mt-1 sm:mt-2 lg:mt-3 text-3xl sm:text-4xl lg:text-5xl font-black text-white">{commands.length}</p>
                    </div>
                    <div>
                      <p className="text-sm text-white/46">Aktiver Filter</p>
                      <p className="mt-1 sm:mt-2 lg:mt-3 text-2xl sm:text-3xl lg:text-4xl font-black text-white">
                        {categories.find((category) => category.id === filter)?.label || "Alle"}
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </motion.div>
          </div>
        </header>

        <main className="page-frame relative z-10 flex-1 flex flex-col min-h-0 pb-6 sm:pb-8 lg:pb-10 text-sas-midnight">
          <MotionSection as="div" className="z-30 mb-4 sm:mb-6 lg:mb-8 rounded-[1.75rem] bg-white/10 p-2 sm:p-3 backdrop-blur-xl shrink-0 -mt-8 sm:-mt-10 lg:-mt-12 max-w-3xl mx-auto w-full">
            <ResponsiveTabRail items={categories} active={filter} onChange={setFilter} tone="dark" />
          </MotionSection>

          <div className="flex-1 min-h-0 relative px-1 pb-4 sm:pb-6 lg:pb-8 lg:px-4">
            <div className="space-y-6 sm:space-y-8 lg:space-y-10">
              <MotionSection className="control-panel rounded-[2rem] p-5 sm:p-7 lg:p-8" delay={0.06}>
                <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
                  <div>
                    <p className="metric-kicker">Current View</p>
                    <h2 className="mt-3 text-3xl sm:text-4xl lg:text-5xl font-black tracking-[-0.04em] text-sas-midnight">
                      {filtered.length} Commands im Fokus.
                    </h2>
                  </div>
                  <p className="max-w-xl text-sm sm:text-base leading-6 sm:leading-7 text-sas-gray-500">
                    Filtere nach Flug, Stats, Info oder Admin. Die Darstellung bleibt bewusst kompakt, damit Commands auf
                    Mobilgeräten sofort gelesen und im Stream-Kontext schnell erinnert werden können.
                  </p>
                </div>
                <GlowDivider className="my-6 sm:my-8 lg:my-10" />

                <AnimatePresence mode="wait">
                  <motion.div
                    key={deferredFilter}
                    initial={{ opacity: 0, y: 14 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -10 }}
                    transition={{ duration: 0.28, ease: [0.22, 1, 0.36, 1] }}
                    className="space-y-3 sm:space-y-4"
                  >
                    {filtered.map((command, index) => {
                      const perm = PERM_BADGES[command.permissionLevel] || PERM_BADGES.Everyone;
                      const category = CAT_CONFIG[command.category || "info"] || CAT_CONFIG.info;

                      return (
                        <motion.article
                          key={command.name}
                          initial={{ opacity: 0, y: 12 }}
                          animate={{ opacity: 1, y: 0 }}
                          transition={{ delay: index * 0.025, duration: 0.32 }}
                          className="rounded-[1.5rem] border border-sas-gray-200/80 bg-white/76 px-4 py-4 sm:px-5 sm:py-5 lg:px-6 lg:py-6 shadow-[0_18px_40px_rgba(5,11,25,0.06)] backdrop-blur-md transition hover:-translate-y-0.5 hover:border-sas-blue/24"
                        >
                          <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
                            <div className="min-w-0 flex-1">
                              <div className="flex flex-wrap items-center gap-2.5 sm:gap-3">
                                <span className={`inline-flex rounded-full border border-current/10 bg-current/6 p-2 sm:p-2.5 ${category.color}`}>
                                  {category.icon}
                                </span>
                                <span className="text-xs sm:text-sm font-semibold tracking-[0.22em] text-sas-gray-300">{String(index + 1).padStart(2, "0")}</span>
                                <code className="rounded-full bg-sas-midnight px-3 py-1 sm:px-4 sm:py-1.5 text-xs sm:text-sm font-semibold text-white shadow-[0_12px_26px_rgba(5,11,25,0.18)]">
                                  {command.usage}
                                </code>
                                {command.aliases && command.aliases.length > 0 && (
                                  <span className="text-xs sm:text-sm text-sas-gray-400">
                                    {command.aliases.slice(0, 3).map((alias) => `&${alias}`).join(" ")}
                                  </span>
                                )}
                              </div>

                              <p className="mt-4 max-w-3xl text-sm sm:text-base leading-7 sm:leading-8 text-sas-gray-500">{command.description}</p>
                            </div>

                            <div className="flex flex-wrap items-center gap-2 lg:justify-end">
                              <span className={`rounded-full px-3 py-1 sm:px-4 sm:py-1.5 text-[10px] sm:text-xs font-semibold uppercase tracking-[0.18em] ${perm.bg}`}>
                                {perm.label}
                              </span>
                              {command.cooldown.user > 0 && (
                                <span className="inline-flex items-center gap-1.5 rounded-full bg-sas-gray-100 px-3 py-1 sm:px-4 sm:py-1.5 text-[10px] sm:text-xs font-semibold uppercase tracking-[0.18em] text-sas-gray-500">
                                  <Clock size={12} className="w-3 h-3 sm:w-3.5 sm:h-3.5" /> {command.cooldown.user}s
                                </span>
                              )}
                              <span className="inline-flex items-center gap-1.5 rounded-full bg-sas-blue/8 px-3 py-1 sm:px-4 sm:py-1.5 text-[10px] sm:text-xs font-semibold uppercase tracking-[0.18em] text-sas-blue">
                                {command.category}
                                <ChevronRight size={12} className="w-3 h-3 sm:w-3.5 sm:h-3.5" />
                              </span>
                            </div>
                          </div>
                        </motion.article>
                      );
                    })}
                  </motion.div>
                </AnimatePresence>
              </MotionSection>

              <MotionSection className="grid gap-5 sm:gap-6 lg:gap-8 lg:grid-cols-[0.8fr_1.2fr]" delay={0.1}>
                <div className="night-panel rounded-[2rem] p-6 sm:p-8 lg:p-10 text-white">
                  <p className="eyebrow">Quickstart</p>
                  <h3 className="mt-5 sm:mt-6 lg:mt-8 text-2xl sm:text-3xl lg:text-4xl font-black tracking-tight text-white">Die vier schnellsten Einstiege.</h3>
                  <p className="mt-4 sm:mt-5 text-sm sm:text-base leading-7 sm:leading-8 text-white/58">
                    Für neue Zuschauer reicht meist einer dieser Commands, um in die Experience einzusteigen oder eigene
                    Daten abzurufen.
                  </p>
                </div>

                <div className="grid gap-3 sm:gap-4 sm:grid-cols-2">
                  {[
                    { icon: <Plane size={16} className="w-4 h-4 sm:w-5 sm:h-5" />, cmd: "&joinflight", desc: "Flug beitreten und den Dashboard-Link direkt im Chat erhalten." },
                    { icon: <Armchair size={16} className="w-4 h-4 sm:w-5 sm:h-5" />, cmd: "&seat", desc: "Aktuellen Sitz sowie den persönlichen Passagier-Link anzeigen." },
                    { icon: <MapPin size={16} className="w-4 h-4 sm:w-5 sm:h-5" />, cmd: "&miles", desc: "Meilen, Flüge und bereiste Länder auf einen Blick." },
                    { icon: <Trophy size={16} className="w-4 h-4 sm:w-5 sm:h-5" />, cmd: "&topmiles", desc: "Leaderboard der fleißigsten Vielflieger im Stream." },
                  ].map((item) => (
                    <div key={item.cmd} className="control-panel rounded-[1.6rem] p-5 sm:p-6 lg:p-7">
                      <div className="inline-flex rounded-full bg-sas-blue/8 p-2.5 sm:p-3 text-sas-blue">{item.icon}</div>
                      <code className="mt-4 sm:mt-5 block text-base sm:text-lg font-black text-sas-midnight">{item.cmd}</code>
                      <p className="mt-2 text-sm sm:text-base leading-7 sm:leading-8 text-sas-gray-500">{item.desc}</p>
                    </div>
                  ))}
                </div>
              </MotionSection>

              <MotionSection className="grid gap-5 sm:gap-6 lg:gap-8 sm:grid-cols-3 pb-8" delay={0.12}>
                {[
                  { icon: <Terminal size={18} className="w-4 h-4 sm:w-5 sm:h-5" />, title: "Usage zuerst", body: "Der eigentliche Chat-String bleibt immer der lauteste Bezugspunkt." },
                  { icon: <Compass size={18} className="w-4 h-4 sm:w-5 sm:h-5" />, title: "Filter bleibt sticky", body: "Auf Mobile ist die Rail horizontal scrollbar, aber immer im Zugriff." },
                  { icon: <Info size={18} className="w-4 h-4 sm:w-5 sm:h-5" />, title: "Keine Hover-Abhängigkeit", body: "Alle wichtigen Informationen bleiben auch ohne Hover-Zustand lesbar." },
                ].map((item) => (
                  <div key={item.title} className="control-panel rounded-[1.6rem] p-5 sm:p-6 lg:p-7">
                    <span className="inline-flex rounded-full bg-sas-gold/12 p-2.5 sm:p-3 text-sas-gold">{item.icon}</span>
                    <h4 className="mt-4 sm:mt-5 text-lg sm:text-xl font-black tracking-tight text-sas-midnight">{item.title}</h4>
                    <p className="mt-2 sm:mt-3 text-sm sm:text-base leading-7 sm:leading-8 text-sas-gray-500">{item.body}</p>
                  </div>
                ))}
              </MotionSection>
            </div>
          </div>
        </main>
      </div>
    </PageShell>
  );
}
