"use client";

import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import AirspaceScene from "@/components/effects/AirspaceScene";
import BoardingPass from "@/components/flight/BoardingPass";
import SeatMap from "@/components/flight/SeatMap";
import FlightTracker from "@/components/flight/FlightTracker";
import CountryLeaderboard from "@/components/flight/CountryLeaderboard";
import PageShell from "@/components/layout/PageShell";
import ResponsiveTabRail from "@/components/layout/ResponsiveTabRail";
import { changeSeat, getParticipant, getParticipants } from "@/lib/botApi";
import type { Flight, Participant, BoardingPassData, PositionUpdate } from "@/lib/types";
import { Armchair, Map, Plane, Ticket, Trophy, Wifi, WifiOff } from "lucide-react";

type Tab = "pass" | "seats" | "map" | "stats";

interface FlightDashboardProps {
  hash: string;
  initialFlight: Flight | null;
  initialParticipant: Participant | null;
  initialParticipants: Participant[];
}

export default function FlightDashboard({
  hash,
  initialFlight,
  initialParticipant,
  initialParticipants,
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
    if (!flight?.id) return;
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
  }, [flight?.id, hash]);

  const handleSeatChange = async (newSeat: string) => {
    if (!currentParticipant) return;
    try {
      setCurrentParticipant({ ...currentParticipant, seat: newSeat });
      setParticipants((previous) =>
        previous.map((participant) =>
          participant.user_id === currentParticipant.user_id ? { ...participant, seat: newSeat } : participant,
        ),
      );
      await changeSeat(currentParticipant.participant_hash, newSeat);
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : "Sitzwechsel fehlgeschlagen");
      const participantData = await getParticipant(hash);
      setCurrentParticipant(participantData as Participant);
      if (flight?.id) {
        const participantList = await getParticipants(flight.id);
        setParticipants(participantList as Participant[]);
      }
    }
  };

  if (error || !flight || !currentParticipant) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-aurora">
        <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} className="text-center glass rounded-2xl p-12">
          <Plane size={48} className="mx-auto text-sas-gray-300 mb-4" />
          <h1 className="text-xl font-bold text-sas-midnight mb-2">Nicht gefunden</h1>
          <p className="text-sas-gray-400 text-sm">{error || "Dieser Boarding Pass existiert nicht."}</p>
        </motion.div>
      </div>
    );
  }

  const boardingPass: BoardingPassData = currentParticipant.boarding_pass_data
    ? typeof currentParticipant.boarding_pass_data === "string"
      ? JSON.parse(currentParticipant.boarding_pass_data)
      : currentParticipant.boarding_pass_data
    : {
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

  const tabs: { id: Tab; label: string; icon: React.ReactNode }[] = [
    { id: "pass", label: "Boarding Pass", icon: <Ticket size={16} /> },
    { id: "seats", label: "Sitzplan", icon: <Armchair size={16} /> },
    { id: "map", label: "Live Map", icon: <Map size={16} /> },
    { id: "stats", label: "Stats", icon: <Trophy size={16} /> },
  ];

  const isLive = !!position && position.lat !== 0 && position.lon !== 0;

  return (
    <PageShell tone="night">
      <div className="relative">
        <header className="relative overflow-hidden pb-10 pt-6 text-white">
          <AirspaceScene density="compact" className="opacity-90" />
          <div className="absolute inset-0 bg-[linear-gradient(180deg,rgba(3,8,20,0.18),rgba(3,8,20,0.6)_65%,rgba(233,238,248,0)_100%)]" />

          <div className="page-frame relative">
            <motion.div initial={{ opacity: 0, y: 18 }} animate={{ opacity: 1, y: 0 }} className="grid gap-4 lg:gap-6 lg:grid-cols-[1.15fr_0.85fr]">
              <div className="pt-3">
                <p className="eyebrow">Passenger Surface</p>
                <h1 className="mt-5 text-4xl font-black tracking-[-0.05em] text-glow-white sm:text-5xl lg:text-6xl">
                  {flight.flight_number || `SK${flight.id}`}
                </h1>
                <div className="mt-5 flex items-center gap-3 text-white/64">
                  <div>
                    <p className="text-2xl font-black tracking-tight sm:text-3xl">{flight.icao_from}</p>
                    <p className="text-[10px] uppercase tracking-[0.24em] text-white/30">{flight.dep_name}</p>
                  </div>
                  <div className="flex items-center gap-1 px-2">
                    <div className="h-px w-8 bg-white/15" />
                    <motion.div animate={{ x: [0, 6, 0] }} transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}>
                      <Plane size={16} className="rotate-90 text-sas-gold" />
                    </motion.div>
                    <div className="h-px w-8 bg-white/15" />
                  </div>
                  <div className="text-right">
                    <p className="text-2xl font-black tracking-tight sm:text-3xl">{flight.icao_to}</p>
                    <p className="text-[10px] uppercase tracking-[0.24em] text-white/30">{flight.arr_name}</p>
                  </div>
                </div>
                <p className="mt-6 max-w-xl text-base leading-7 text-white/62">
                  Persönlicher Flight Link, Seat Control, Live-Tracking und eigene Länder-/Meilenstatistik in einer
                  mobilen Oberfläche, die wie eine Boarding Experience statt wie ein Roh-Dashboard wirkt.
                </p>
              </div>

              <div className="night-panel rounded-[2rem] p-5 sm:p-6">
                <div className="flex flex-wrap items-start justify-between gap-4">
                  <div>
                    <p className="text-xs font-semibold uppercase tracking-[0.24em] text-white/38">Passenger</p>
                    <p className="mt-2 text-2xl font-black tracking-tight text-white">{currentParticipant.user_name}</p>
                  </div>
                  <div className="rounded-full border border-sas-gold/16 bg-sas-gold/10 px-3 py-1 text-xs font-semibold tracking-[0.22em] text-sas-gold uppercase">
                    Seat {currentParticipant.seat || "TBD"}
                  </div>
                </div>
                <div className="mt-5 grid gap-3 sm:grid-cols-2">
                  <div className="rounded-[1.4rem] border border-white/8 bg-white/[0.045] p-4">
                    <p className="text-xs uppercase tracking-[0.18em] text-white/35">Live Link</p>
                    <p className="mt-2 text-sm leading-6 text-white/72">
                      {isLive ? "Positionsdaten laufen ein und aktualisieren die Strecke." : "Noch keine Positionsdaten aktiv."}
                    </p>
                  </div>
                  <div className="rounded-[1.4rem] border border-white/8 bg-white/[0.045] p-4">
                    <p className="text-xs uppercase tracking-[0.18em] text-white/35">Flight Status</p>
                    <div className="mt-2 flex items-center gap-2">
                      {isLive ? <Wifi size={14} className="text-sas-green" /> : <WifiOff size={14} className="text-sas-red" />}
                      <span className="text-sm font-semibold text-white/78">{flight.status}</span>
                    </div>
                  </div>
                </div>
              </div>
            </motion.div>
          </div>
        </header>

        <main className="page-frame relative z-10 -mt-4 pb-20">
          <div className="sticky top-3 z-30 mb-6 rounded-[1.75rem] bg-white/10 p-2 backdrop-blur-xl">
            <ResponsiveTabRail items={tabs} active={activeTab} onChange={setActiveTab} tone="dark" />
          </div>

          <AnimatePresence mode="wait">
            <motion.div
              key={activeTab}
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
              transition={{ duration: 0.25, ease: [0.4, 0, 0.2, 1] }}
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
              {activeTab === "stats" && <CountryLeaderboard userId={currentParticipant.user_id} />}
            </motion.div>
          </AnimatePresence>
        </main>
      </div>
    </PageShell>
  );
}
