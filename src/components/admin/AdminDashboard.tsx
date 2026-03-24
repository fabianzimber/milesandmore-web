"use client";

import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { signOut } from "next-auth/react";
import SimBriefImport from "@/components/admin/SimBriefImport";
import BotCredentialsPanel from "@/components/admin/BotCredentialsPanel";
import SimLinkPanel from "@/components/admin/SimLinkPanel";
import ChannelManager from "@/components/admin/ChannelManager";
import BoardingControl from "@/components/admin/BoardingControl";
import BotLog from "@/components/admin/BotLog";
import FlightStatusBar from "@/components/admin/FlightStatusBar";
import PageShell from "@/components/layout/PageShell";
import ResponsiveTabRail from "@/components/layout/ResponsiveTabRail";
import SASButton from "@/components/ui/SASButton";
import type { BotLogEntry, BotRuntimeSettings, BotStatus, Flight } from "@/lib/types";
import { getBotStatus, getFlights } from "@/lib/botApi";
import { Plane, Users, BarChart3, ScrollText, LogOut, Radio, KeyRound } from "lucide-react";
import Image from "next/image";

type Tab = "bot" | "simbrief" | "simlink" | "channels" | "boarding" | "logs";

interface AdminDashboardProps {
  initialCurrentFlight: Flight | null;
  initialBotStatus: BotStatus;
  initialBotSettings: BotRuntimeSettings;
  initialLogs: BotLogEntry[];
}

