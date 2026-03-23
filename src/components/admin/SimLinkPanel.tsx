"use client";

import { useMemo, useState, useEffect } from "react";
import { motion } from "framer-motion";
import SASCard from "@/components/ui/SASCard";
import { formatAltitude, formatSpeed } from "@/lib/utils";
import { getSimLinkStatus } from "@/lib/botApi";
import type { PositionUpdate } from "@/lib/types";
import { Radio, Compass, Gauge, Mountain, Navigation, KeyRound, Globe } from "lucide-react";

export default function SimLinkPanel() {
  const [connected, setConnected] = useState(false);
  const [position, setPosition] = useState<PositionUpdate | null>(null);
  const ingestUrl = useMemo(() => {
    if (typeof window === "undefined") return "/api/simlink/ingest";
    return `${window.location.origin}/api/simlink/ingest`;
  }, []);
  const relayCommand = useMemo(
    () =>
      `node simlink-relay.js "${ingestUrl}" "${process.env.NEXT_PUBLIC_SIMLINK_INGEST_SECRET_HINT || "SIMLINK_INGEST_SECRET"}"`,
    [ingestUrl],
  );

  useEffect(() => {
    const fetchStatus = async () => {
      try {
        const status = await getSimLinkStatus();
        setConnected(status.connected);
        if (status.lastData) {
          setPosition(status.lastData as unknown as PositionUpdate);
        }
      } catch {
        // ignore
      }
    };
    fetchStatus();
    const interval = setInterval(fetchStatus, 5000);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-lg font-semibold text-sas-gray-900">Navigraph SimLink</h2>
        <p className="text-sm text-sas-gray-500 mt-1">
          Sende Live-Flugdaten per signiertem HTTP-Relay an Vercel, statt den alten Bot-WebSocket zu verwenden.
        </p>
      </div>

      {/* Relay Control */}
      <SASCard>
        <div className="space-y-4">
          <div className={`flex items-center gap-2 text-sm font-medium ${connected ? "text-sas-green" : "text-sas-gray-400"}`}>
            <Radio size={18} />
            {connected ? "Relay aktiv" : "Warte auf Relay-Daten"}
          </div>

          <div className="grid gap-3 md:grid-cols-2">
            <div className="rounded-xl border border-sas-gray-200 bg-sas-gray-50 p-4">
              <div className="mb-2 flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.2em] text-sas-gray-400">
                <Globe size={14} />
                Ingest URL
              </div>
              <code className="block break-all text-xs text-sas-midnight">{ingestUrl}</code>
            </div>

            <div className="rounded-xl border border-sas-gray-200 bg-sas-gray-50 p-4">
              <div className="mb-2 flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.2em] text-sas-gray-400">
                <KeyRound size={14} />
                Secret
              </div>
              <p className="text-sm text-sas-gray-600">
                Nutze `SIMLINK_INGEST_SECRET` aus Vercel. Der Relay-Prozess sendet es als `x-simlink-secret`.
              </p>
            </div>
          </div>

          <div className="rounded-xl bg-sas-gray-900 p-4 font-mono text-xs text-sas-gray-200">
            {relayCommand}
          </div>
        </div>
      </SASCard>

      {/* Live Data */}
      {position && (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <SASCard variant="elevated">
            <h3 className="text-sm font-semibold text-sas-gray-700 mb-4">Live-Flugdaten</h3>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
              <DataItem
                icon={<Navigation size={18} />}
                label="Position"
                value={`${position.lat.toFixed(4)}° / ${position.lon.toFixed(4)}°`}
              />
              <DataItem
                icon={<Mountain size={18} />}
                label="Altitude"
                value={formatAltitude(position.alt)}
              />
              <DataItem
                icon={<Gauge size={18} />}
                label="Ground Speed"
                value={formatSpeed(position.speed)}
              />
              <DataItem
                icon={<Compass size={18} />}
                label="Heading"
                value={`${position.heading}°`}
              />
            </div>
          </SASCard>
        </motion.div>
      )}

      {/* Setup Instructions */}
      <SASCard padding="lg">
        <h3 className="text-sm font-semibold text-sas-gray-700 mb-3">Setup-Anleitung</h3>
        <ol className="text-sm text-sas-gray-600 space-y-2 list-decimal list-inside">
          <li>Installiere <strong>Navigraph SimLink</strong> und starte die Anwendung</li>
          <li>Starte <strong>MSFS2024</strong> und lade dein Flugzeug am Gate</li>
          <li>Setze lokal die Umgebungsvariable <code className="bg-sas-gray-100 px-1 rounded">SIMLINK_INGEST_SECRET</code></li>
          <li>Starte das angepasste <code className="bg-sas-gray-100 px-1 rounded">simlink-relay.js</code> Script mit der URL oben</li>
          <li>Das Relay liest lokal von <code className="bg-sas-gray-100 px-1 rounded">ws://localhost:8380</code> und postet die Daten an Vercel</li>
        </ol>
      </SASCard>
    </div>
  );
}

function DataItem({ icon, label, value }: { icon: React.ReactNode; label: string; value: string }) {
  return (
    <div className="flex items-start gap-3">
      <div className="text-sas-blue mt-0.5">{icon}</div>
      <div>
        <p className="text-xs text-sas-gray-500">{label}</p>
        <p className="text-lg font-semibold text-sas-midnight font-mono">{value}</p>
      </div>
    </div>
  );
}
