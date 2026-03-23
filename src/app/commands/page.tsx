import type { Metadata } from "next";
import CommandsPageClient from "@/components/commands/CommandsPageClient";
import { getCommands } from "@/lib/botApi";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Command Atlas",
  description:
    "Alle Miles & More Twitch-Commands auf einen Blick — von &joinflight bis &topmiles. Filtere nach Kategorie und finde den richtigen Befehl sofort.",
  openGraph: {
    title: "Command Atlas · Miles & More",
    description:
      "Alle Twitch-Commands für Miles & More — Flight, Stats, Info und Admin-Befehle mit Cooldowns und Berechtigungen.",
  },
  twitter: {
    title: "Command Atlas · Miles & More",
    description: "Alle Miles & More Twitch-Commands auf einen Blick.",
  },
};

export default async function CommandsPage() {
  return <CommandsPageClient initialCommands={await getCommands()} />;
}
