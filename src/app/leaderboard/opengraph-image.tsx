import { ImageResponse } from "next/og";
import { getLogoDataUri } from "@/lib/ogHelpers";
import { getCountryLeaderboard, getMilesLeaderboard } from "@/lib/botApi";
import type { UserMiles } from "@/lib/types";
import type { CountryEntry } from "./page";

export const runtime = "nodejs";
export const alt = "Leaderboard · Miles & More";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

export default async function OgImage() {
  const logo = await getLogoDataUri();

  let top3Miles: UserMiles[] = [];
  let top3Countries: CountryEntry[] = [];
  try {
    [top3Miles, top3Countries] = await Promise.all([
      getMilesLeaderboard() as Promise<UserMiles[]>,
      getCountryLeaderboard() as Promise<CountryEntry[]>,
    ]);
    top3Miles = top3Miles.slice(0, 3);
    top3Countries = top3Countries.slice(0, 3);
  } catch { /* render without data */ }

  const medals = ["🥇", "🥈", "🥉"];

  return new ImageResponse(
    (
      <div
        style={{
          width: 1200,
          height: 630,
          display: "flex",
          background: "linear-gradient(135deg, #1A0F30 0%, #2D1B4E 55%, #1A0F30 100%)",
          position: "relative",
          overflow: "hidden",
          fontFamily: "system-ui, sans-serif",
        }}
      >
        {/* Glow accents */}
        <div style={{ position: "absolute", inset: 0, background: "radial-gradient(ellipse at 15% 40%, rgba(99,65,163,0.3) 0%, transparent 50%), radial-gradient(ellipse at 85% 60%, rgba(61,38,104,0.35) 0%, transparent 45%)" }} />
        <div style={{ position: "absolute", inset: 0, backgroundImage: "linear-gradient(rgba(255,255,255,0.025) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.025) 1px, transparent 1px)", backgroundSize: "60px 60px" }} />

        {/* Left column — headline */}
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            justifyContent: "flex-end",
            padding: "0 48px 60px 72px",
            flex: "0 0 520px",
            position: "relative",
          }}
        >
          <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 20 }}>
            <div style={{ width: 28, height: 2, background: "#9B82C8" }} />
            <span style={{ fontSize: 13, fontWeight: 600, letterSpacing: "0.14em", textTransform: "uppercase", color: "#9B82C8" }}>
              Global Rankings
            </span>
          </div>
          <div style={{ fontSize: 72, fontWeight: 900, color: "#FFFFFF", lineHeight: 1.05, letterSpacing: "-0.04em", marginBottom: 20 }}>
            Wer fliegt am weitesten?
          </div>
          <div style={{ fontSize: 20, color: "rgba(255,255,255,0.5)", lineHeight: 1.5 }}>
            Meilen sammeln, Länder erkunden, Ranking erklimmen.
          </div>

          <div style={{ display: "flex", alignItems: "center", gap: 12, marginTop: 36, paddingTop: 28, borderTop: "1px solid rgba(255,255,255,0.1)" }}>
            <img src={logo} style={{ width: 38, height: 38 }} />
            <span style={{ fontSize: 16, fontWeight: 700, color: "rgba(255,255,255,0.6)" }}>milesandmore.live</span>
          </div>
        </div>

        {/* Right column — live leaderboard preview */}
        <div
          style={{
            flex: 1,
            display: "flex",
            flexDirection: "column",
            justifyContent: "center",
            padding: "48px 72px 48px 32px",
            gap: 16,
            position: "relative",
          }}
        >
          {/* Miles card */}
          <div style={{ display: "flex", flexDirection: "column", background: "rgba(255,255,255,0.06)", borderRadius: 20, border: "1px solid rgba(255,255,255,0.1)", padding: "20px 24px", gap: 10 }}>
            <div style={{ fontSize: 11, fontWeight: 700, letterSpacing: "0.12em", textTransform: "uppercase", color: "#9B82C8", marginBottom: 4 }}>
              ✈ Miles Ranking
            </div>
            {top3Miles.length === 0 && (
              <div style={{ fontSize: 16, color: "rgba(255,255,255,0.3)" }}>Noch keine Daten</div>
            )}
            {top3Miles.map((e, i) => (
              <div key={e.user_name} style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                  <span style={{ fontSize: 20 }}>{medals[i]}</span>
                  <span style={{ fontSize: 17, fontWeight: 700, color: "#FFFFFF" }}>{e.user_name}</span>
                </div>
                <span style={{ fontSize: 15, fontWeight: 800, color: "#BAA8DA" }}>{e.total_miles.toLocaleString("de-DE")} mi</span>
              </div>
            ))}
          </div>

          {/* Countries card */}
          <div style={{ display: "flex", flexDirection: "column", background: "rgba(255,255,255,0.06)", borderRadius: 20, border: "1px solid rgba(255,255,255,0.1)", padding: "20px 24px", gap: 10 }}>
            <div style={{ fontSize: 11, fontWeight: 700, letterSpacing: "0.12em", textTransform: "uppercase", color: "#9B82C8", marginBottom: 4 }}>
              🌍 Country Ranking
            </div>
            {top3Countries.length === 0 && (
              <div style={{ fontSize: 16, color: "rgba(255,255,255,0.3)" }}>Noch keine Daten</div>
            )}
            {top3Countries.map((e, i) => (
              <div key={e.user_name} style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                  <span style={{ fontSize: 20 }}>{medals[i]}</span>
                  <span style={{ fontSize: 17, fontWeight: 700, color: "#FFFFFF" }}>{e.user_name}</span>
                </div>
                <span style={{ fontSize: 15, fontWeight: 800, color: "#BAA8DA" }}>{e.countries_count} Länder</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    ),
    { ...size }
  );
}
