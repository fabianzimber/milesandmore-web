import type { Metadata } from "next";
import { Inter, Libre_Barcode_128 } from "next/font/google";
import SessionProvider from "@/components/SessionProvider";
import "./globals.css";

const inter = Inter({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700", "800"],
  variable: "--font-inter",
});

const barcode = Libre_Barcode_128({
  subsets: ["latin"],
  weight: "400",
  variable: "--font-barcode",
});

const APP_URL = process.env.NEXT_PUBLIC_APP_URL || "https://milesandmore.live";
const DEFAULT_DESCRIPTION =
  "Sammle Meilen, erkunde neue Länder und climb das globale Ranking — direkt aus dem Twitch-Stream heraus.";

export const metadata: Metadata = {
  metadataBase: new URL(APP_URL),
  title: {
    default: "Miles & More",
    template: "%s · Miles & More",
  },
  description: DEFAULT_DESCRIPTION,
  keywords: ["Miles & More", "Twitch", "Flight Simulator", "Leaderboard", "Meilen", "Twitch Bot"],
  authors: [{ name: "Miles & More" }],
  openGraph: {
    type: "website",
    siteName: "Miles & More",
    title: {
      default: "Miles & More",
      template: "%s · Miles & More",
    },
    description: DEFAULT_DESCRIPTION,
    images: [
      {
        url: "/opengraph-image",
        width: 1200,
        height: 630,
        alt: "Miles & More — Twitch Flight Operations",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: {
      default: "Miles & More",
      template: "%s · Miles & More",
    },
    description: DEFAULT_DESCRIPTION,
    images: ["/opengraph-image"],
  },
  icons: {
    icon: [
      { url: "/favicon-16x16.png", sizes: "16x16", type: "image/png" },
      { url: "/favicon-32x32.png", sizes: "32x32", type: "image/png" },
      { url: "/favicon.ico" },
    ],
    apple: { url: "/apple-touch-icon.png", sizes: "180x180" },
    other: [
      { rel: "mask-icon", url: "/logo.svg", color: "#3D2668" },
    ],
  },
  manifest: "/manifest.webmanifest",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="de" className={`h-full antialiased ${inter.variable} ${barcode.variable}`}>
      <body className="min-h-full flex flex-col font-sans bg-background text-foreground">
        <SessionProvider>
          {children}
        </SessionProvider>
      </body>
    </html>
  );
}
