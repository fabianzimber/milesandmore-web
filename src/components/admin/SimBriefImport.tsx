"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import SASButton from "@/components/ui/SASButton";
import SASCard from "@/components/ui/SASCard";
import { importSimBrief } from "@/lib/botApi";
import { formatDistance, formatDuration } from "@/lib/utils";
import { Download, Plane, MapPin, Clock, Ruler, Check } from "lucide-react";
import type { SimBriefFlightPlan } from "@/lib/types";

interface SimBriefImportProps {
  onImport: (plan: Record<string, unknown>) => void;
  importedPlan: Record<string, unknown> | null;
}

export default function SimBriefImport({ onImport, importedPlan }: SimBriefImportProps) {
  const [pilotId, setPilotId] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [preview, setPreview] = useState<SimBriefFlightPlan | null>(null);

  const handleFetch = async () => {
    if (!pilotId.trim()) return;
    setLoading(true);
    setError(null);

    try {
      const plan = (await importSimBrief(pilotId.trim())) as SimBriefFlightPlan;
      setPreview(plan);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Fehler beim Laden");
    } finally {
      setLoading(false);
    }
  };

  const handleConfirm = () => {
    if (preview) {
      onImport(preview as unknown as Record<string, unknown>);
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-lg font-semibold text-foreground">SimBrief Flugplan Import</h2>
        <p className="text-sm text-foreground/50 mt-1">
          Gib deine SimBrief Pilot ID oder deinen Benutzernamen ein, um den aktuellen Flugplan zu laden.
        </p>
      </div>

      {/* Input */}
      <SASCard>
        <div className="flex gap-3">
          <input
            type="text"
            value={pilotId}
            onChange={(e) => setPilotId(e.target.value)}
            placeholder="SimBrief Pilot ID oder Username"
            className="flex-1 px-4 py-2.5 border border-white/[0.06] rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-aviation-blue focus:border-transparent"
            onKeyDown={(e) => e.key === "Enter" && handleFetch()}
          />
          <SASButton onClick={handleFetch} loading={loading}>
            <Download size={16} />
            Laden
          </SASButton>
        </div>

        {error && (
          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="mt-3 text-sm text-mm-destructive"
          >
            {error}
          </motion.p>
        )}
      </SASCard>

      {/* Preview */}
      {preview && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3 }}
        >
          <SASCard variant="elevated">
            <div className="space-y-6">
              {/* Route Header */}
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <div className="text-center">
                    <p className="text-2xl font-bold text-foreground">{preview.origin.icao}</p>
                    <p className="text-xs text-foreground/50">{preview.origin.name}</p>
                  </div>
                  <div className="flex items-center gap-2 text-foreground/30">
                    <div className="w-12 h-px bg-foreground/30" />
                    <Plane size={20} className="text-gold-400" />
                    <div className="w-12 h-px bg-foreground/30" />
                  </div>
                  <div className="text-center">
                    <p className="text-2xl font-bold text-foreground">{preview.destination.icao}</p>
                    <p className="text-xs text-foreground/50">{preview.destination.name}</p>
                  </div>
                </div>

                <div className="text-right">
                  <p className="text-lg font-semibold text-foreground">{preview.flight_number}</p>
                  <p className="text-xs text-foreground/50">{preview.aircraft.name}</p>
                </div>
              </div>

              {/* Details Grid */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <DetailItem
                  icon={<Ruler size={16} />}
                  label="Distance"
                  value={formatDistance(preview.distance_nm)}
                />
                <DetailItem
                  icon={<Clock size={16} />}
                  label="ETE"
                  value={formatDuration(preview.estimated_time_enroute)}
                />
                <DetailItem
                  icon={<Plane size={16} />}
                  label="Cruise"
                  value={`FL${Math.round(preview.cruise_altitude / 100)}`}
                />
                <DetailItem
                  icon={<MapPin size={16} />}
                  label="Aircraft"
                  value={preview.aircraft.icao}
                />
              </div>

              {/* Seat Config */}
              {preview.seat_config && (
                <div className="bg-white/[0.03] rounded-md p-3 text-sm">
                  <span className="text-foreground/50">Sitzplan:</span>{" "}
                  <span className="font-medium">{preview.seat_config}</span> ·{" "}
                  <span className="text-foreground/50">{preview.total_seats} Sitze</span>
                </div>
              )}

              {/* Route */}
              {preview.route && (
                <div className="bg-white/[0.03] rounded-md p-3">
                  <p className="text-xs text-foreground/50 mb-1">Route</p>
                  <p className="text-xs font-mono text-foreground/70 break-all">{preview.route}</p>
                </div>
              )}

              {/* Confirm Button */}
              <div className="flex justify-end gap-3">
                {importedPlan && (importedPlan as unknown as SimBriefFlightPlan).ofp_id === preview.ofp_id ? (
                  <div className="flex items-center gap-2 text-mm-success text-sm font-medium">
                    <Check size={16} />
                    Importiert
                  </div>
                ) : (
                  <SASButton variant="gold" onClick={handleConfirm}>
                    <Check size={16} />
                    Flugplan übernehmen
                  </SASButton>
                )}
              </div>
            </div>
          </SASCard>
        </motion.div>
      )}
    </div>
  );
}

function DetailItem({
  icon,
  label,
  value,
}: {
  icon: React.ReactNode;
  label: string;
  value: string;
}) {
  return (
    <div className="flex items-start gap-2">
      <div className="text-foreground/40 mt-0.5">{icon}</div>
      <div>
        <p className="text-xs text-foreground/50">{label}</p>
        <p className="text-sm font-medium text-foreground/80">{value}</p>
      </div>
    </div>
  );
}
