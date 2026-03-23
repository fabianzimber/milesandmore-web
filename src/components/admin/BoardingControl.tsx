"use client";

import { useState, useEffect, useCallback } from "react";
import SASButton from "@/components/ui/SASButton";
import SASCard from "@/components/ui/SASCard";
import BoardingOverview from "./BoardingOverview";
import {
  getChannels,
  createFlight,
  updateFlightStatus,
  resumeBoarding,
  resumeFlight as resumeFlightApi,
  assignSeats,
  getFlights,
} from "@/lib/botApi";
import type { Flight, ManagedChannel } from "@/lib/types";
import {
  Plane,
  Play,
  Square,
  XCircle,
  RotateCcw,
  AlertTriangle,
  CheckCircle,
} from "lucide-react";

interface BoardingControlProps {
  currentFlight: Flight | null;
  setCurrentFlight: (flight: Flight | null) => void;
  importedFlightPlan: Record<string, unknown> | null;
}

export default function BoardingControl({
  currentFlight,
  setCurrentFlight,
  importedFlightPlan,
}: BoardingControlProps) {
  const [channels, setChannels] = useState<ManagedChannel[]>([]);
  const [selectedChannel, setSelectedChannel] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [actionLoading, setActionLoading] = useState<string | null>(null);

  useEffect(() => {
    const fetchChannels = async () => {
      try {
        const data = (await getChannels()) as ManagedChannel[];
        setChannels(data);
        if (data.length > 0 && !selectedChannel) {
          setSelectedChannel(data[0].channel_name);
        }
      } catch {
        // ignore
      }
    };
    fetchChannels();
  }, [selectedChannel]);

  // Check for recoverable flights on mount
  useEffect(() => {
    const checkRecovery = async () => {
      try {
        const boarding = (await getFlights("boarding")) as Flight[];
        const inFlight = (await getFlights("in_flight")) as Flight[];
        const recoverable = [...boarding, ...inFlight];
        if (recoverable.length > 0 && !currentFlight) {
          setCurrentFlight(recoverable[0]);
        }
      } catch {
        // ignore
      }
    };
    checkRecovery();
  }, [currentFlight, setCurrentFlight]);

  const handleStartBoarding = async () => {
    if (!selectedChannel || !importedFlightPlan) return;
    setLoading(true);
    setError(null);
    try {
      const plan = importedFlightPlan as Record<string, unknown>;
      const origin = plan.origin as Record<string, string>;
      const destination = plan.destination as Record<string, string>;
      const aircraft = plan.aircraft as Record<string, string>;

      const flight = (await createFlight({
        channel_name: selectedChannel,
        icao_from: origin.icao,
        icao_to: destination.icao,
        pilot: selectedChannel,
        simbrief_ofp_id: plan.ofp_id,
        aircraft_icao: aircraft.icao,
        aircraft_name: aircraft.name,
        flight_number: plan.flight_number,
        route: plan.route,
        cruise_altitude: plan.cruise_altitude,
        distance_nm: plan.distance_nm,
        estimated_time_enroute: plan.estimated_time_enroute,
        dep_name: origin.name,
        arr_name: destination.name,
        dep_gate: origin.gate,
        arr_gate: destination.gate,
        aircraft_total_seats: plan.total_seats || 180,
        seat_config: plan.seat_config || "3-3",
        dep_country: origin.country,
        arr_country: destination.country,
        arr_country_name: destination.country_name,
      })) as Flight;

      setCurrentFlight(flight);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Boarding konnte nicht gestartet werden.");
    } finally {
      setLoading(false);
    }
  };

  const handleAction = useCallback(
    async (action: string) => {
      if (!currentFlight) return;
      setActionLoading(action);
      try {
        switch (action) {
          case "end_boarding":
            await assignSeats(currentFlight.id);
            await updateFlightStatus(currentFlight.id, "in_flight");
            setCurrentFlight({ ...currentFlight, status: "in_flight" });
            break;
          case "cancel_boarding":
            await updateFlightStatus(currentFlight.id, "cancelled");
            setCurrentFlight({ ...currentFlight, status: "cancelled" });
            break;
          case "end_flight":
            await updateFlightStatus(currentFlight.id, "completed");
            setCurrentFlight({ ...currentFlight, status: "completed" });
            break;
          case "abort_flight":
            await updateFlightStatus(currentFlight.id, "aborted");
            setCurrentFlight({ ...currentFlight, status: "aborted" });
            break;
          case "resume_boarding":
            const resumed = (await resumeBoarding(currentFlight.id, 5)) as Flight;
            setCurrentFlight(resumed);
            break;
          case "resume_flight":
            const resumedFlight = (await resumeFlightApi(currentFlight.id)) as Flight;
            setCurrentFlight(resumedFlight);
            break;
          case "new_flight":
            setCurrentFlight(null);
            break;
        }
      } catch (err) {
        console.error(err);
      } finally {
        setActionLoading(null);
      }
    },
    [currentFlight, setCurrentFlight]
  );

  // No flight - show start controls
  if (!currentFlight) {
    return (
      <div className="space-y-6">
        <div>
          <h2 className="text-lg font-semibold text-sas-gray-900">Boarding Control</h2>
          <p className="text-sm text-sas-gray-500 mt-1">
            Starte das Boarding für einen importierten Flugplan.
          </p>
        </div>

        {!importedFlightPlan ? (
          <SASCard>
            <div className="text-center py-8">
              <Plane size={40} className="mx-auto text-sas-gray-300 mb-3" />
              <p className="text-sm text-sas-gray-500">
                Importiere zuerst einen SimBrief Flugplan im &quot;SimBrief&quot; Tab.
              </p>
            </div>
          </SASCard>
        ) : (
          <SASCard>
            <div className="space-y-4">
              <div>
                <label className="text-sm font-medium text-sas-gray-700 block mb-1.5">
                  Twitch Channel für Boarding
                </label>
                <select
                  value={selectedChannel}
                  onChange={(e) => setSelectedChannel(e.target.value)}
                  className="w-full px-4 py-2.5 border border-sas-gray-200 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-sas-blue bg-white cursor-pointer"
                >
                  <option value="">Channel wählen...</option>
                  {channels.map((ch) => (
                    <option key={ch.id} value={ch.channel_name}>
                      {ch.channel_name}
                    </option>
                  ))}
                </select>
              </div>

              <SASButton
                variant="gold"
                size="lg"
                onClick={handleStartBoarding}
                loading={loading}
                disabled={!selectedChannel}
                className="w-full"
              >
                <Play size={18} />
                Boarding starten
              </SASButton>
              {error && (
                <p className="text-sm font-medium text-red-600">{error}</p>
              )}
            </div>
          </SASCard>
        )}
      </div>
    );
  }

  // Active flight - show controls and overview
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-lg font-semibold text-sas-gray-900">Boarding Control</h2>
          <p className="text-sm text-sas-gray-500 mt-1">
            Flug {currentFlight.flight_number || `#${currentFlight.id}`} · {currentFlight.status}
          </p>
        </div>

        {/* Action Buttons */}
        <div className="flex gap-2">
          {currentFlight.status === "boarding" && (
            <>
              <SASButton
                variant="primary"
                size="sm"
                onClick={() => handleAction("end_boarding")}
                loading={actionLoading === "end_boarding"}
              >
                <CheckCircle size={14} />
                Boarding beenden
              </SASButton>
              <SASButton
                variant="danger"
                size="sm"
                onClick={() => handleAction("cancel_boarding")}
                loading={actionLoading === "cancel_boarding"}
              >
                <XCircle size={14} />
                Abbrechen
              </SASButton>
            </>
          )}

          {currentFlight.status === "in_flight" && (
            <>
              <SASButton
                variant="primary"
                size="sm"
                onClick={() => handleAction("end_flight")}
                loading={actionLoading === "end_flight"}
              >
                <Square size={14} />
                Flug beenden
              </SASButton>
              <SASButton
                variant="danger"
                size="sm"
                onClick={() => handleAction("abort_flight")}
                loading={actionLoading === "abort_flight"}
              >
                <AlertTriangle size={14} />
                Abbrechen
              </SASButton>
            </>
          )}

          {(currentFlight.status === "cancelled" || currentFlight.status === "aborted") && (
            <>
              <SASButton
                variant="secondary"
                size="sm"
                onClick={() => handleAction(currentFlight.status === "cancelled" ? "resume_boarding" : "resume_flight")}
                loading={actionLoading === "resume_boarding" || actionLoading === "resume_flight"}
              >
                <RotateCcw size={14} />
                Wiederherstellen
              </SASButton>
              <SASButton
                variant="ghost"
                size="sm"
                onClick={() => handleAction("new_flight")}
              >
                Neuer Flug
              </SASButton>
            </>
          )}

          {currentFlight.status === "completed" && (
            <SASButton
              variant="ghost"
              size="sm"
              onClick={() => handleAction("new_flight")}
            >
              Neuer Flug
            </SASButton>
          )}
        </div>
      </div>

      {/* Boarding Overview */}
      <BoardingOverview flight={currentFlight} />
    </div>
  );
}
