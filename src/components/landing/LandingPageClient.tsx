"use client";

import { useEffect, useRef, useState } from "react";
import dynamic from "next/dynamic";
import Link from "next/link";
import { motion } from "framer-motion";
import gsap from "gsap";
import { Plane, Radar, TerminalSquare, Trophy } from "lucide-react";
import MagneticButton from "@/components/effects/MagneticButton";
import ParallaxSection from "@/components/effects/ParallaxSection";
import TextReveal from "@/components/effects/TextReveal";
import PageShell from "@/components/layout/PageShell";

const HeroGlobe = dynamic(() => import("@/components/effects/HeroGlobe"), {
  ssr: false,
});

interface LandingPageClientProps {
  stats: {
    pilots: number;
    miles: number;
    flights: number;
  };
  topPilot: string | null;
  topExplorer: string | null;
}

const FEATURES = [
  {
    title: "Leaderboard",
    description: "Verfolge die stärksten Vielflieger, Rekordländer und aktuelle Spitzenplätze live im Stream-Kontext.",
    href: "/leaderboard",
    icon: Trophy,
  },
  {
    title: "Live Flights",
    description: "Jeder Flug verbindet Chat, Boarding Pass, Seat Map und Live-Tracking zu einer einzigen Reiseoberfläche.",
    href: "/demo",
    icon: Radar,
  },
  {
    title: "Commands",
    description: "Die gesamte Command-Logik bleibt scanbar, filterbar und sofort einsatzbereit für Zuschauer und Moderation.",
    href: "/commands",
    icon: TerminalSquare,
  },
] as const;

const STEPS = [
  "Flug startet im Stream und öffnet das Boarding-Fenster.",
  "Zuschauer treten per &joinflight dem Flug bei.",
  "Jede Strecke schreibt automatisch Meilen und Länder gut.",
  "Leaderboard und persönliches Dashboard aktualisieren sich live.",
] as const;

function CountStat({
  label,
  value,
}: {
  label: string;
  value: number;
}) {
  const ref = useRef<HTMLParagraphElement>(null);
  const [display, setDisplay] = useState(0);

  useEffect(() => {
    const target = { value: 0 };
    const ctx = gsap.context(() => {
      gsap.to(target, {
        value,
        duration: 1.2,
        ease: "power3.out",
        onUpdate: () => {
          setDisplay(Math.round(target.value));
        },
      });
    }, ref);

    return () => ctx.revert();
  }, [value]);

  return (
    <div className="surface-glass px-5 py-5 sm:px-7 sm:py-6">
      <p className="mono-label !gap-2 !text-[0.62rem] !tracking-[0.2em] !text-sas-gray-500 before:hidden">{label}</p>
      <p ref={ref} className="mt-3 text-3xl font-black tracking-[-0.05em] text-foreground sm:text-4xl lg:text-5xl">
        {display.toLocaleString("de-DE")}
      </p>
    </div>
  );
}

