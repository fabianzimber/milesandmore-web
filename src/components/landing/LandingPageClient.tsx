"use client";

import { useEffect, useRef } from "react";
import { motion } from "framer-motion";
import dynamic from "next/dynamic";
import Link from "next/link";
import Image from "next/image";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import {
  Trophy,
  Plane,
  Terminal,
  ChevronRight,
} from "lucide-react";
import Navigation from "@/components/layout/Navigation";
import ParallaxSection from "@/components/effects/ParallaxSection";

gsap.registerPlugin(ScrollTrigger);

const HeroGlobe = dynamic(() => import("@/components/effects/HeroGlobe"), {
  ssr: false,
});

interface LandingPageClientProps {
  totalPilots: number;
  totalMiles: number;
  totalFlights: number;
}

function AnimatedCounter({ value, suffix = "" }: { value: number; suffix?: string }) {
  const ref = useRef<HTMLSpanElement>(null);

  useEffect(() => {
    const el = ref.current;
    if (!el || value === 0) return;
    const prefersReducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (prefersReducedMotion) {
      el.textContent = value.toLocaleString("de-DE") + suffix;
      return;
    }

    const obj = { val: 0 };
    gsap.to(obj, {
      val: value,
      duration: 2,
      ease: "power2.out",
      scrollTrigger: {
        trigger: el,
        start: "top 85%",
        once: true,
      },
      onUpdate: () => {
        el.textContent = Math.round(obj.val).toLocaleString("de-DE") + suffix;
      },
    });
  }, [value, suffix]);

  return <span ref={ref}>0{suffix}</span>;
}

