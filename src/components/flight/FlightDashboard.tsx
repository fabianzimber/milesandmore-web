"use client";

import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import AirspaceScene from "@/components/effects/AirspaceScene";
import BoardingPass from "@/components/flight/BoardingPass";
import SeatMap from "@/components/flight/SeatMap";
import FlightTracker from "@/components/flight/FlightTracker";
import CountryLeaderboard from "@/components/flight/CountryLeaderboard";
import PageShell from "@/components/layout/PageShell";
import Navigation from "@/components/layout/Navigation";
import ResponsiveTabRail from "@/components/layout/ResponsiveTabRail";
import { changeSeat, getParticipant, getParticipants } from "@/lib/botApi";
import type { Flight, Participant, BoardingPassData, PositionUpdate } from "@/lib/types";
import { Armchair, Map, Plane, Ticket, Trophy, Wifi, WifiOff, X } from "lucide-react";

type Tab = "pass" | "seats" | "map" | "stats";

interface FlightDashboardProps {
  hash: string;
  initialFlight: Flight | null;
  initialParticipant: Participant | null;
  initialParticipants: Participant[];
  isDemo?: boolean;
}

export default function FlightDashboard({
  hash,
  initialFlight,
  initialParticipant,
  initialParticipants,
  isDemo,
}: FlightDashboardProps) {
  const [error, setError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<Tab>("pass");
  const [flight, setFlight] = useState<Flight | null>(initialFlight);
  const [currentParticipant, setCurrentParticipant] = useState<Participant | null>(initialParticipant);
  const [participants, setParticipants] = useState<Participant[]>(initialParticipants);
  const [position, setPosition] = useState<PositionUpdate | null>(
    initialFlight?.current_lat
      ? {
          lat: initialFlight.current_lat,
          lon: initialFlight.current_lon || 0,
          alt: initialFlight.current_alt || 0,
          speed: initialFlight.current_speed || 0,
          heading: initialFlight.current_heading || 0,
        }
      : null,
  );

  useEffect(() => {
    window.dispatchEvent(new Event("resize"));
  }, [activeTab]);

  useEffect(() => {
    if (!flight?.id || isDemo) return;
    const refresh = async () => {
      try {
        const [participantData, participantList] = await Promise.all([
          getParticipant(hash),
          getParticipants(flight.id),
        ]);
        const typedParticipant = participantData as Participant & Record<string, unknown>;
        setCurrentParticipant(typedParticipant as Participant);
        setParticipants(participantList as Participant[]);
        setError(null);
        setFlight((previous) =>
          previous
            ? {
                ...previous,
                status: (typedParticipant.flight_status as Flight["status"]) || previous.status,
                current_lat: Number(typedParticipant.current_lat ?? previous.current_lat ?? 0),
                current_lon: Number(typedParticipant.current_lon ?? previous.current_lon ?? 0),
                current_alt: Number(typedParticipant.current_alt ?? previous.current_alt ?? 0),
                current_speed: Number(typedParticipant.current_speed ?? previous.current_speed ?? 0),
                current_heading: Number(typedParticipant.current_heading ?? previous.current_heading ?? 0),
              }
            : previous,
        );
        if (typedParticipant.current_lat != null && typedParticipant.current_lon != null) {
          setPosition({
            lat: Number(typedParticipant.current_lat),
            lon: Number(typedParticipant.current_lon),
            alt: Number(typedParticipant.current_alt ?? 0),
            speed: Number(typedParticipant.current_speed ?? 0),
            heading: Number(typedParticipant.current_heading ?? 0),
          });
        }
      } catch (cause) {
        setError(cause instanceof Error ? cause.message : "Fehler beim Aktualisieren");
      }
    };
    const interval = setInterval(refresh, 5000);
    return () => clearInterval(interval);
  }, [flight?.id, hash, isDemo]);

  const handleSeatChange = async (newSeat: string) => {
    if (!currentParticipant) return;
    try {
      setCurrentParticipant({ ...currentParticipant, seat: newSeat });
      setParticipants((previous) =>
        previous.map((participant) =>
          participant.user_id === currentParticipant.user_id ? { ...participant, seat: newSeat } : participant,
        ),
      );
      if (!isDemo) {
        await changeSeat(currentParticipant.participant_hash, newSeat);
      }
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : "Sitzwechsel fehlgeschlagen");
      try {
        const participantData = await getParticipant(hash);
        setCurrentParticipant(participantData as Participant);
        if (flight?.id) {
          const participantList = await getParticipants(flight.id);
          setParticipants(participantList as Participant[]);
        }
      } catch {
        // recovery fetch failed – state will sync on next poll
      }
    }
  };

  if (!flight || !currentParticipant) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-navy-950">
        <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} className="text-center surface-glass rounded-2xl p-12">
          <Plane size={48} className="mx-auto text-foreground/20 mb-4" />
          <h1 className="text-xl font-bold mb-2">Nicht gefunden</h1>
          <p className="text-foreground/40 text-sm">Dieser Boarding Pass existiert nicht.</p>
        </motion.div>
      </div>
    );
  }

  let parsedPassData: BoardingPassData | null = null;
  if (currentParticipant.boarding_pass_data) {
    try {
      parsedPassData =
        typeof currentParticipant.boarding_pass_data === "string"
          ? JSON.parse(currentParticipant.boarding_pass_data)
          : currentParticipant.boarding_pass_data;
    } catch {
      // malformed JSON – fall through to default
    }
  }
  const boardingPassBase: BoardingPassData = parsedPassData || {
        passenger_name: currentParticipant.user_name.toUpperCase(),
        flight_number: flight.flight_number || `SK${flight.id}`,
        seat: currentParticipant.seat || "TBD",
        gate: flight.dep_gate || "A1",
        departure: flight.dep_name || flight.icao_from,
        arrival: flight.arr_name || flight.icao_to,
        dep_code: flight.icao_from,
        arr_code: flight.icao_to,
        date: new Date().toLocaleDateString("de-DE", { day: "2-digit", month: "short", year: "numeric" }),
        boarding_time: new Date().toLocaleTimeString("de-DE", { hour: "2-digit", minute: "2-digit" }),
        aircraft: flight.aircraft_name || "Aircraft",
      };
  const boardingPass: BoardingPassData = {
    ...boardingPassBase,
    seat: currentParticipant.seat || boardingPassBase.seat || "TBD",
  };

  const tabs: { id: Tab; label: string; icon: React.ReactNode }[] = [
    { id: "pass", label: "Boarding Pass", icon: <Ticket size={16} /> },
    { id: "seats", label: "Sitzplan", icon: <Armchair size={16} /> },
    { id: "map", label: "Live Map", icon: <Map size={16} /> },
    { id: "stats", label: "Stats", icon: <Trophy size={16} /> },
  ];

  const isLive = !!position && position.lat !== 0 && position.lon !== 0;

  return (
    <PageShell tone="night">
      <Navigation />
      <div className="relative flex flex-col min-h-[100dvh] pb-20">
        <header className="relative shrink-0 overflow-hidden pb-8 pt-20 sm:pb-12 sm:pt-24 lg:pb-14 lg:pt-28 text-foreground">
          <AirspaceScene density="compact" className="opacity-90" />
          <div className="absolute inset-0 bg-[linear-gradient(180deg,rgba(5,5,16,0.18),rgba(5,5,16,0.6)_65%,rgba(5,5,16,0.9)_100%)]" />

          <div className="page-frame relative">
            <motion.div initial={{ opacity: 0, y: 18 }} animate={{ opacity: 1, y: 0 }} className="grid gap-6 lg:gap-8 lg:grid-cols-[1.15fr_0.85fr] lg:items-end">
              <div className="pt-2 sm:pt-4">
                <p className="eyebrow">Passenger Surface</p>
                <div className="mt-3 sm:mt-5 lg:mt-6 flex flex-col gap-2 sm:gap-3">
                  <h1 className="text-4xl font-extrabold tracking-[-0.04em] sm:text-5xl lg:text-6xl">
                    {`SK${flight.flight_number || flight.id}`}
                  </h1>
                  <div className="flex items-center gap-3 sm:gap-4 lg:gap-5 text-foreground/70">
                    <div>
                      <p className="text-2xl font-extrabold tracking-tight sm:text-3xl lg:text-4xl">{flight.icao_from}</p>
                      <p className="text-[10px] sm:text-xs uppercase tracking-[0.24em] text-foreground/40">{flight.dep_name}</p>
                    </div>
                    <div className="flex items-center gap-2 px-1 sm:px-2 opacity-60">
                      <div className="h-px w-6 sm:w-10 lg:w-12 bg-white/[0.12]" />
                      <motion.div animate={{ x: [0, 4, 0] }} transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}>
                        <Plane size={16} className="sm:w-5 sm:h-5 rotate-90 text-gold-400" />
                      </motion.div>
                      <div className="h-px w-6 sm:w-10 lg:w-12 bg-white/[0.12]" />
                    </div>
                    <div className="text-right">
                      <p className="text-2xl font-extrabold tracking-tight sm:text-3xl lg:text-4xl">{flight.icao_to}</p>
                      <p className="text-[10px] sm:text-xs uppercase tracking-[0.24em] text-foreground/40">{flight.arr_name}</p>
                    </div>
                  </div>
                </div>
                <p className="mt-4 sm:mt-5 lg:mt-6 max-w-xl text-sm leading-6 sm:text-base sm:leading-7 lg:text-lg lg:leading-8 text-foreground/40 line-clamp-2 sm:line-clamp-none">
                  Persönlicher Flight Link, Seat Control, Live-Tracking und eigene Länder-/Meilenstatistik in einer
                  mobilen Oberfläche, die wie eine Boarding Experience statt wie ein Roh-Dashboard wirkt.
                </p>
              </div>

              <div className="night-panel rounded-[2rem] p-5 sm:p-6 lg:p-8 lg:mb-2">
                <div className="flex flex-wrap items-start justify-between gap-4">
                  <div>
                    <p className="text-xs font-semibold uppercase tracking-[0.24em] text-foreground/30">Passenger</p>
                    <p className="mt-1 sm:mt-2 text-2xl sm:text-3xl font-extrabold tracking-tight">{currentParticipant.user_name}</p>
                  </div>
                  <div className="rounded-full border border-gold-400/20 bg-gold-400/10 px-3 py-1 sm:px-4 sm:py-1.5 text-xs sm:text-sm font-semibold tracking-[0.22em] text-gold-400 uppercase">
                    Seat {currentParticipant.seat || "TBD"}
                  </div>
                </div>
                <div className="mt-5 sm:mt-6 grid gap-3 sm:gap-4 sm:grid-cols-2">
                  <div className="rounded-[1.4rem] border border-white/[0.06] bg-white/[0.03] p-4 sm:p-5">
                    <p className="text-xs uppercase tracking-[0.18em] text-foreground/25">Live Link</p>
                    <p className="mt-1 sm:mt-2 text-sm sm:text-base leading-6 text-foreground/50">
                      {isLive ? "Positionsdaten laufen ein." : "Noch keine Positionsdaten aktiv."}
                    </p>
                  </div>
                  <div className="rounded-[1.4rem] border border-white/[0.06] bg-white/[0.03] p-4 sm:p-5">
                    <p className="text-xs uppercase tracking-[0.18em] text-foreground/25">Flight Status</p>
                    <div className="mt-1 sm:mt-2 flex items-center gap-2">
                      {isLive ? <Wifi size={14} className="sm:w-4 sm:h-4 text-mm-success" /> : <WifiOff size={14} className="sm:w-4 sm:h-4 text-mm-destructive" />}
                      <span className="text-sm sm:text-base font-semibold text-foreground/60">{flight.status}</span>
                    </div>
                  </div>
                </div>
              </div>
            </motion.div>
          </div>
        </header>

        <main className="page-frame relative z-10 pb-6 sm:pb-8 lg:pb-10">
          <AnimatePresence>
            {error && (
              <motion.div
                initial={{ opacity: 0, y: -8 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -8 }}
                className="mb-4 flex items-center justify-between gap-3 rounded-xl bg-mm-destructive/10 border border-mm-destructive/20 px-4 py-3 text-sm text-mm-destructive"
              >
                <span>{error}</span>
                <button onClick={() => setError(null)} className="shrink-0 p-0.5 hover:bg-white/10 rounded">
                  <X size={14} />
                </button>
              </motion.div>
            )}
          </AnimatePresence>
          <div className="z-30 mb-4 sm:mb-6 lg:mb-8 rounded-[1.75rem] surface-glass p-2 sm:p-3 shrink-0 -mt-8 sm:-mt-10 lg:-mt-12 max-w-3xl mx-auto w-full">
            <ResponsiveTabRail items={tabs} active={activeTab} onChange={setActiveTab} tone="dark" />
          </div>

          <div className="relative px-1 sm:px-2 lg:px-4 pb-4 sm:pb-6 lg:pb-8">
            <AnimatePresence mode="wait">
              <motion.div
                key={activeTab}
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -8 }}
                transition={{ duration: 0.25, ease: [0.4, 0, 0.2, 1] }}
                className="flex flex-col"
              >
                {activeTab === "pass" && <BoardingPass data={boardingPass} />}
                {activeTab === "seats" && (
                  <SeatMap
                    flight={flight}
                    participants={participants}
                    currentUser={currentParticipant}
                    onSeatChange={handleSeatChange}
                  />
                )}
                {activeTab === "map" && <FlightTracker flight={flight} position={position} />}
                {activeTab === "stats" && <CountryLeaderboard userId={currentParticipant.user_id} isDemo={isDemo} />}
              </motion.div>
            </AnimatePresence>
          </div>
        </main>
      </div>
    </PageShell>
  );
}
