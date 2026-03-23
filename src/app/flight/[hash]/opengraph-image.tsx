import { ImageResponse } from "next/og";
import { getLogoDataUri } from "@/lib/ogHelpers";
import { getParticipant } from "@/lib/botApi";
import type { ParticipantLookupResult } from "@/lib/types";

export const runtime = "nodejs";
export const alt = "Boarding Pass · Miles & More";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

function statusLabel(status: string) {
  if (status === "boarding") return { text: "Boarding", color: "#22C55E" };
  if (status === "in_flight") return { text: "In der Luft", color: "#3B82F6" };
  if (status === "completed") return { text: "Gelandet", color: "#9B82C8" };
  return { text: "Bereit", color: "#9B82C8" };
}

export default async function OgImage({
  params,
}: {
  params: Promise<{ hash: string }>;
}) {
  const { hash } = await params;
  const logo = await getLogoDataUri();

  let data: ParticipantLookupResult | null = null;
  try {
    data = await getParticipant(hash);
  } catch { /* no data */ }

  const passenger = data?.user_name ?? "Passagier";
  const from = data?.icao_from ?? "???";
  const to = data?.icao_to ?? "???";
  const depName = data?.dep_name ?? from;
  const arrName = data?.arr_name ?? to;
  const flightNo = data?.flight_number ?? "M&M";
  const aircraft = data?.aircraft_name ?? "Unbekannt";
  const miles = data?.miles_earned ?? 0;
  const status = statusLabel(String(data?.flight_status ?? "boarding"));
  const seat = data?.seat ?? "—";

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
        {/* Background glows */}
        <div style={{ position: "absolute", inset: 0, background: "radial-gradient(ellipse at 10% 50%, rgba(99,65,163,0.35) 0%, transparent 45%), radial-gradient(ellipse at 90% 20%, rgba(61,38,104,0.3) 0%, transparent 40%)" }} />
        <div style={{ position: "absolute", inset: 0, backgroundImage: "linear-gradient(rgba(255,255,255,0.025) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.025) 1px, transparent 1px)", backgroundSize: "60px 60px" }} />

        {/* ── Boarding pass card ── */}
        <div
          style={{
            position: "absolute",
            top: 60,
            left: 72,
            right: 72,
            bottom: 60,
            display: "flex",
            background: "rgba(255,255,255,0.05)",
            borderRadius: 28,
            border: "1px solid rgba(255,255,255,0.12)",
            overflow: "hidden",
          }}
        >
          {/* Left section */}
          <div style={{ flex: 1, display: "flex", flexDirection: "column", padding: "40px 44px", justifyContent: "space-between" }}>
            {/* Top row: logo + flight number + status */}
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
              <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                <img src={logo} style={{ width: 36, height: 36 }} />
                <span style={{ fontSize: 15, fontWeight: 700, color: "rgba(255,255,255,0.6)", letterSpacing: "0.06em" }}>
                  Miles &amp; More
                </span>
              </div>
              <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                <div style={{ width: 8, height: 8, borderRadius: "50%", background: status.color }} />
                <span style={{ fontSize: 13, fontWeight: 700, color: status.color, letterSpacing: "0.1em", textTransform: "uppercase" }}>
                  {status.text}
                </span>
              </div>
            </div>

            {/* Route */}
            <div style={{ display: "flex", flexDirection: "column", gap: 4 }}>
              <div style={{ display: "flex", alignItems: "center", gap: 0 }}>
                <div style={{ display: "flex", flexDirection: "column", alignItems: "flex-start" }}>
                  <span style={{ fontSize: 72, fontWeight: 900, color: "#FFFFFF", letterSpacing: "-0.04em", lineHeight: 1 }}>{from}</span>
                  <span style={{ fontSize: 14, color: "rgba(255,255,255,0.45)", marginTop: 4, maxWidth: 160, overflow: "hidden" }}>{depName}</span>
                </div>
                <div style={{ flex: 1, display: "flex", flexDirection: "column", alignItems: "center", padding: "0 20px", gap: 6 }}>
                  <span style={{ fontSize: 22, color: "rgba(255,255,255,0.3)" }}>✈</span>
                  <div style={{ width: "100%", height: 1, background: "rgba(255,255,255,0.15)" }} />
                  <span style={{ fontSize: 11, color: "rgba(255,255,255,0.3)", letterSpacing: "0.1em" }}>{flightNo}</span>
                </div>
                <div style={{ display: "flex", flexDirection: "column", alignItems: "flex-end" }}>
                  <span style={{ fontSize: 72, fontWeight: 900, color: "#FFFFFF", letterSpacing: "-0.04em", lineHeight: 1 }}>{to}</span>
                  <span style={{ fontSize: 14, color: "rgba(255,255,255,0.45)", marginTop: 4, maxWidth: 160, overflow: "hidden", textAlign: "right" }}>{arrName}</span>
                </div>
              </div>
            </div>

            {/* Passenger name */}
            <div style={{ display: "flex", flexDirection: "column", gap: 4 }}>
              <span style={{ fontSize: 11, fontWeight: 600, letterSpacing: "0.14em", textTransform: "uppercase", color: "rgba(255,255,255,0.35)" }}>Passagier</span>
              <span style={{ fontSize: 32, fontWeight: 900, color: "#FFFFFF", letterSpacing: "-0.02em" }}>{passenger}</span>
            </div>
          </div>

          {/* Tear line */}
          <div style={{ width: 1, background: "radial-gradient(circle, rgba(255,255,255,0.15) 2px, transparent 2px)", backgroundSize: "10px 10px", backgroundPosition: "center", alignSelf: "stretch" }} />

          {/* Right stub */}
          <div style={{ width: 220, display: "flex", flexDirection: "column", justifyContent: "space-between", padding: "40px 32px", background: "rgba(255,255,255,0.03)" }}>
            {[
              { label: "Sitz", value: seat },
              { label: "Flugzeug", value: aircraft.length > 14 ? aircraft.slice(0, 14) + "…" : aircraft },
              { label: "Meilen", value: miles > 0 ? `+${miles.toLocaleString("de-DE")}` : "—" },
            ].map((item) => (
              <div key={item.label} style={{ display: "flex", flexDirection: "column", gap: 4 }}>
                <span style={{ fontSize: 10, fontWeight: 600, letterSpacing: "0.14em", textTransform: "uppercase", color: "rgba(255,255,255,0.3)" }}>{item.label}</span>
                <span style={{ fontSize: item.label === "Sitz" ? 40 : 20, fontWeight: 900, color: "#FFFFFF" }}>{item.value}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    ),
    { ...size }
  );
}
