import LandingPageClient from "@/components/landing/LandingPageClient";
import { getCountryLeaderboard, getMilesLeaderboard } from "@/lib/botApi";
import type { UserMiles } from "@/lib/types";

interface CountryEntry {
  user_name: string;
  total_miles: number;
  countries_count: number;
}

export const dynamic = "force-dynamic";

export default async function HomePage() {
  let milesBoard: UserMiles[] = [];
  let countryBoard: CountryEntry[] = [];

  try {
    [milesBoard, countryBoard] = await Promise.all([
      getMilesLeaderboard() as Promise<UserMiles[]>,
      getCountryLeaderboard() as Promise<CountryEntry[]>,
    ]);
  } catch {
    // fall back to zeros while the client still renders the landing shell
  }

  const stats = {
    pilots: milesBoard.length,
    miles: milesBoard.reduce((sum, entry) => sum + entry.total_miles, 0),
    flights: milesBoard.reduce((sum, entry) => sum + entry.total_flights, 0),
  };

  return (
    <LandingPageClient
      stats={stats}
      topPilot={milesBoard[0]?.user_name ?? null}
      topExplorer={countryBoard[0]?.user_name ?? null}
    />
  );
}