export default function LandingPageClient({
  totalPilots,
  totalMiles,
  totalFlights,
}: LandingPageClientProps) {
  return (
    <div className="relative min-h-screen bg-navy-950">
      <div className="noise-overlay" />
      <Navigation />

      {/* ═══════ Section 1: Hero ═══════ */}
      <section className="relative h-[100svh] min-h-[600px] flex items-center justify-center overflow-hidden">
        <HeroGlobe className="pointer-events-none" />

        {/* Typography overlay */}
        <div className="relative z-10 text-center px-6 max-w-5xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 1, ease: [0.22, 1, 0.36, 1] }}
          >
            <h1 className="mb-6">
              <span className="block text-[clamp(3rem,8vw,7rem)] font-extrabold tracking-[-0.04em] leading-[0.9] text-foreground">
                MILES &{" "}
              </span>
              <span className="block text-[clamp(3rem,8vw,7rem)] font-display italic font-normal tracking-[-0.02em] leading-[0.9] text-gold-400">
                More
              </span>
            </h1>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4, duration: 0.8, ease: [0.22, 1, 0.36, 1] }}
          >
            <p className="text-lg sm:text-xl text-foreground/50 max-w-2xl mx-auto leading-relaxed">
              Sammle Meilen. Erkunde die Welt. Steige im Ranking auf.
            </p>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.7, duration: 0.8 }}
            className="mt-10 flex flex-wrap items-center justify-center gap-4"
          >
            <Link
              href="/leaderboard"
              className="corner-bracket mono-label text-xs tracking-[0.2em] text-foreground/60 hover:text-gold-400 transition-colors"
            >
              LEADERBOARD
            </Link>
            <Link
              href="/commands"
              className="corner-bracket mono-label text-xs tracking-[0.2em] text-foreground/60 hover:text-gold-400 transition-colors"
            >
              COMMANDS
            </Link>
          </motion.div>
        </div>

        {/* Scroll indicator */}
        <motion.div
          className="absolute bottom-8 left-1/2 -translate-x-1/2 flex flex-col items-center gap-2"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1.2 }}
        >
          <span className="mono-label text-[9px] text-foreground/30 tracking-[0.3em]">SCROLL</span>
          <motion.div
            className="w-px h-8 bg-gradient-to-b from-gold-400/60 to-transparent"
            animate={{ scaleY: [0.3, 1, 0.3] }}
            transition={{ duration: 2, repeat: Infinity }}
          />
        </motion.div>
      </section>

      {/* ═══════ Section 2: Stats Strip ═══════ */}
      <section className="relative py-24 sm:py-32 border-y border-white/[0.06]">
        <div className="page-frame">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-12 sm:gap-8 text-center">
            {[
              { label: "PILOTEN", value: totalPilots, suffix: "" },
              { label: "MEILEN", value: totalMiles, suffix: "" },
              { label: "FLÜGE", value: totalFlights, suffix: "" },
            ].map((stat) => (
              <div key={stat.label}>
                <p className="mono-label text-[10px] text-foreground/30 tracking-[0.3em] mb-4">
                  {stat.label}
                </p>
                <p className="text-5xl sm:text-6xl lg:text-7xl font-extrabold tabular-nums text-foreground">
                  <AnimatedCounter value={stat.value} suffix={stat.suffix} />
                </p>
                <div className="mt-4 mx-auto w-12 h-px bg-gold-400/40" />
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ═══════ Section 3: Feature Triptych ═══════ */}
      <section className="relative py-24 sm:py-32">
        <div className="page-frame">
          <div className="text-center mb-16">
            <p className="eyebrow justify-center mb-4">Features</p>
            <h2 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold tracking-tight text-foreground">
              Deine <span className="display-accent text-gold-400">Flight</span> Experience
            </h2>
          </div>

          <div className="grid gap-6 sm:grid-cols-3">
            {[
              {
                icon: <Trophy size={24} />,
                title: "Leaderboard",
                desc: "Vergleiche dich mit anderen Piloten. Meilen, Länder, Rankings — alles live.",
                href: "/leaderboard",
              },
              {
                icon: <Plane size={24} />,
                title: "Live Flights",
                desc: "Boarding Pass, Sitzplan, Live-Tracking — das volle Flugerlebnis im Browser.",
                href: "/leaderboard",
              },
              {
                icon: <Terminal size={24} />,
                title: "Commands",
                desc: "Alle Chat-Befehle auf einen Blick. Schnell nachschlagen, sofort loslegen.",
                href: "/commands",
              },
            ].map((card, i) => (
              <ParallaxSection key={card.title} speed={0.05 * (i + 1)}>
                <Link href={card.href} className="group block">
                  <div className="surface-glass p-8 sm:p-10 transition-all duration-500 hover:border-gold-400/20 hover:shadow-[0_0_40px_rgba(200,169,110,0.06)]">
                    <div className="inline-flex rounded-xl bg-gold-400/10 p-3 text-gold-400 mb-6">
                      {card.icon}
                    </div>
                    <h3 className="text-xl font-bold text-foreground mb-3 tracking-tight">
                      {card.title}
                    </h3>
                    <p className="text-sm text-foreground/50 leading-relaxed mb-6">
                      {card.desc}
                    </p>
                    <span className="mono-label text-[10px] text-gold-400/60 group-hover:text-gold-400 transition-colors inline-flex items-center gap-1.5">
                      ENTDECKEN <ChevronRight size={12} />
                    </span>
                  </div>
                </Link>
              </ParallaxSection>
            ))}
          </div>
        </div>
      </section>

      {/* ═══════ Section 4: How It Works ═══════ */}
      <section className="relative py-24 sm:py-32 border-t border-white/[0.06]">
        <div className="page-frame">
          <div className="grid gap-16 lg:grid-cols-[0.8fr_1.2fr] lg:items-center">
            <div>
              <p className="eyebrow mb-4">Wie es funktioniert</p>
              <h2 className="text-3xl sm:text-4xl font-extrabold tracking-tight text-foreground mb-6">
                In vier Schritten zur{" "}
                <span className="display-accent text-gold-400">ersten Meile</span>
              </h2>
              <p className="text-foreground/50 leading-relaxed">
                Schreibe <code className="px-2 py-0.5 rounded-md bg-white/[0.06] text-gold-400 text-sm font-mono">&joinflight</code>{" "}
                im Chat wenn ein Flug startet. Jede Flugmeile landet automatisch auf deinem Konto.
              </p>
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
              {[
                { step: "01", text: "Flug startet im Stream", sub: "Der Streamer beginnt einen neuen Flug in MSFS" },
                { step: "02", text: "&joinflight im Chat", sub: "Einmal tippen genügt — du bist an Bord" },
                { step: "03", text: "Meilen werden gutgeschrieben", sub: "Automatisch basierend auf der Flugdistanz" },
                { step: "04", text: "Länder freigeschaltet", sub: "Neue Destinationen erweitern dein Profil" },
              ].map((item) => (
                <div key={item.step} className="surface-glass p-6 group">
                  <span className="mono-label text-gold-400/40 text-[10px] tracking-[0.3em]">
                    {item.step}
                  </span>
                  <p className="mt-3 text-base font-bold text-foreground">
                    {item.text}
                  </p>
                  <p className="mt-2 text-sm text-foreground/40 leading-relaxed">
                    {item.sub}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ═══════ Section 5: Footer ═══════ */}
      <footer className="relative py-16 border-t border-white/[0.06]">
        <div className="page-frame">
          <div className="flex flex-col items-center gap-8 text-center">
            <div className="flex items-center gap-3">
              <div className="flex h-8 w-8 items-center justify-center rounded-lg overflow-hidden bg-white/10 p-1">
                <Image src="/logo.svg" alt="Miles & More" width={24} height={24} className="w-full h-full object-contain" />
              </div>
              <span className="mono-label text-foreground/40 tracking-[0.2em] text-[10px]">
                MILES & MORE
              </span>
            </div>

            <div className="flex flex-wrap items-center justify-center gap-6">
              {[
                { href: "/leaderboard", label: "LEADERBOARD" },
                { href: "/commands", label: "COMMANDS" },
                { href: "/admin", label: "ADMIN" },
              ].map((link) => (
                <Link
                  key={link.href}
                  href={link.href}
                  className="mono-label text-[10px] text-foreground/30 hover:text-gold-400 transition-colors tracking-[0.2em]"
                >
                  {link.label}
                </Link>
              ))}
            </div>

            <p className="mono-label text-[9px] text-foreground/20 tracking-[0.2em] max-w-md">
              TWITCH-INTEGRATED AIRLINE SIMULATION — BUILT FOR THE COMMUNITY
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}
