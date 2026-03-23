import LeaderboardPageClient from "@/components/leaderboard/LeaderboardPageClient";
import { getCountryLeaderboard, getMilesLeaderboard } from "@/lib/botApi";
import type { UserMiles } from "@/lib/types";

export const dynamic = "force-dynamic";

export interface CountryEntry {
  user_name: string;
  total_miles: number;
  countries_count: number;
}

export default async function LeaderboardPage() {
  let milesBoard: UserMiles[] = [];
  let countryBoard: CountryEntry[] = [];

  try {
    [milesBoard, countryBoard] = await Promise.all([
      getMilesLeaderboard() as Promise<UserMiles[]>,
      getCountryLeaderboard() as Promise<CountryEntry[]>,
    ]);
  } catch {
    // Render with empty data — client will show placeholders
  }

  return (
    <LeaderboardPageClient
      initialMilesBoard={milesBoard}
      initialCountryBoard={countryBoard}
    />
  );
}
