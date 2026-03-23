import { ImageResponse } from "next/og";
import { getLogoDataUri } from "@/lib/ogHelpers";
import { getCommands } from "@/lib/botApi";
import type { CommandMetadata } from "@/lib/types";

export const runtime = "nodejs";
export const alt = "Command Atlas · Miles & More";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

export default async function OgImage() {
  const logo = await getLogoDataUri();

  let commands: CommandMetadata[] = [];
  try {
    commands = await getCommands();
  } catch { /* render without data */ }

  const featured = ["joinflight", "miles", "seat", "topmiles", "countries", "flights"];
  const shown = featured
    .map((name) => commands.find((c) => c.name === name))
    .filter(Boolean)
    .slice(0, 6) as CommandMetadata[];

  // Fallback if API not available
  const fallback = [
    { usage: "&joinflight" }, { usage: "&miles" }, { usage: "&seat" },
    { usage: "&topmiles" }, { usage: "&countries" }, { usage: "&flights" },
  ];
  const items = shown.length > 0 ? shown : fallback;

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
        <div style={{ position: "absolute", inset: 0, background: "radial-gradient(ellipse at 20% 50%, rgba(99,65,163,0.28) 0%, transparent 50%)" }} />
        <div style={{ position: "absolute", inset: 0, backgroundImage: "linear-gradient(rgba(255,255,255,0.025) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.025) 1px, transparent 1px)", backgroundSize: "60px 60px" }} />

        {/* Left */}
        <div style={{ display: "flex", flexDirection: "column", justifyContent: "flex-end", padding: "0 48px 60px 72px", flex: "0 0 480px", position: "relative" }}>
          <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 20 }}>
            <div style={{ width: 28, height: 2, background: "#9B82C8" }} />
            <span style={{ fontSize: 13, fontWeight: 600, letterSpacing: "0.14em", textTransform: "uppercase", color: "#9B82C8" }}>Command Atlas</span>
          </div>
          <div style={{ fontSize: 68, fontWeight: 900, color: "#FFFFFF", lineHeight: 1.05, letterSpacing: "-0.04em", marginBottom: 20 }}>
            Alle Commands auf einen Blick.
          </div>
          <div style={{ fontSize: 20, color: "rgba(255,255,255,0.5)", lineHeight: 1.5 }}>
            {commands.length > 0 ? `${commands.length} Commands` : "Alle Commands"} — von Joinflight bis Leaderboard.
          </div>
          <div style={{ display: "flex", alignItems: "center", gap: 12, marginTop: 36, paddingTop: 28, borderTop: "1px solid rgba(255,255,255,0.1)" }}>
            <img src={logo} style={{ width: 38, height: 38 }} />
            <span style={{ fontSize: 16, fontWeight: 700, color: "rgba(255,255,255,0.6)" }}>milesandmore.live</span>
          </div>
        </div>

        {/* Right — command chips */}
        <div style={{ flex: 1, display: "flex", flexDirection: "column", justifyContent: "center", padding: "48px 72px 48px 32px", gap: 14, position: "relative" }}>
          {items.map((cmd, i) => (
            <div
              key={i}
              style={{
                display: "flex",
                alignItems: "center",
                background: "rgba(255,255,255,0.07)",
                borderRadius: 14,
                border: "1px solid rgba(255,255,255,0.1)",
                padding: "14px 20px",
                gap: 16,
              }}
            >
              <div style={{ width: 8, height: 8, borderRadius: "50%", background: "#7B5CB5", flexShrink: 0 }} />
              <span style={{ fontSize: 18, fontWeight: 800, color: "#FFFFFF", fontFamily: "monospace", letterSpacing: "0.02em" }}>
                {cmd.usage}
              </span>
              {"description" in cmd && (
                <span style={{ fontSize: 14, color: "rgba(255,255,255,0.4)", marginLeft: "auto", maxWidth: 200, overflow: "hidden", display: "flex" }}>
                  {(cmd as CommandMetadata).description?.slice(0, 40)}{(cmd as CommandMetadata).description?.length > 40 ? "…" : ""}
                </span>
              )}
            </div>
          ))}
        </div>
      </div>
    ),
    { ...size }
  );
}