export default function AdminDashboard({
  initialCurrentFlight,
  initialBotStatus,
  initialBotSettings,
  initialLogs,
}: AdminDashboardProps) {
  const [activeTab, setActiveTab] = useState<Tab>("bot");
  const [currentFlight, setCurrentFlight] = useState<Flight | null>(initialCurrentFlight);
  const [botStatus, setBotStatus] = useState<BotStatus>(initialBotStatus);
  const [logs, setLogs] = useState<BotLogEntry[]>(initialLogs);
  const [importedFlightPlan, setImportedFlightPlan] = useState<Record<string, unknown> | null>(null);

  useEffect(() => {
    const refresh = async () => {
      try {
        const [status, boarding, inFlight] = await Promise.all([
          getBotStatus(),
          getFlights("boarding"),
          getFlights("in_flight"),
        ]);
        setBotStatus(status as BotStatus);
        const boardingFlight = (boarding as Flight[])[0];
        const inFlightFlight = (inFlight as Flight[])[0];
        setCurrentFlight(boardingFlight || inFlightFlight || null);
      } catch {
        // ignore refresh failures in UI
      }
    };

    const pollInterval = currentFlight ? 5000 : 15000;
    refresh();
    const interval = setInterval(refresh, pollInterval);
    return () => clearInterval(interval);
  }, [currentFlight !== null]);

  const isLive = Boolean(botStatus.lastEventAt);

  const tabs: { id: Tab; label: string; icon: React.ReactNode }[] = [
    { id: "bot", label: "Bot", icon: <KeyRound size={16} /> },
    { id: "simbrief", label: "SimBrief", icon: <Plane size={16} /> },
    { id: "simlink", label: "SimLink", icon: <Radio size={16} /> },
    { id: "channels", label: "Channels", icon: <Users size={16} /> },
    { id: "boarding", label: "Boarding", icon: <BarChart3 size={16} /> },
    { id: "logs", label: "Log", icon: <ScrollText size={16} /> },
  ];

  return (
    <PageShell tone="control">
      <div className="relative flex flex-col min-h-[100dvh] lg:h-[100dvh] lg:overflow-hidden">
        <header className="relative shrink-0 overflow-hidden border-b border-white/[0.06] pb-6 pt-4 sm:pb-8 sm:pt-6 lg:pb-10 lg:pt-8">
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_12%_12%,rgba(74,144,217,0.08),transparent_24%),radial-gradient(circle_at_88%_10%,rgba(200,169,110,0.06),transparent_22%)]" />
          <div className="page-frame-wide relative">
            <div className="flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between">
              <div className="flex items-start gap-4 sm:gap-6">
                <motion.div
                  animate={{ rotate: [0, 4, -4, 0] }}
                  transition={{ duration: 6, repeat: Infinity, ease: "easeInOut" }}
                  className="hidden sm:block mt-1 lg:mt-2"
                >
                  <div className="flex h-12 w-12 sm:h-14 sm:w-14 lg:h-16 lg:w-16 items-center justify-center rounded-2xl bg-white/[0.06] border border-white/[0.08] shadow-[0_18px_40px_rgba(0,0,0,0.3)] overflow-hidden p-1.5">
                    <Image src="/logo.svg" alt="Miles & More" width={56} height={56} className="w-full h-full object-contain" />
                  </div>
                </motion.div>
                <div>
                  <p className="metric-kicker">Operations Desk</p>
                  <h1 className="mt-2 sm:mt-3 text-4xl font-extrabold tracking-[-0.04em] sm:text-5xl lg:text-6xl">
                    Miles & More <span className="display-accent text-gold-400">Control</span>
                  </h1>
                  <p className="mt-3 sm:mt-4 max-w-2xl text-sm leading-6 sm:text-base sm:leading-7 lg:text-lg lg:leading-8 text-foreground/40">
                    Importe, Credentials, SimLink, Boarding und Logs bleiben fachlich dicht und ruhig im gleichen
                    Operations-Desk-Rhythmus.
                  </p>
                </div>
              </div>

              <div className="flex flex-wrap items-center gap-3 sm:gap-4 sm:justify-end lg:mb-2">
                <div className="surface-glass rounded-full px-4 py-2.5 sm:px-5 sm:py-3">
                  <div className="flex items-center gap-2 sm:gap-3 text-xs sm:text-sm font-medium">
                    {isLive ? (
                      <span className="flex items-center gap-1.5 text-mm-success">
                        <span className="relative flex h-2 w-2">
                          <span className="absolute inset-0 rounded-full bg-mm-success animate-ping opacity-50" />
                          <span className="relative inline-flex rounded-full h-2 w-2 bg-mm-success" />
                        </span>
                        LIVE
                      </span>
                    ) : (
                      <span className="text-foreground/30">IDLE</span>
                    )}
                    <span className="text-foreground/15">·</span>
                    <span className="text-foreground/40">{botStatus.channels} CH</span>
                    <span className="text-foreground/40">{botStatus.activeFlights || 0} FL</span>
                    <span className="text-foreground/40">{botStatus.commandsExecuted} CMD</span>
                  </div>
                </div>

                <SASButton variant="ghost" size="sm" onClick={() => signOut({ callbackUrl: "/admin/signin" })} className="sm:h-10">
                  <LogOut size={13} className="sm:w-4 sm:h-4" />
                  Logout
                </SASButton>
              </div>
            </div>
          </div>
        </header>

        <div className="shrink-0">
          <FlightStatusBar flight={currentFlight} importedFlightPlan={importedFlightPlan} />
        </div>

        <div className="shrink-0 z-30 border-b border-white/[0.06] bg-navy-950/80 backdrop-blur-xl">
          <div className="page-frame-wide py-2 sm:py-3 lg:py-4">
            <ResponsiveTabRail items={tabs} active={activeTab} onChange={setActiveTab} tone="dark" />
          </div>
        </div>

        <main className="flex-1 min-h-0 overflow-y-auto relative">
          <div className="page-frame-wide py-6 sm:py-8 lg:py-10">
            <AnimatePresence mode="wait">
              <motion.div
                key={activeTab}
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -8 }}
                transition={{ duration: 0.25, ease: [0.4, 0, 0.2, 1] }}
                className="h-full"
              >
                {activeTab === "bot" && <BotCredentialsPanel initialSettings={initialBotSettings} />}
                {activeTab === "simbrief" && <SimBriefImport onImport={(plan) => setImportedFlightPlan(plan)} importedPlan={importedFlightPlan} />}
                {activeTab === "simlink" && <SimLinkPanel />}
                {activeTab === "channels" && <ChannelManager />}
                {activeTab === "boarding" && (
                  <BoardingControl
                    currentFlight={currentFlight}
                    setCurrentFlight={setCurrentFlight}
                    importedFlightPlan={importedFlightPlan}
                  />
                )}
                {activeTab === "logs" && <BotLog logs={logs} setLogs={setLogs} />}
              </motion.div>
            </AnimatePresence>
          </div>
        </main>
      </div>
    </PageShell>
  );
}
