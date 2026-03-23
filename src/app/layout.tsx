import type { Metadata } from "next";
import { Inter, Libre_Barcode_128 } from "next/font/google";
import SessionProvider from "@/components/SessionProvider";
import SmoothScrollProvider from "@/components/layout/SmoothScrollProvider";
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

export const metadata: Metadata = {
  title: "MilesAndMore — Twitch Flight Operations",
  description: "Twitch flight boarding bot, admin cockpit and passenger dashboard running on Next.js and Vercel.",
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
          <SmoothScrollProvider>{children}</SmoothScrollProvider>
        </SessionProvider>
      </body>
    </html>
  );
}
