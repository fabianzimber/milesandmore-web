"use client";

import { cn } from "@/lib/utils";

interface PageShellProps {
  children: React.ReactNode;
  className?: string;
  tone?: "night" | "control";
}

export default function PageShell({ children, className, tone = "night" }: PageShellProps) {
  return (
    <div className={cn("site-shell", tone === "night" ? "night-shell" : "control-shell", className)}>
      <div className="noise-mask" />
      {children}
    </div>
  );
}