export default function LandingPageClient({
  stats,
  topPilot,
  topExplorer,
}: LandingPageClientProps) {
  return (
    <PageShell tone="night">
      <main className="relative">
        <section className="relative min-h-[155svh]">
          <div className="sticky top-0 h-[100svh] overflow-hidden">
            <HeroGlobe />
            <div className="absolute inset-0 bg-[linear-gradient(180deg,rgba(5,5,16,0.15),rgba(5,5,16,0.35)_38%,rgba(5,5,16,0.74)_100%)]" />

            <div className="page-frame relative flex h-full flex-col justify-between pb-14 pt-30 sm:pb-16 sm:pt-36">
              <div className="grid gap-14 lg:grid-cols-[minmax(0,32rem)_1fr] lg:items-center lg:gap-20">
                <div className="max-w-[32rem]">
                  <span className="eyebrow">Twitch Flight Operations</span>
                  <div className="mt-6">
                    <TextReveal
                      text="MILES &"
                      as="h1"
                      className="display-heading text-glow-white"
                      partClassName="pr-[0.01em]"
                    />
                    <TextReveal
                      text="MORE"
                      as="p"
                      className="display-heading display-accent mt-1 text-gold-300"
                      partClassName="pr-[0.02em]"
                      delay={0.12}
                    />
                  </div>
                  <div className="mt-7 space-y-2.5 text-base leading-7 text-white/72 sm:text-lg sm:leading-8">
                    <TextReveal text="Sammle Meilen." as="p" mode="words" delay={0.18} />
                    <TextReveal text="Erkunde die Welt." as="p" mode="words" delay={0.28} />
                    <TextReveal text="Steige im Ranking auf." as="p" mode="words" delay={0.38} />
                  </div>
                  <p className="mt-7 max-w-md text-sm leading-7 text-white/56 sm:text-base sm:leading-8">
                    Miles & More verbindet Twitch-Community, Flugerlebnis und Echtzeitdaten zu einer einzigen,
                    cineastischen Vielflieger-Oberfläche.
                  </p>
                  <div className="mt-10 flex flex-wrap items-center gap-5">
                    <MagneticButton href="/leaderboard">Open Leaderboard</MagneticButton>
                    <Link
                      href="/commands"
                      className="text-[0.72rem] font-semibold uppercase tracking-[0.18em] text-white/66 transition-colors hover:text-foreground"
                    >
                      Command Atlas
                    </Link>
                  </div>
                </div>

                <div className="hidden justify-self-end lg:block lg:pr-4">
                  <div className="surface-gold-accent w-[min(28rem,34vw)] px-8 py-8">
                    <p className="mono-label !gap-2 !text-[0.62rem] !tracking-[0.2em] !text-sas-gray-500 before:hidden">
                      Current Signals
                    </p>
                    <div className="mt-6 space-y-5">
                      <div className="flex items-center justify-between border-b border-white/8 pb-4">
                        <span className="text-white/52">Top Pilot</span>
                        <span className="text-xl font-semibold text-foreground">{topPilot ?? "Wird geladen"}</span>
                      </div>
                      <div className="flex items-center justify-between border-b border-white/8 pb-4">
                        <span className="text-white/52">Top Explorer</span>
                        <span className="text-xl font-semibold text-foreground">{topExplorer ?? "Wird geladen"}</span>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-white/52">Live Surface</span>
                        <span className="inline-flex items-center gap-2 text-gold-300">
                          <span className="signal-dot" />
                          Active
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              <div className="grid gap-4 sm:grid-cols-3 lg:max-w-6xl">
                <CountStat label="Piloten" value={stats.pilots} />
                <CountStat label="Meilen" value={stats.miles} />
                <CountStat label="Flüge" value={stats.flights} />
              </div>
            </div>
          </div>
        </section>

        <section className="page-frame pt-16 sm:pt-24">
          <div className="mb-12 flex items-end justify-between gap-6 sm:mb-14">
            <div>
              <span className="eyebrow">Core Surfaces</span>
              <h2 className="mt-4 text-3xl font-black tracking-[-0.05em] text-foreground sm:text-5xl">
                Drei Oberflächen. <span className="display-accent text-gold-300">Ein</span> Luftbild.
              </h2>
            </div>
          </div>

          <div className="grid gap-6 lg:grid-cols-3">
            {FEATURES.map((feature, index) => {
              const Icon = feature.icon;

              return (
                <motion.article
                  key={feature.title}
                  initial={{ opacity: 0, y: 24 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true, margin: "-10% 0px" }}
                  transition={{ duration: 0.7, delay: index * 0.08, ease: [0.22, 1, 0.36, 1] }}
                  className="surface-glass card-hover-lift min-h-[22rem] px-7 py-8 sm:px-9 sm:py-10"
                >
                  <div className="inline-flex rounded-full border border-gold-300/20 bg-gold-400/10 p-3 text-gold-300">
                    <Icon size={18} />
                  </div>
                  <h3 className="mt-9 text-2xl font-black tracking-[-0.04em] text-foreground">{feature.title}</h3>
                  <p className="mt-5 max-w-sm text-sm leading-7 text-white/56">{feature.description}</p>
                  <Link
                    href={feature.href}
                    className="mt-10 inline-flex text-[0.72rem] font-semibold uppercase tracking-[0.18em] text-gold-300 transition-colors hover:text-foreground"
                  >
                    Open Surface
                  </Link>
                </motion.article>
              );
            })}
          </div>
        </section>

        <section className="page-frame py-16 sm:py-24">
          <ParallaxSection className="surface-gold-accent overflow-hidden px-7 py-10 sm:px-12 sm:py-14">
            <div className="grid gap-12 lg:grid-cols-[0.88fr_1.12fr] lg:items-start lg:gap-16">
              <div>
                <span className="eyebrow">Flight Loop</span>
                <h2 className="mt-4 text-3xl font-black tracking-[-0.05em] text-foreground sm:text-5xl">
                  So wird aus Chat ein <span className="display-accent text-gold-300">Passagierfluss</span>.
                </h2>
                <p className="mt-5 max-w-lg text-sm leading-7 text-white/58 sm:text-base sm:leading-8">
                  Die bestehende Logik bleibt intakt. Der neue Auftritt macht nur sichtbarer, wie sauber Boarding,
                  Tracking, Meilen und Ranking ineinandergreifen.
                </p>
              </div>

              <div className="grid gap-5 md:grid-cols-2">
                {STEPS.map((step, index) => (
                  <motion.div
                    key={step}
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true, margin: "-10% 0px" }}
                    transition={{ duration: 0.65, delay: index * 0.08 }}
                    className="surface-glass min-h-[13rem] px-6 py-6 sm:px-7 sm:py-7"
                  >
                    <div className="inline-flex h-10 w-10 items-center justify-center rounded-full border border-white/10 bg-white/5 text-sm font-semibold text-gold-300">
                      {String(index + 1).padStart(2, "0")}
                    </div>
                    <p className="mt-6 max-w-xs text-base leading-7 text-foreground">{step}</p>
                  </motion.div>
                ))}
              </div>
            </div>
          </ParallaxSection>
        </section>

        <section className="page-frame pb-20 pt-6 sm:pb-28">
          <div className="surface-glass px-7 py-9 sm:px-10 sm:py-12">
            <div className="grid gap-10 lg:grid-cols-[1fr_auto] lg:items-end">
              <div>
                <span className="eyebrow">Final Approach</span>
                <h2 className="mt-4 text-3xl font-black tracking-[-0.05em] text-foreground sm:text-5xl">
                  Bereit für den nächsten Flug?
                </h2>
                <p className="mt-4 max-w-xl text-sm leading-7 text-white/58 sm:text-base sm:leading-8">
                  Öffne Ranking, Commands oder den Passenger-Demo-Flow und prüfe die neue Oberfläche direkt im
                  operativen Kontext.
                </p>
              </div>
              <div className="flex flex-wrap gap-5">
                <MagneticButton href="/leaderboard">Leaderboard</MagneticButton>
                <MagneticButton href="/demo" className="text-white/72">
                  Demo Flight
                </MagneticButton>
              </div>
            </div>
          </div>

          <footer className="flex flex-col gap-5 py-12 text-sm text-white/42 sm:flex-row sm:items-center sm:justify-between">
            <div className="flex items-center gap-3">
              <Plane size={16} className="text-gold-300" />
              <span>Miles & More live surfaces for Twitch flight operations.</span>
            </div>
            <div className="flex flex-wrap gap-5 uppercase tracking-[0.16em]">
              <Link href="/leaderboard" className="hover:text-foreground">
                Leaderboard
              </Link>
              <Link href="/commands" className="hover:text-foreground">
                Commands
              </Link>
              <Link href="/admin" className="hover:text-foreground">
                Admin
              </Link>
            </div>
          </footer>
        </section>
      </main>
    </PageShell>
  );
}
