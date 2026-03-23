"use client";

import { useState } from "react";
import { KeyRound, RefreshCw, ShieldCheck, TriangleAlert } from "lucide-react";
import SASButton from "@/components/ui/SASButton";
import SASCard from "@/components/ui/SASCard";
import { getBotSettings, restartBot } from "@/lib/botApi";
import type { BotRuntimeSettings } from "@/lib/types";

type BotCredentialsPanelProps = {
  initialSettings: BotRuntimeSettings;
};

export default function BotCredentialsPanel({ initialSettings }: BotCredentialsPanelProps) {
  const [settings, setSettings] = useState<BotRuntimeSettings>(initialSettings);
  const [restarting, setRestarting] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const refreshSettings = async () => {
    const next = (await getBotSettings()) as BotRuntimeSettings;
    setSettings(next);
  };

  const handleRestart = async () => {
    setRestarting(true);
    setMessage(null);
    setError(null);
    try {
      await restartBot();
      await refreshSettings();
      setMessage("Bot neu geladen.");
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : "Neustart fehlgeschlagen.");
    } finally {
      setRestarting(false);
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-lg font-semibold text-sas-gray-900">Bot Runtime</h2>
        <p className="mt-1 text-sm text-sas-gray-500">
          Bot-Credentials liegen nur noch serverseitig. Das Cockpit zeigt nur den aktuellen Runtime-Status.
        </p>
      </div>

      <div className="grid gap-6 xl:grid-cols-[1.2fr_0.8fr]">
        <SASCard variant="glow">
          <div className="space-y-4">
            <div className="flex items-center gap-2 text-sas-midnight">
              <KeyRound size={16} />
              <span className="text-sm font-semibold">Server-Secrets aktiv</span>
            </div>

            <p className="text-sm leading-6 text-sas-gray-500">
              Die Twitch Dev Console App liefert `TWITCH_APP_CLIENT_ID` und `TWITCH_APP_CLIENT_SECRET`. Der Miles & More
              Twitch-Account liefert `TWITCH_BOT_CLIENT_ID`, `TWITCH_BOT_ACCESS_TOKEN` und `TWITCH_BOT_REFRESH_TOKEN`.
              Fuer eigene Kanaele muss der Bot anschliessend einmal Moderator sein.
            </p>

            <div className="flex flex-wrap gap-3">
              <SASButton variant="secondary" onClick={handleRestart} loading={restarting}>
                <RefreshCw size={14} />
                Runtime neu laden
              </SASButton>
            </div>

            {message && <p className="text-sm font-medium text-sas-green">{message}</p>}
            {error && <p className="text-sm font-medium text-red-600">{error}</p>}

            {settings.issues?.length ? (
              <div className="rounded-2xl border border-amber-200 bg-amber-50 px-4 py-4">
                <div className="mb-2 flex items-center gap-2 text-amber-800">
                  <TriangleAlert size={16} />
                  <span className="text-sm font-semibold">Offene Punkte</span>
                </div>
                <div className="space-y-1 text-sm text-amber-900">
                  {settings.issues.map((issue) => (
                    <p key={issue}>{issue}</p>
                  ))}
                </div>
              </div>
            ) : null}
          </div>
        </SASCard>

        <SASCard padding="none">
          <div className="border-b border-border px-5 py-3">
            <div className="flex items-center gap-2 text-sas-gray-800">
              <ShieldCheck size={16} />
              <span className="text-sm font-semibold">Aktive Runtime</span>
            </div>
          </div>

          <div className="space-y-4 px-5 py-5 text-sm">
            <div className="flex items-center justify-between gap-4">
              <span className="text-sas-gray-500">Quelle</span>
              <span className="font-medium text-sas-gray-900">{settings.source === "redis" ? "Redis Runtime" : "Env Seed"}</span>
            </div>
            <div className="flex items-center justify-between gap-4">
              <span className="text-sas-gray-500">Runtime</span>
              <span className={`font-medium ${settings.credentialsValid ? "text-sas-green" : "text-red-600"}`}>
                {settings.credentialsValid ? "Bereit" : "Fehler"}
              </span>
            </div>
            <div className="flex items-center justify-between gap-4">
              <span className="text-sas-gray-500">App Client ID</span>
              <span className="max-w-[220px] truncate font-medium text-sas-gray-900">
                {settings.appClientId || "Nicht gesetzt"}
              </span>
            </div>
            <div className="flex items-center justify-between gap-4">
              <span className="text-sas-gray-500">Bot Client ID</span>
              <span className="max-w-[220px] truncate font-medium text-sas-gray-900">
                {settings.botClientId || "Nicht gesetzt"}
              </span>
            </div>
            <div className="flex items-center justify-between gap-4">
              <span className="text-sas-gray-500">Token</span>
              <span className="font-medium text-sas-gray-900">{settings.tokenPreview || "Nicht gesetzt"}</span>
            </div>
            <div className="flex items-center justify-between gap-4">
              <span className="text-sas-gray-500">Bot User</span>
              <span className="font-medium text-sas-gray-900">{settings.botUsername ? `@${settings.botUsername}` : "Unbekannt"}</span>
            </div>
            <div className="flex items-center justify-between gap-4">
              <span className="text-sas-gray-500">Scopes</span>
              <span className={`font-medium ${settings.requiredScopesOk ? "text-sas-green" : "text-red-600"}`}>
                {settings.requiredScopesOk ? "OK" : "Fehlen"}
              </span>
            </div>
            <div className="flex items-center justify-between gap-4">
              <span className="text-sas-gray-500">Scope-Liste</span>
              <span className="max-w-[220px] truncate font-medium text-sas-gray-900">
                {settings.scopes?.length ? settings.scopes.join(", ") : "Keine Daten"}
              </span>
            </div>
            <div className="flex items-center justify-between gap-4">
              <span className="text-sas-gray-500">Runtime Update</span>
              <span className="font-medium text-sas-gray-900">
                {settings.updatedAt ? new Date(settings.updatedAt).toLocaleString("de-DE") : "Noch keines"}
              </span>
            </div>
            <div className="flex items-center justify-between gap-4">
              <span className="text-sas-gray-500">Neu geladen</span>
              <span className="font-medium text-sas-gray-900">
                {settings.restartedAt ? new Date(settings.restartedAt).toLocaleString("de-DE") : "Noch nie"}
              </span>
            </div>
          </div>
        </SASCard>
      </div>
    </div>
  );
}
