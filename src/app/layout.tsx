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

export const metadata: Metadata = {
  title: "Miles & More — Twitch Flight Operations",
  description: "Twitch flight boarding bot, admin cockpit and passenger dashboard running on Next.js and Vercel.",
  icons: {
    icon: [
      { url: "/favicon-16x16.png", sizes: "16x16", type: "image/png" },
      { url: "/favicon-32x32.png", sizes: "32x32", type: "image/png" },
      { url: "/favicon.ico" },
    ],
    apple: { url: "/apple-touch-icon.png", sizes: "180x180" },
  },
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
