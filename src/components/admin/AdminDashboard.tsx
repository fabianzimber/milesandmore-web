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

    // Poll faster (5s) when there's an active flight, slower (15s) when idle
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
      <div className="min-h-screen text-sas-midnight">
        <header className="relative overflow-hidden border-b border-sas-gray-200/60">
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_12%_12%,rgba(123,164,255,0.16),transparent_24%),radial-gradient(circle_at_88%_10%,rgba(202,169,109,0.12),transparent_22%)]" />
          <div className="page-frame-wide relative py-6">
            <div className="flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between">
              <div className="flex items-start gap-4">
                <motion.div
                  animate={{ rotate: [0, 4, -4, 0] }}
                  transition={{ duration: 6, repeat: Infinity, ease: "easeInOut" }}
                  className="hidden sm:block"
                >
                  <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-sas-midnight text-white shadow-[0_18px_40px_rgba(5,11,25,0.18)]">
                    <Plane size={20} className="text-sas-gold" />
                  </div>
                </motion.div>
                <div>
                  <p className="metric-kicker">Operations Desk</p>
                  <h1 className="mt-3 text-4xl font-black tracking-[-0.05em] text-sas-midnight sm:text-5xl">
                    Miles & More Control Room
                  </h1>
                  <p className="mt-4 max-w-2xl text-sm leading-7 text-sas-gray-500">
                    Importe, Credentials, SimLink, Boarding und Logs bleiben fachlich dicht und ruhig im gleichen
                    Operations-Desk-Rhythmus.
                  </p>
                </div>
              </div>

              <div className="flex flex-wrap items-center gap-3 sm:justify-end">
                <div className="control-panel rounded-full px-4 py-3">
                  <div className="flex items-center gap-2 text-xs">
                    {isLive ? (
                      <span className="flex items-center gap-1.5 text-sas-green">
                        <span className="relative flex h-2 w-2">
                          <span className="absolute inset-0 rounded-full bg-sas-green animate-ping opacity-50" />
                          <span className="relative inline-flex rounded-full h-2 w-2 bg-sas-green" />
                        </span>
                        LIVE
                      </span>
                    ) : (
                      <span className="text-sas-gray-400">IDLE</span>
                    )}
                    <span className="text-sas-gray-300">·</span>
                    <span className="text-sas-gray-500">{botStatus.channels} CH</span>
                    <span className="text-sas-gray-500">{botStatus.activeFlights || 0} FL</span>
                    <span className="text-sas-gray-500">{botStatus.commandsExecuted} CMD</span>
                  </div>
                </div>

                <SASButton variant="ghost" size="sm" onClick={() => signOut({ callbackUrl: "/admin/signin" })}>
                  <LogOut size={13} />
                  Logout
                </SASButton>
              </div>
            </div>
          </div>
        </header>

        <FlightStatusBar flight={currentFlight} importedFlightPlan={importedFlightPlan} />

        <div className="sticky top-0 z-30 border-b border-sas-gray-200/60 bg-white/70 backdrop-blur-xl">
          <div className="page-frame-wide py-2">
            <ResponsiveTabRail items={tabs} active={activeTab} onChange={setActiveTab} tone="light" />
          </div>
        </div>

        <main className="page-frame-wide py-7">
          <AnimatePresence mode="wait">
            <motion.div
              key={activeTab}
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
              transition={{ duration: 0.25, ease: [0.4, 0, 0.2, 1] }}
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
        </main>
      </div>
    </PageShell>
  );
}
