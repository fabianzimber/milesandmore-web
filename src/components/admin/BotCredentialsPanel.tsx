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
        <h2 className="text-lg font-semibold text-foreground">Bot Runtime</h2>
        <p className="mt-1 text-sm text-foreground/50">
          Bot-Credentials liegen nur noch serverseitig. Das Cockpit zeigt nur den aktuellen Runtime-Status.
        </p>
      </div>

      <div className="grid gap-6 xl:grid-cols-[1.2fr_0.8fr]">
        <SASCard variant="glow">
          <div className="space-y-4">
            <div className="flex items-center gap-2 text-foreground">
              <KeyRound size={16} />
              <span className="text-sm font-semibold">Server-Secrets aktiv</span>
            </div>

            <p className="text-sm leading-6 text-foreground/50">
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

            {message && <p className="text-sm font-medium text-mm-success">{message}</p>}
            {error && <p className="text-sm font-medium text-red-600">{error}</p>}

            {settings.issues?.length ? (
              <div className="rounded-2xl border border-amber-500/20 bg-amber-500/10 px-4 py-4">
                <div className="mb-2 flex items-center gap-2 text-amber-400">
                  <TriangleAlert size={16} />
                  <span className="text-sm font-semibold">Offene Punkte</span>
                </div>
                <div className="space-y-1 text-sm text-amber-300/80">
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
            <div className="flex items-center gap-2 text-foreground/80">
              <ShieldCheck size={16} />
              <span className="text-sm font-semibold">Aktive Runtime</span>
            </div>
          </div>

          <div className="space-y-4 px-5 py-5 text-sm">
            <div className="flex items-center justify-between gap-4">
              <span className="text-foreground/50">Quelle</span>
              <span className="font-medium text-foreground">{settings.source === "redis" ? "Redis Runtime" : "Env Seed"}</span>
            </div>
            <div className="flex items-center justify-between gap-4">
              <span className="text-foreground/50">Runtime</span>
              <span className={`font-medium ${settings.credentialsValid ? "text-mm-success" : "text-red-600"}`}>
                {settings.credentialsValid ? "Bereit" : "Fehler"}
              </span>
            </div>
            <div className="flex items-center justify-between gap-4">
              <span className="text-foreground/50">App Client ID</span>
              <span className="max-w-[220px] truncate font-medium text-foreground">
                {settings.appClientId || "Nicht gesetzt"}
              </span>
            </div>
            <div className="flex items-center justify-between gap-4">
              <span className="text-foreground/50">Bot Client ID</span>
              <span className="max-w-[220px] truncate font-medium text-foreground">
                {settings.botClientId || "Nicht gesetzt"}
              </span>
            </div>
            <div className="flex items-center justify-between gap-4">
              <span className="text-foreground/50">Token</span>
              <span className="font-medium text-foreground">{settings.tokenPreview || "Nicht gesetzt"}</span>
            </div>
            <div className="flex items-center justify-between gap-4">
              <span className="text-foreground/50">Bot User</span>
              <span className="font-medium text-foreground">{settings.botUsername ? `@${settings.botUsername}` : "Unbekannt"}</span>
            </div>
            <div className="flex items-center justify-between gap-4">
              <span className="text-foreground/50">Scopes</span>
              <span className={`font-medium ${settings.requiredScopesOk ? "text-mm-success" : "text-red-600"}`}>
                {settings.requiredScopesOk ? "OK" : "Fehlen"}
              </span>
            </div>
            <div className="flex items-center justify-between gap-4">
              <span className="text-foreground/50">Scope-Liste</span>
              <span className="max-w-[220px] truncate font-medium text-foreground">
                {settings.scopes?.length ? settings.scopes.join(", ") : "Keine Daten"}
              </span>
            </div>
            <div className="flex items-center justify-between gap-4">
              <span className="text-foreground/50">Runtime Update</span>
              <span className="font-medium text-foreground">
                {settings.updatedAt ? new Date(settings.updatedAt).toLocaleString("de-DE") : "Noch keines"}
              </span>
            </div>
            <div className="flex items-center justify-between gap-4">
              <span className="text-foreground/50">Neu geladen</span>
              <span className="font-medium text-foreground">
                {settings.restartedAt ? new Date(settings.restartedAt).toLocaleString("de-DE") : "Noch nie"}
              </span>
            </div>
          </div>
        </SASCard>
      </div>
    </div>
  );
}
