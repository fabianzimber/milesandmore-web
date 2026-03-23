import { redirect } from "next/navigation";
import AdminDashboard from "@/components/admin/AdminDashboard";
import { auth } from "@/auth";
import { getBotLogs, getBotSettings, getBotStatus, getFlights } from "@/lib/botApi";
import type { BotLogEntry, BotRuntimeSettings, BotStatus, Flight } from "@/lib/types";

export const dynamic = "force-dynamic";

export default async function AdminPage() {
  const session = await auth();
  if (!session?.user?.id) {
    redirect("/admin/signin");
  }

  const [status, botSettings, boarding, inFlight, logs]: [
    BotStatus,
    BotRuntimeSettings,
    Flight[],
    Flight[],
    BotLogEntry[],
  ] = await Promise.all([
    getBotStatus(),
    getBotSettings(),
    getFlights("boarding"),
    getFlights("in_flight"),
    getBotLogs(200),
  ]);

  return (
    <AdminDashboard
      initialCurrentFlight={boarding[0] || inFlight[0] || null}
      initialBotStatus={status}
      initialBotSettings={botSettings}
      initialLogs={logs}
    />
  );
}
