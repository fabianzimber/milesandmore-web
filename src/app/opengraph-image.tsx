import { ImageResponse } from "next/og";
import { getLogoDataUri } from "@/lib/ogHelpers";

export const runtime = "nodejs";
export const alt = "Miles & More — Twitch Flight Operations";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

export default async function OgImage() {
  const logo = await getLogoDataUri();

  return new ImageResponse(
    (
      <div
        style={{
          width: 1200,
          height: 630,
          display: "flex",
          flexDirection: "column",
          justifyContent: "flex-end",
          background: "linear-gradient(135deg, #1A0F30 0%, #2D1B4E 55%, #1A0F30 100%)",
          position: "relative",
          overflow: "hidden",
          fontFamily: "system-ui, sans-serif",
        }}
      >
        {/* Radial glow accents */}
        <div
          style={{
            position: "absolute",
            inset: 0,
            background:
              "radial-gradient(ellipse at 20% 30%, rgba(99,65,163,0.35) 0%, transparent 45%), radial-gradient(ellipse at 80% 70%, rgba(61,38,104,0.4) 0%, transparent 45%)",
          }}
        />

        {/* Subtle grid lines */}
        <div
          style={{
            position: "absolute",
            inset: 0,
            backgroundImage:
              "linear-gradient(rgba(255,255,255,0.03) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.03) 1px, transparent 1px)",
            backgroundSize: "60px 60px",
          }}
        />

        {/* Large faded logo watermark */}
        <img
          src={logo}
          style={{
            position: "absolute",
            right: -40,
            top: "50%",
            transform: "translateY(-50%)",
            width: 520,
            height: 520,
            opacity: 0.08,
          }}
        />

        {/* Content */}
        <div
          style={{
            position: "relative",
            display: "flex",
            flexDirection: "column",
            padding: "0 72px 64px",
            gap: 0,
          }}
        >
          {/* Eyebrow */}
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: 10,
              marginBottom: 20,
            }}
          >
            <div style={{ width: 28, height: 2, background: "#9B82C8" }} />
            <span
              style={{
                fontSize: 14,
                fontWeight: 600,
                letterSpacing: "0.14em",
                textTransform: "uppercase",
                color: "#9B82C8",
              }}
            >
              Twitch Flight Operations
            </span>
          </div>

          {/* Title */}
          <div
            style={{
              fontSize: 80,
              fontWeight: 900,
              color: "#FFFFFF",
              lineHeight: 1.05,
              letterSpacing: "-0.04em",
              marginBottom: 24,
            }}
          >
            Miles &amp; More
          </div>

          {/* Description */}
          <div
            style={{
              fontSize: 24,
              color: "rgba(255,255,255,0.55)",
              lineHeight: 1.5,
              maxWidth: 640,
            }}
          >
            Sammle Meilen, erkunde neue Länder und climb das globale Ranking — direkt aus dem Twitch-Stream.
          </div>

          {/* Logo + site name bottom row */}
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: 14,
              marginTop: 40,
              paddingTop: 32,
              borderTop: "1px solid rgba(255,255,255,0.1)",
            }}
          >
            <img src={logo} style={{ width: 44, height: 44 }} />
            <span style={{ fontSize: 18, fontWeight: 700, color: "rgba(255,255,255,0.7)" }}>
              milesandmore.live
            </span>
          </div>
        </div>
      </div>
    ),
    { ...size }
  );
}
