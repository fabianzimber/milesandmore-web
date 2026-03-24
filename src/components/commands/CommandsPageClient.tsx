"use client";

import { useDeferredValue, useEffect, useMemo, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import {
  Armchair,
  ChevronRight,
  Clock,
  Compass,
  Info,
  Plane,
  Shield,
  Sparkles,
  Terminal,
  TerminalSquare,
  Trophy,
} from "lucide-react";
import TextReveal from "@/components/effects/TextReveal";
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

const PERM_BADGES: Record<string, string> = {
  Everyone: "text-emerald-300 border-emerald-300/16 bg-emerald-300/8",
  User: "text-emerald-300 border-emerald-300/16 bg-emerald-300/8",
  VIP: "text-sas-blue border-sas-blue/16 bg-sas-blue/8",
  Moderator: "text-sas-blue border-sas-blue/16 bg-sas-blue/8",
  Broadcaster: "text-gold-300 border-gold-300/16 bg-gold-300/8",
  Admin: "text-rose-300 border-rose-300/16 bg-rose-300/8",
  Owner: "text-sas-gray-700 border-white/10 bg-white/6",
};

const CAT_CONFIG: Record<string, { icon: React.ReactNode; color: string }> = {
  flight: { icon: <Plane size={14} />, color: "text-gold-300" },
  stats: { icon: <Trophy size={14} />, color: "text-sas-blue" },
  info: { icon: <Info size={14} />, color: "text-sas-cyan" },
  admin: { icon: <Shield size={14} />, color: "text-rose-300" },
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

  useEffect(() => {
    window.dispatchEvent(new Event("resize"));
  }, [deferredFilter]);

  const categories: TabRailItem<string>[] = [
    { id: "all", label: "Alle", icon: <Sparkles size={14} /> },
    { id: "flight", label: "Flug", icon: <Plane size={14} /> },
    { id: "stats", label: "Stats", icon: <Trophy size={14} /> },
    { id: "info", label: "Info", icon: <Info size={14} /> },
    { id: "admin", label: "Admin", icon: <Shield size={14} /> },
  ];

  return (
    <PageShell tone="night">
      <div className="relative pb-24 pt-28 text-white sm:pt-32">
        <header className="page-frame">
          <div className="grid gap-12 lg:grid-cols-[minmax(0,1fr)_24rem] lg:items-end lg:gap-16">
            <div>
              <span className="eyebrow">Command Surface</span>
              <div className="mt-5">
                <TextReveal text="COMMAND" as="h1" className="display-heading text-glow-white" />
                <TextReveal
                  text="Atlas"
                  as="p"
                  className="display-heading display-accent mt-1 text-gold-300"
                  delay={0.1}
                />
              </div>
              <p className="mt-6 max-w-2xl text-sm leading-7 text-white/56 sm:text-base sm:leading-8">
                Dieselbe Command-Sammlung, aber als dunkles Cockpit-Layer mit klaren Berechtigungen, Cooldowns und
                sofort lesbaren Chat-Strings.
              </p>
            </div>

            <div className="surface-gold-accent px-7 py-7">
              <p className="mono-label !gap-2 !text-[0.62rem] !tracking-[0.2em] !text-sas-gray-500 before:hidden">
                Atlas Overview
              </p>
              <div className="mt-5 space-y-4">
                <InfoRow label="Commands" value={commands.length.toString()} />
                <InfoRow
                  label="Aktiver Filter"
                  value={categories.find((category) => category.id === filter)?.label || "Alle"}
                />
              </div>
            </div>
          </div>
        </header>

        <main className="page-frame space-y-16">
          <MotionSection className="flex justify-center">
            <ResponsiveTabRail
              items={categories}
              active={filter}
              onChange={setFilter}
              tone="dark"
              className="w-full max-w-4xl"
            />
          </MotionSection>

          <MotionSection className="surface-glass scan-lines px-6 py-6 sm:px-8 sm:py-7">
            <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
              <div>
                <p className="metric-kicker">Filtered View</p>
                <h2 className="mt-3 text-3xl font-black tracking-[-0.05em] text-foreground sm:text-4xl">
                  {filtered.length} Commands im Fokus.
                </h2>
              </div>
              <p className="max-w-xl text-sm leading-7 text-white/52">
                Nutzung, Kategorie und Berechtigungen bleiben sofort lesbar. Der Filter ändert nur die Darstellung,
                nicht den Inhalt.
              </p>
            </div>

            <AnimatePresence mode="wait">
              <motion.div
                key={deferredFilter}
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                transition={{ duration: 0.28, ease: [0.22, 1, 0.36, 1] }}
                className="mt-10 space-y-4"
              >
                {filtered.map((command, index) => {
                  const permClass = PERM_BADGES[command.permissionLevel] || PERM_BADGES.Everyone;
                  const category = CAT_CONFIG[command.category || "info"] || CAT_CONFIG.info;

                  return (
                    <motion.article
                      key={command.name}
                      initial={{ opacity: 0, y: 12 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: index * 0.02, duration: 0.3 }}
                      className="surface-glass border-l-2 border-l-gold-400/60 px-5 py-5 sm:px-6 sm:py-6"
                    >
                      <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
                        <div className="min-w-0 flex-1">
                          <div className="flex flex-wrap items-center gap-2.5">
                            <span className={category.color}>{category.icon}</span>
                            <span className="text-[0.65rem] font-semibold uppercase tracking-[0.2em] text-white/34">
                              {String(index + 1).padStart(2, "0")}
                            </span>
                            <code className="rounded-full border border-white/8 bg-sas-gray-100 px-3 py-1.5 text-xs font-semibold text-foreground">
                              {command.usage}
                            </code>
                            {command.aliases?.length ? (
                              <span className="text-xs text-white/40">
                                {command.aliases.slice(0, 3).map((alias) => `&${alias}`).join(" ")}
                              </span>
                            ) : null}
                          </div>

                          <p className="mt-4 max-w-3xl text-sm leading-7 text-white/58">{command.description}</p>
                        </div>

                        <div className="flex flex-wrap items-center gap-2 lg:justify-end">
                          <span
                            className={`rounded-full border px-3 py-1 text-[0.62rem] font-semibold uppercase tracking-[0.18em] ${permClass}`}
                          >
                            {command.permissionLevel}
                          </span>
                          {command.cooldown.user > 0 ? (
                            <span className="inline-flex items-center gap-1.5 rounded-full border border-white/8 bg-white/4 px-3 py-1 text-[0.62rem] font-semibold uppercase tracking-[0.18em] text-white/62">
                              <Clock size={11} />
                              {command.cooldown.user}s
                            </span>
                          ) : null}
                          <span className="inline-flex items-center gap-1.5 rounded-full border border-sas-blue/14 bg-sas-blue/8 px-3 py-1 text-[0.62rem] font-semibold uppercase tracking-[0.18em] text-sas-blue">
                            {command.category}
                            <ChevronRight size={11} />
                          </span>
                        </div>
                      </div>
                    </motion.article>
                  );
                })}
              </motion.div>
            </AnimatePresence>
          </MotionSection>

          <div className="grid gap-8 lg:grid-cols-[0.86fr_1.14fr]">
            <MotionSection className="surface-gold-accent px-7 py-7 sm:px-9 sm:py-9">
              <span className="eyebrow">Quickstart</span>
              <h3 className="mt-5 text-3xl font-black tracking-[-0.05em] text-foreground">
                Die vier schnellsten Einstiege.
              </h3>
              <p className="mt-4 text-sm leading-7 text-white/54">
                Für neue Zuschauer reichen meist vier Commands, um sofort ins Fluggeschehen zu springen oder die
                eigenen Daten abzurufen.
              </p>
            </MotionSection>

            <MotionSection className="grid gap-5 sm:grid-cols-2" delay={0.08}>
              {[
                { icon: <Plane size={16} />, cmd: "&joinflight", desc: "Flug beitreten und den Dashboard-Link direkt im Chat erhalten." },
                { icon: <Armchair size={16} />, cmd: "&seat", desc: "Aktuellen Sitz sowie den persönlichen Passagier-Link anzeigen." },
                { icon: <Compass size={16} />, cmd: "&miles", desc: "Meilen, Flüge und bereiste Länder auf einen Blick." },
                { icon: <Trophy size={16} />, cmd: "&topmiles", desc: "Leaderboard der fleißigsten Vielflieger im Stream." },
              ].map((item) => (
                <div key={item.cmd} className="surface-glass px-6 py-6 sm:px-7 sm:py-7">
                  <span className="inline-flex rounded-full border border-gold-300/20 bg-gold-400/8 p-3 text-gold-300">
                    {item.icon}
                  </span>
                  <code className="mt-4 block text-lg font-black tracking-[-0.03em] text-foreground">{item.cmd}</code>
                  <p className="mt-2 text-sm leading-7 text-white/54">{item.desc}</p>
                </div>
              ))}
            </MotionSection>
          </div>

          <MotionSection className="grid gap-5 sm:grid-cols-3" delay={0.12}>
            {[
              { icon: <Terminal size={16} />, title: "Usage zuerst", body: "Der Chat-String bleibt immer der lauteste Bezugspunkt." },
              { icon: <TerminalSquare size={16} />, title: "Filter bleibt direkt", body: "Auf Mobile scrollt die Rail, verliert aber nie ihre Priorität." },
              { icon: <Info size={16} />, title: "Keine Hover-Abhängigkeit", body: "Alle entscheidenden Daten bleiben auch ohne Pointer sichtbar." },
            ].map((item) => (
              <div key={item.title} className="surface-glass px-6 py-6 sm:px-7 sm:py-7">
                <span className="inline-flex rounded-full border border-white/8 bg-white/4 p-3 text-sas-blue">
                  {item.icon}
                </span>
                <h4 className="mt-4 text-xl font-black tracking-tight text-foreground">{item.title}</h4>
                <p className="mt-2 text-sm leading-7 text-white/54">{item.body}</p>
              </div>
            ))}
          </MotionSection>
        </main>
      </div>
    </PageShell>
  );
}

function InfoRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-center justify-between gap-4 border-b border-white/8 pb-3 last:border-b-0 last:pb-0">
      <span className="text-sm text-white/44">{label}</span>
      <span className="text-base font-semibold text-foreground">{value}</span>
    </div>
  );
}
