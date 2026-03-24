import { getMilesLeaderboard } from "@/lib/botApi";
import type { UserMiles } from "@/lib/types";
import LandingPageClient from "@/components/landing/LandingPageClient";

export const dynamic = "force-dynamic";

export default async function HomePage() {
  let milesBoard: UserMiles[] = [];

  try {
    milesBoard = await getMilesLeaderboard() as UserMiles[];
  } catch {
    // Render with zeros — landing page will show dashes
  }

  const totalPilots = milesBoard.length;
  const totalMiles = milesBoard.reduce((s, e) => s + e.total_miles, 0);
  const totalFlights = milesBoard.reduce((s, e) => s + e.total_flights, 0);

  return (
    <LandingPageClient
      totalPilots={totalPilots}
      totalMiles={totalMiles}
      totalFlights={totalFlights}
    />
  );
}
