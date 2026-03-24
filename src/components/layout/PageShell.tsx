"use client";

import Navigation from "@/components/layout/Navigation";
import { cn } from "@/lib/utils";

interface PageShellProps {
  children: React.ReactNode;
  className?: string;
  tone?: "night" | "control";
  showNavigation?: boolean;
}

export default function PageShell({
  children,
  className,
  tone = "night",
  showNavigation = true,
}: PageShellProps) {
  return (
    <div className={cn("site-shell", tone === "night" ? "night-shell" : "control-shell", className)}>
      <div className="noise-mask" />
      <div className="pointer-events-none absolute inset-0 overflow-hidden">
        <div className="absolute left-[-12%] top-[-10%] h-[36rem] w-[36rem] rounded-full bg-[radial-gradient(circle,rgba(74,144,217,0.16),transparent_60%)] blur-3xl" />
        <div className="absolute right-[-10%] top-[12%] h-[28rem] w-[28rem] rounded-full bg-[radial-gradient(circle,rgba(200,169,110,0.14),transparent_60%)] blur-3xl" />
        <div className="absolute bottom-[-18%] left-[24%] h-[30rem] w-[30rem] rounded-full bg-[radial-gradient(circle,rgba(100,60,180,0.12),transparent_60%)] blur-3xl" />
      </div>
      {showNavigation ? <Navigation tone={tone} /> : null}
      <div className="relative z-10">{children}</div>
    </div>
  );
}
